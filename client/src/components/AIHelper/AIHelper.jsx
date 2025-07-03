// AIHelper.jsx - Updated component
import React from "react";
import "./AIHelper.css";

const AIHelper = ({ onUseAI, aiUsed, isMyTurn, gameFinished }) => {
  const canUseAI = !aiUsed && isMyTurn && !gameFinished;

  return (
    <div className="ai-helper-container">
      <button
        className={`ai-helper-btn ${aiUsed ? "used" : ""} ${
          !canUseAI ? "disabled" : ""
        }`}
        onClick={onUseAI}
        disabled={!canUseAI}
      >
        {aiUsed ? "🤖 AI Used" : "🤖 Get AI Help"}
      </button>
      {aiUsed && (
        <p className="ai-helper-info">AI help has been used for this game</p>
      )}
      {!isMyTurn && !gameFinished && (
        <p className="ai-helper-info">Wait for your turn to use AI</p>
      )}
    </div>
  );
};

export default AIHelper;
