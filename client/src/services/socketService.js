import { io } from "socket.io-client";

class SocketService {
  constructor() {
    this.socket = null;
  }
  // http://localhost:3000/
  // https://2f2f.nashi.lat/
  connect(url = "https://2f2f.nashi.lat/") {
    this.socket = io(url, {
      autoConnect: true,
    });
    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  emit(event, data) {
    if (this.socket) {
      this.socket.emit(event, data);
    }
  }

  on(event, callback) {
    if (this.socket) {
      this.socket.on(event, callback);
    }
  }

  once(event, callback) {
    if (this.socket) {
      this.socket.once(event, callback);
    }
  }

  off(event, callback) {
    if (this.socket) {
      this.socket.off(event, callback);
    }
  }

  getSocket() {
    return this.socket;
  }
}

export default new SocketService();
