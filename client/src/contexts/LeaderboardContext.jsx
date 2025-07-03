import React, { createContext, useState, useContext, useCallback } from "react";

// Step 1: Create the Context
// This is like creating a "storage box" that will hold our leaderboard data
const LeaderboardContext = createContext();

// Step 2: Create a Provider Component
// This wraps around parts of your app that need access to the leaderboard data
export const LeaderboardProvider = ({ children }) => {
  // All the state that was in your Leaderboard component
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastFetched, setLastFetched] = useState(null);

  // Function to fetch leaderboard data
  const fetchLeaderboard = useCallback(
    async (forceRefresh = false) => {
      // Check if we have cached data and it's less than 1 minute old
      if (!forceRefresh && lastFetched && players.length > 0) {
        const timeSinceLastFetch = Date.now() - lastFetched;
        if (timeSinceLastFetch < 60000) {
          // 60 seconds
          return; // Use cached data
        }
      }

      setLoading(true);
      setError(null);

      try {
        const response = await fetch("http://localhost:3000/api/leaderboard");
        const data = await response.json();

        if (data.success) {
          setPlayers(data.data);
          setLastFetched(Date.now());
        } else {
          setError("Failed to load leaderboard");
        }
      } catch (err) {
        setError("Error connecting to server");
      } finally {
        setLoading(false);
      }
    },
    [lastFetched, players.length]
  );

  // Function to clear the cache (useful after a game ends)
  const clearCache = () => {
    setLastFetched(null);
  };

  // The value object contains everything we want to share
  const value = {
    players,
    loading,
    error,
    fetchLeaderboard,
    clearCache,
    hasData: players.length > 0,
  };

  return (
    <LeaderboardContext.Provider value={value}>
      {children}
    </LeaderboardContext.Provider>
  );
};

// Step 3: Create a custom hook for easy access
// This is what components will use to access the leaderboard data
export const useLeaderboard = () => {
  const context = useContext(LeaderboardContext);

  if (!context) {
    throw new Error("useLeaderboard must be used within a LeaderboardProvider");
  }

  return context;
};
