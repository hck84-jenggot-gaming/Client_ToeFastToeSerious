// src/services/socketManager.js
import { io } from "socket.io-client";

class SocketManager {
  constructor() {
    this.socket = null;
    this.gameData = null;
  }

  connect() {
    if (!this.socket) {
      // http://localhost:3000/
      // https://2f2f.nashi.lat/
      this.socket = io("https://2f2f.nashi.lat/", {
        autoConnect: true,
      });
    }
    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    // Always clear game data on disconnect
    this.gameData = null;
  }

  getSocket() {
    return this.socket;
  }

  setGameData(data) {
    this.gameData = data;
  }

  getGameData() {
    return this.gameData;
  }
}

export default new SocketManager();
