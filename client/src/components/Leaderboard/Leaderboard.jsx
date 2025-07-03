import React, { useEffect } from "react";
import { useLeaderboard } from "../../contexts/LeaderboardContext"; // Adjust path as needed
import "./Leaderboard.css";

const Leaderboard = ({ onBack }) => {
  // Instead of managing state here, we get everything from Context!
  const { players, loading, error, fetchLeaderboard } = useLeaderboard();

  useEffect(() => {
    // Fetch leaderboard when component mounts
    // It will use cached data if available and recent
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  if (loading) {
    return (
      <div className="leaderboard-container">
        <h2>Loading Leaderboard...</h2>
        <div className="spinner"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="leaderboard-container">
        <h2>Error</h2>
        <p>{error}</p>
        <button onClick={onBack} className="back-button">
          Back to Menu
        </button>
      </div>
    );
  }

  return (
    <div className="leaderboard-container">
      <h2 className="leaderboard-title">🏆 Leaderboard</h2>
      <div className="leaderboard-table">
        <div className="leaderboard-header">
          <span>Rank</span>
          <span>Player</span>
          <span>Wins</span>
        </div>
        {players.length > 0 ? (
          players.map((player, index) => (
            <div key={index} className="leaderboard-row">
              <span className="rank">
                {index === 0
                  ? "🥇"
                  : index === 1
                  ? "🥈"
                  : index === 2
                  ? "🥉"
                  : `#${index + 1}`}
              </span>
              <span className="player-name">{player.username}</span>
              <span className="wins">{player.totalWins}</span>
            </div>
          ))
        ) : (
          <div className="no-players">
            <p>No players yet. Be the first to win!</p>
          </div>
        )}
      </div>
      <button onClick={onBack} className="back-button">
        Back to Menu
      </button>
    </div>
  );
};

export default Leaderboard;
