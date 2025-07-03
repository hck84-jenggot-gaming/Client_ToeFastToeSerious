import React, { useState, useEffect } from "react";
import "./Leaderboard.css";

const Leaderboard = ({ onBack }) => {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      const response = await fetch("http://localhost:3000/api/leaderboard");
      const data = await response.json();

      if (data.success) {
        setPlayers(data.data);
      } else {
        setError("Failed to load leaderboard");
      }
    } catch (err) {
      setError("Error connecting to server");
    } finally {
      setLoading(false);
    }
  };

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
