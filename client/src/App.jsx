import React, { useState, useEffect } from "react";
import "./App.css";
import Square from "./components/Game/Square";
import { io } from "socket.io-client";
import Swal from "sweetalert2";
import AIHelper from "./components/AIHelper/AIHelper";
import Leaderboard from "./components/Leaderboard/Leaderboard";
import {
  LeaderboardProvider,
  useLeaderboard,
} from "./contexts/LeaderboardContext";

const renderFrom = [
  [null, null, null],
  [null, null, null],
  [null, null, null],
];

const App = () => {
  const [gameState, setGameState] = useState(renderFrom);
  const [currentPlayer, setCurrentPlayer] = useState("circle");
  const [finishedState, setFinishetState] = useState(false);
  const [finishedArrayState, setFinishedArrayState] = useState([]);
  const [playOnline, setPlayOnline] = useState(false);
  const [socket, setSocket] = useState(null);
  const [playerName, setPlayerName] = useState("");
  const [opponentName, setOpponentName] = useState(null);
  const [playingAs, setPlayingAs] = useState(null);
  const [roomId, setRoomId] = useState(null);
  const [aiUsed, setAiUsed] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState(null);
  const [showLeaderboard, setShowLeaderboard] = useState(false);

  // Move this INSIDE the component!
  const { clearCache, fetchLeaderboard } = useLeaderboard();

  const checkWinner = () => {
    // row dynamic
    for (let row = 0; row < gameState.length; row++) {
      if (
        gameState[row][0] === gameState[row][1] &&
        gameState[row][1] === gameState[row][2]
      ) {
        setFinishedArrayState([row * 3 + 0, row * 3 + 1, row * 3 + 2]);
        return gameState[row][0];
      }
    }

    // column dynamic
    for (let col = 0; col < gameState.length; col++) {
      if (
        gameState[0][col] === gameState[1][col] &&
        gameState[1][col] === gameState[2][col]
      ) {
        setFinishedArrayState([0 * 3 + col, 1 * 3 + col, 2 * 3 + col]);
        return gameState[0][col];
      }
    }

    if (
      gameState[0][0] === gameState[1][1] &&
      gameState[1][1] === gameState[2][2]
    ) {
      setFinishedArrayState([0, 4, 8]);
      return gameState[0][0];
    }

    if (
      gameState[0][2] === gameState[1][1] &&
      gameState[1][1] === gameState[2][0]
    ) {
      setFinishedArrayState([2, 4, 6]);
      return gameState[0][2];
    }

    const isDrawMatch = gameState.flat().every((e) => {
      if (e === "circle" || e === "cross") return true;
    });

    if (isDrawMatch) return "draw";

    return null;
  };

  useEffect(() => {
    const winner = checkWinner();
    if (winner) {
      setFinishetState(winner);
      // Notify server about game end
      if (socket && winner !== "draw") {
        socket.emit("gameEnded", { winner, roomId });

        // Clear leaderboard cache so it fetches fresh data next time
        if (winner === playingAs) {
          clearCache();
        }
      }
    }
  }, [gameState, socket, roomId, playingAs, clearCache]);

  const takePlayerName = async () => {
    const result = await Swal.fire({
      title: "Enter your name",
      input: "text",
      showCancelButton: true,
      inputValidator: (value) => {
        if (!value) {
          return "You need to write something!";
        }
      },
    });

    return result;
  };

  // Socket event handlers
  socket?.on("opponentLeftMatch", () => {
    setFinishetState("opponentLeftMatch");
  });

  socket?.on("playerMoveFromServer", (data) => {
    const id = data.state.id;
    setGameState((prevState) => {
      let newState = [...prevState];
      const rowIndex = Math.floor(id / 3);
      const colIndex = id % 3;
      newState[rowIndex][colIndex] = data.state.sign;
      return newState;
    });
    setCurrentPlayer(data.state.sign === "circle" ? "cross" : "circle");
    setAiSuggestion(null); // Clear AI suggestion when move is made
  });

  socket?.on("connect", function () {
    setPlayOnline(true);
  });

  socket?.on("OpponentNotFound", function () {
    setOpponentName(false);
  });

  socket?.on("OpponentFound", function (data) {
    setPlayingAs(data.playingAs);
    setOpponentName(data.opponentName);
    setRoomId(data.roomId);
  });

  socket?.on("aiSuggestion", function (data) {
    setAiSuggestion(data.bestMove);
    setAiUsed(data.aiUsed);

    // Optional: Show a toast notification about AI source
    if (data.source === "gemini") {
      console.log("AI suggestion from Gemini");
    } else {
      console.log("AI suggestion from fallback algorithm");
    }
  });

  socket?.on("aiError", function (data) {
    console.error("AI Error:", data.message);

    // Show error to user
    Swal.fire({
      icon: "error",
      title: "AI Help Unavailable",
      text: data.message,
      timer: 3000,
      showConfirmButton: false,
    });
  });

  async function playOnlineClick() {
    const result = await takePlayerName();

    if (!result.isConfirmed) {
      return;
    }

    const username = result.value;
    setPlayerName(username);

    const newSocket = io("https://2f2f.nashi.lat", {
      autoConnect: true,
    });

    newSocket?.emit("request_to_play", {
      playerName: username,
    });

    setSocket(newSocket);
  }

  const handleAIHelp = () => {
    // Check if it's player's turn and they haven't used AI yet
    if (!aiUsed && currentPlayer === playingAs && !finishedState) {
      // Show loading state while waiting for AI
      Swal.fire({
        title: "AI is thinking...",
        text: "Getting the best move suggestion",
        allowOutsideClick: false,
        showConfirmButton: false,
        willOpen: () => {
          Swal.showLoading();
        },
      });

      socket.emit("requestAIHelp", {
        gameState,
        roomId,
      });

      // Close loading dialog when suggestion arrives
      socket.once("aiSuggestion", () => {
        Swal.close();
      });

      socket.once("aiError", () => {
        Swal.close();
      });
    }
  };

  const resetGame = () => {
    // Emit reset event before disconnecting
    if (socket && roomId) {
      socket.emit("resetGame", { roomId });
    }

    // Small delay to ensure server processes the reset
    setTimeout(() => {
      setGameState([
        [null, null, null],
        [null, null, null],
        [null, null, null],
      ]);
      setCurrentPlayer("circle");
      setFinishetState(false);
      setFinishedArrayState([]);
      setAiUsed(false);
      setAiSuggestion(null);
      setOpponentName(null);
      setPlayingAs(null);
      setRoomId(null);

      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
      setPlayOnline(false);
    }, 100);
  };

  if (showLeaderboard) {
    return (
      <div className="main-div">
        <Leaderboard onBack={() => setShowLeaderboard(false)} />
      </div>
    );
  }

  if (!playOnline) {
    return (
      <div className="main-div">
        <h1 className="game-heading">Tic Tac Toe Online</h1>
        <button onClick={playOnlineClick} className="playOnline">
          Play Online
        </button>
        <button onClick={() => setShowLeaderboard(true)} className="playOnline">
          View Leaderboard
        </button>
      </div>
    );
  }

  if (playOnline && !opponentName) {
    return (
      <div className="waiting">
        <p>Waiting for opponent...</p>
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="main-div">
      <div className="move-detection">
        <div
          className={`left ${
            currentPlayer === playingAs ? "current-move-" + currentPlayer : ""
          }`}
        >
          {playerName} {playingAs === "cross" ? "(Player 1)" : "(Player 2)"}
        </div>
        <div
          className={`right ${
            currentPlayer !== playingAs ? "current-move-" + currentPlayer : ""
          }`}
        >
          {opponentName} {playingAs === "cross" ? "(Player 2)" : "(Player 1)"}
        </div>
      </div>

      {playingAs === "cross" && (
        <AIHelper
          onUseAI={handleAIHelp}
          aiUsed={aiUsed}
          isMyTurn={currentPlayer === playingAs}
          gameFinished={!!finishedState}
        />
      )}

      <div>
        <h1 className="game-heading water-background">Tic Tac Toe</h1>
        <div className="square-wrapper">
          {gameState.map((arr, rowIndex) =>
            arr.map((e, colIndex) => {
              const id = rowIndex * 3 + colIndex;
              return (
                <Square
                  socket={socket}
                  playingAs={playingAs}
                  gameState={gameState}
                  finishedArrayState={finishedArrayState}
                  finishedState={finishedState}
                  currentPlayer={currentPlayer}
                  setCurrentPlayer={setCurrentPlayer}
                  setGameState={setGameState}
                  id={id}
                  key={id}
                  currentElement={e}
                  isAISuggestion={aiSuggestion === id}
                />
              );
            })
          )}
        </div>

        {finishedState &&
          finishedState !== "opponentLeftMatch" &&
          finishedState !== "draw" && (
            <h3 className="finished-state">
              {finishedState === playingAs ? "You " : opponentName} won the
              game!
            </h3>
          )}
        {finishedState &&
          finishedState !== "opponentLeftMatch" &&
          finishedState === "draw" && (
            <h3 className="finished-state">It's a Draw!</h3>
          )}
      </div>

      {!finishedState && opponentName && (
        <h2>You are playing against {opponentName}</h2>
      )}

      {finishedState && finishedState === "opponentLeftMatch" && (
        <h2>You won the match! Opponent has left</h2>
      )}

      {finishedState && (
        <button onClick={resetGame} className="playOnline">
          Play Again
        </button>
      )}
    </div>
  );
};

export default App;
