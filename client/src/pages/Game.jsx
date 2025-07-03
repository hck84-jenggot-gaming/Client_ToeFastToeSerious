// src/pages/Game.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Square from "../components/Game/Square";
import AIHelper from "../components/AIHelper/AIHelper";
import Swal from "sweetalert2";
import { useLeaderboard } from "../contexts/LeaderboardContext";
import socketManager from "../services/socketManager";

const renderFrom = [
  [null, null, null],
  [null, null, null],
  [null, null, null],
];

const Game = () => {
  const navigate = useNavigate();
  const { clearCache } = useLeaderboard();

  // Get socket and game data from socket manager
  const socket = socketManager.getSocket();
  const gameData = socketManager.getGameData();

  // Always initialize with a fresh board
  const [gameState, setGameState] = useState([
    [null, null, null],
    [null, null, null],
    [null, null, null],
  ]);
  const [currentPlayer, setCurrentPlayer] = useState("circle");
  const [finishedState, setFinishedState] = useState(false);
  const [finishedArrayState, setFinishedArrayState] = useState([]);
  const [opponentName, setOpponentName] = useState(gameData?.opponentName);
  const [playerName] = useState(gameData?.playerName);
  const [playingAs] = useState(gameData?.playingAs);
  const [roomId] = useState(gameData?.roomId);
  const [aiUsed, setAiUsed] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState(null);
  const [winRecorded, setWinRecorded] = useState(false);
  const [actualWinner, setActualWinner] = useState(null); // Track who actually won
  const [opponentLeftAfterGame, setOpponentLeftAfterGame] = useState(false); // Track if opponent left after game ended

  const checkWinner = () => {
    // row dynamic
    for (let row = 0; row < gameState.length; row++) {
      if (
        gameState[row][0] &&
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
        gameState[0][col] &&
        gameState[0][col] === gameState[1][col] &&
        gameState[1][col] === gameState[2][col]
      ) {
        setFinishedArrayState([0 * 3 + col, 1 * 3 + col, 2 * 3 + col]);
        return gameState[0][col];
      }
    }

    if (
      gameState[0][0] &&
      gameState[0][0] === gameState[1][1] &&
      gameState[1][1] === gameState[2][2]
    ) {
      setFinishedArrayState([0, 4, 8]);
      return gameState[0][0];
    }

    if (
      gameState[0][2] &&
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
    if (!socket || !gameData) {
      navigate("/");
      return;
    }

    // Reset game to initial state when component mounts (new game session)
    setGameState([
      [null, null, null],
      [null, null, null],
      [null, null, null],
    ]);
    setCurrentPlayer("circle");
    setFinishedState(false);
    setFinishedArrayState([]);
    setAiUsed(false);
    setAiSuggestion(null);
    setWinRecorded(false);
    setActualWinner(null); // Reset actual winner
    setOpponentLeftAfterGame(false); // Reset opponent left status
    setOpponentLeftAfterGame(false); // Reset opponent left status

    // Socket event handlers
    const handleOpponentLeft = () => {
      // Only award win if game wasn't already finished and no winner was determined
      if (!finishedState && !actualWinner) {
        setFinishedState("opponentLeftMatch");
        setActualWinner(playerName); // Current player wins if opponent leaves during active game

        if (socket) {
          socket.emit("gameEnded", {
            winner: "opponentLeft",
            winnerName: playerName,
            roomId,
            playerName,
            opponentName,
            playingAs,
          });
          clearCache();
        }
      }
      // If game was already finished, just notify but don't change winner
      else {
        // DO NOT change actualWinner here - keep the original winner
        setOpponentLeftAfterGame(true);
        Swal.fire({
          icon: "info",
          title: "Opponent has left",
          text: `The game was already won by ${actualWinner}.`,
          timer: 3000,
          showConfirmButton: false,
        });
      }
    };

    const handlePlayerMove = (data) => {
      const id = data.state.id;
      setGameState((prevState) => {
        let newState = [...prevState];
        const rowIndex = Math.floor(id / 3);
        const colIndex = id % 3;
        newState[rowIndex][colIndex] = data.state.sign;
        return newState;
      });
      setCurrentPlayer(data.state.sign === "circle" ? "cross" : "circle");
      setAiSuggestion(null);
    };

    const handleAiSuggestion = (data) => {
      setAiSuggestion(data.bestMove);
      setAiUsed(data.aiUsed);
      if (data.source === "gemini") {
        console.log("AI suggestion from Gemini");
      } else {
        console.log("AI suggestion from fallback algorithm");
      }
    };

    const handleAiError = (data) => {
      console.error("AI Error:", data.message);
      Swal.fire({
        icon: "error",
        title: "AI Help Unavailable",
        text: data.message,
        timer: 3000,
        showConfirmButton: false,
      });
    };

    const handleGameReset = () => {
      // Reset all game state when server confirms reset
      resetGameState();
      console.log("Game has been reset");
    };

    // Register socket event listeners
    socket.on("opponentLeftMatch", handleOpponentLeft);
    socket.on("playerMoveFromServer", handlePlayerMove);
    socket.on("aiSuggestion", handleAiSuggestion);
    socket.on("aiError", handleAiError);
    socket.on("gameReset", handleGameReset);
    socket.on("gameResetConfirmed", handleGameReset); // Handle server confirmation

    // Cleanup
    return () => {
      socket.off("opponentLeftMatch", handleOpponentLeft);
      socket.off("playerMoveFromServer", handlePlayerMove);
      socket.off("aiSuggestion", handleAiSuggestion);
      socket.off("aiError", handleAiError);
      socket.off("gameReset", handleGameReset);
      socket.off("gameResetConfirmed", handleGameReset);
    };
  }, [socket, gameData, navigate]);

  useEffect(() => {
    const winner = checkWinner();
    if (winner && !finishedState && !winRecorded) {
      setFinishedState(winner);

      if (winner !== "draw") {
        // Determine the actual winner's name
        const winnerName = winner === playingAs ? playerName : opponentName;
        const winnerSign = winner; // 'circle' or 'cross'
        setActualWinner(winnerName);
        setWinRecorded(true);

        if (socket) {
          socket.emit("gameEnded", {
            winner: winnerSign,
            winnerName: winnerName,
            roomId,
            playerName,
            opponentName,
            playingAs,
          });

          if (winner === playingAs) {
            clearCache();
          }
        }
      }
    }
  }, [
    gameState,
    socket,
    roomId,
    playingAs,
    clearCache,
    finishedState,
    playerName,
    opponentName,
    winRecorded,
  ]);

  const handleAIHelp = () => {
    if (!aiUsed && currentPlayer === playingAs && !finishedState) {
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

      socket.once("aiSuggestion", () => {
        Swal.close();
      });

      socket.once("aiError", () => {
        Swal.close();
      });
    }
  };

  const resetGameState = () => {
    setGameState([
      [null, null, null],
      [null, null, null],
      [null, null, null],
    ]);
    setCurrentPlayer("circle");
    setFinishedState(false);
    setFinishedArrayState([]);
    setAiUsed(false);
    setAiSuggestion(null);
    setWinRecorded(false);
    setActualWinner(null); // Reset actual winner
  };

  const handlePlayAgain = () => {
    // Reset the game state locally
    resetGameState();

    // Notify server to reset the game for both players
    if (socket && roomId) {
      socket.emit("requestGameReset", { roomId });
    }
  };

  if (!socket || !gameData) {
    return (
      <div className="waiting">
        <p>Loading game...</p>
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <>
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
        <h2>Opponent has left</h2>
      )}

      {opponentLeftAfterGame && (
        <h2 style={{ color: "#888" }}>Opponent has disconnected</h2>
      )}

      {finishedState && (
        <>
          <button onClick={handlePlayAgain} className="playOnline">
            Play Again (Same Opponent)
          </button>
          <button
            onClick={() => {
              socketManager.disconnect();
              navigate("/");
            }}
            className="playOnline"
            style={{ marginLeft: "10px" }}
          >
            New Match
          </button>
        </>
      )}
    </>
  );
};

export default Game;
