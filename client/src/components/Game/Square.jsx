import React from "react";
import "./Square.css";

const Square = ({
  id,
  currentElement,
  setGameState,
  finishedState,
  setCurrentPlayer,
  currentPlayer,
  socket,
  playingAs,
  gameState,
  finishedArrayState,
  isAISuggestion,
}) => {
  const circleIcon = (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
      <g
        id="SVGRepo_tracerCarrier"
        strokeLinecap="round"
        strokeLinejoin="round"
      ></g>
      <g id="SVGRepo_iconCarrier">
        <path
          d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
          stroke="#ff4500"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        ></path>
      </g>
    </svg>
  );

  const crossIcon = (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
      <g
        id="SVGRepo_tracerCarrier"
        strokeLinecap="round"
        strokeLinejoin="round"
      ></g>
      <g id="SVGRepo_iconCarrier">
        <path
          d="M19 5L5 19M5.00001 5L19 19"
          stroke="#1e90ff"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        ></path>
      </g>
    </svg>
  );

  const handleClick = () => {
    if (
      finishedState ||
      currentPlayer !== playingAs ||
      currentElement === "circle" ||
      currentElement === "cross"
    ) {
      return;
    }

    const myCurrentPlayer = currentPlayer;
    socket.emit("playerMoveFromClient", {
      state: {
        id,
        sign: myCurrentPlayer,
      },
    });

    setCurrentPlayer(currentPlayer === "circle" ? "cross" : "circle");
    setGameState((prevState) => {
      let newState = [...prevState];
      const rowIndex = Math.floor(id / 3);
      const colIndex = id % 3;
      newState[rowIndex][colIndex] = myCurrentPlayer;
      return newState;
    });
  };

  return (
    <div
      className={`square ${
        finishedState && finishedArrayState.includes(id) ? "win" : ""
      } ${isAISuggestion ? "ai-suggestion" : ""}`}
      onClick={handleClick}
    >
      {currentElement === "circle" && circleIcon}
      {currentElement === "cross" && crossIcon}
      {isAISuggestion && !currentElement && <div className="ai-hint">AI</div>}
    </div>
  );
};

export default Square;
