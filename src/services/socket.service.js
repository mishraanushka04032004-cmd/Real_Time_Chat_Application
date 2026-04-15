const { verifyToken } = require("@clerk/backend");
const User = require("../models/user.model");
const Message = require("../models/message.model");
const Conversation = require("../models/conversation.model");
const logger = require("../utils/logger");

const onlineUsers = new Map();

const initSocketService = (io) => {
  io.on("connection", async (socket) => {
    const token = socket.handshake.auth?.token;
    const userId = socket.handshake.query?.userId;

    if (!token || !userId) {
      logger.warn(`Socket rejected — missing token or userId (${socket.id})`);
      return socket.disconnect();
    }

    try {
      const payload = await verifyToken(token, {
        secretKey: process.env.CLERK_SECRET_KEY,
      });

      if (!payload || payload.sub !== userId) {
        logger.warn(`Socket rejected — token/userId mismatch (${socket.id})`);
        socket.emit("auth_error", { message: "Invalid credentials" });
        return socket.disconnect();
      }
    } catch (err) {
      logger.warn(`Socket token verification failed: ${err.message}`);
      socket.emit("auth_error", { message: "Auth failed" });
      return socket.disconnect();
    }

    onlineUsers.set(userId, socket.id);
    await User.findOneAndUpdate({ clerkId: userId }, { isOnline: true });
    io.emit("onlineUsers", Array.from(onlineUsers.keys()));
    logger.info(`User connected: ${userId} (socket: ${socket.id})`);

    socket.on("send_message", async ({ conversationId, receiverId, text }) => {
      try {
        if (!text?.trim() || !conversationId || !receiverId) return;

        const message = await Message.create({
          conversationId,
          senderId: userId,
          receiverId,
          text: text.trim(),
        });

        await Conversation.findByIdAndUpdate(conversationId, {
          lastMessage: message._id,
          updatedAt: Date.now(),
        });

        const receiverSocketId = onlineUsers.get(receiverId);
        if (receiverSocketId) {
          io.to(receiverSocketId).emit("receive_message", message);
        }

        socket.emit("receive_message", message);
      } catch (err) {
        logger.error(`send_message socket error: ${err.message}`);
        socket.emit("error", { message: "Failed to send message" });
      }
    });

    socket.on("typing", ({ receiverId, isTyping }) => {
      const receiverSocketId = onlineUsers.get(receiverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("typing", { senderId: userId, isTyping });
      }
    });

    socket.on("disconnect", async () => {
      onlineUsers.delete(userId);
      await User.findOneAndUpdate(
        { clerkId: userId },
        { isOnline: false, lastSeen: Date.now() }
      );
      io.emit("onlineUsers", Array.from(onlineUsers.keys()));
      logger.info(`User disconnected: ${userId}`);
    });
  });
};

const getOnlineUsers = () => Array.from(onlineUsers.keys());

module.exports = { initSocketService, getOnlineUsers };
