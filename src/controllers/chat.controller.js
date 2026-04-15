const ChatService = require("../services/chat.service");
const asyncHandler = require("../utils/asyncHandler");
const ApiResponse = require("../utils/ApiResponse");
const ApiError = require("../utils/ApiError");

const syncUser = asyncHandler(async (req, res) => {
  const userId = req.userId;
  if (!userId) throw new ApiError(401, "Unauthorized");

  const user = await ChatService.syncUser(userId);
  res.status(200).json(new ApiResponse(200, user));
});

const getUsers = asyncHandler(async (req, res) => {
  const userId = req.userId;
  if (!userId) throw new ApiError(401, "Unauthorized");

  const users = await ChatService.getUsers(userId);
  res.status(200).json(new ApiResponse(200, users));
});

const getConversations = asyncHandler(async (req, res) => {
  const userId = req.userId;
  if (!userId) throw new ApiError(401, "Unauthorized");

  const conversations = await ChatService.getConversations(userId);
  res.status(200).json(new ApiResponse(200, conversations));
});

const getOrCreateConversation = asyncHandler(async (req, res) => {
  const userId = req.userId;
  const { otherUserId } = req.params;

  if (!userId) throw new ApiError(401, "Unauthorized");
  if (!otherUserId) throw new ApiError(400, "otherUserId is required");

  const conversation = await ChatService.getOrCreateConversation(userId, otherUserId);
  res.status(200).json(new ApiResponse(200, conversation));
});

const getMessages = asyncHandler(async (req, res) => {
  const userId = req.userId;
  const { conversationId } = req.params;
  const { page = 1, limit = 50 } = req.query;

  if (!userId) throw new ApiError(401, "Unauthorized");

  const messages = await ChatService.getMessages(conversationId, parseInt(page), parseInt(limit));
  res.status(200).json(new ApiResponse(200, messages));
});

const sendMessage = asyncHandler(async (req, res) => {
  const userId = req.userId;
  const { conversationId, receiverId, text } = req.body;

  if (!userId) throw new ApiError(401, "Unauthorized");

  const message = await ChatService.sendMessage(userId, receiverId, conversationId, text);
  res.status(201).json(new ApiResponse(201, message, "Message sent"));
});

module.exports = {
  syncUser,
  getUsers,
  getConversations,
  getOrCreateConversation,
  getMessages,
  sendMessage,
};