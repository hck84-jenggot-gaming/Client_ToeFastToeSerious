// src/pages/WaitingRoom.jsx
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import socketManager from "../services/socketManager";

const WaitingRoom = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isConnecting, setIsConnecting] = useState(true);
  const playerName = location.state?.playerName;

  useEffect(() => {
    if (!playerName) {
      navigate("/");
      return;
    }

    // Connect to socket
    const socket = socketManager.connect();

    // Set up event listeners
    const handleOpponentFound = (data) => {
      // Store game data in socket manager
      socketManager.setGameData({
        playerName: playerName,
        opponentName: data.opponentName,
        playingAs: data.playingAs,
        roomId: data.roomId,
      });

      // Navigate to game
      navigate("/game");
    };

    const handleOpponentNotFound = () => {
      console.log("Opponent not found");
      setIsConnecting(false);
    };

    const handleConnect = () => {
      console.log("Connected to server");
      // Emit request to play after connection is established
      socket.emit("request_to_play", {
        playerName: playerName,
      });
    };

    // Register event listeners
    socket.on("connect", handleConnect);
    socket.on("OpponentFound", handleOpponentFound);
    socket.on("OpponentNotFound", handleOpponentNotFound);

    // If already connected, emit immediately
    if (socket.connected) {
      handleConnect();
    }

    // Cleanup function
    return () => {
      socket.off("connect", handleConnect);
      socket.off("OpponentFound", handleOpponentFound);
      socket.off("OpponentNotFound", handleOpponentNotFound);
      // Don't disconnect here, we'll use the socket in the game
    };
  }, [playerName, navigate]);

  const handleCancel = () => {
    socketManager.disconnect();
    navigate("/");
  };

  return (
    <div className="waiting">
      <p>
        {isConnecting ? "Connecting to server..." : "Waiting for opponent..."}
      </p>
      <div className="spinner"></div>
      <button
        onClick={handleCancel}
        className="playOnline"
        style={{ marginTop: "20px" }}
      >
        Cancel
      </button>
    </div>
  );
};

export default WaitingRoom;
