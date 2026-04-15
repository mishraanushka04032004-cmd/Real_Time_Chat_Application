const { Server } = require("socket.io");

let io;

const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL || "http://localhost:5173",
      methods: ["GET", "POST"],
      credentials: true,
    },
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  return io;
};

const getIO = () => {
  if (!io) throw new Error("Socket.IO not initialized!");
  return io;
};

module.exports = { initSocket, getIO };