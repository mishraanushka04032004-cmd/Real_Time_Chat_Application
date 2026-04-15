const User = require("../models/user.model");
const Message = require("../models/message.model");
const Conversation = require("../models/conversation.model");
const ApiError = require("../utils/ApiError");
const { clerkClient } = require("../middlewares/clerk.middleware");

class ChatService {
  async syncUser(clerkId) {
    const clerkUser = await clerkClient.users.getUser(clerkId);
    if (!clerkUser) throw new ApiError(404, "User not found in Clerk");

    const userData = {
      clerkId,
      username:
        clerkUser.username ||
        `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim() ||
        "User",
      email: clerkUser.emailAddresses[0]?.emailAddress || "",
      profileImage: clerkUser.imageUrl || "",
    };

    const user = await User.findOneAndUpdate(
      { clerkId },
      { $set: userData },
      { upsert: true, new: true }
    );

    return user;
  }

  async getUsers(excludeClerkId) {
    const users = await User.find({
      clerkId: { $ne: excludeClerkId },
    }).select("clerkId username email profileImage isOnline lastSeen");

    
    if (!users.length) {
      return await User.find({}).select(
        "clerkId username email profileImage isOnline lastSeen"
      );
    }

    return users;
  }

  async getOrCreateConversation(userId, otherUserId) {
    const participants = [userId, otherUserId].sort();
    let conversation = await Conversation.findOne({ participants });

    if (!conversation) {
      conversation = await Conversation.create({ participants });
    }

    return conversation;
  }

  async getMessages(conversationId, page = 1, limit = 50) {
    return await Message.find({ conversationId })
      .sort({ createdAt: 1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
  }

  async sendMessage(senderId, receiverId, conversationId, text) {
    const message = await Message.create({
      conversationId,
      senderId,
      receiverId,
      text,
    });

    await Conversation.findByIdAndUpdate(conversationId, {
      lastMessage: message._id,
    });

    return message;
  }

  async getConversations(userId) {
    return await Conversation.find({
      participants: userId,
    })
      .populate("lastMessage")
      .sort({ updatedAt: -1 });
  }
}

module.exports = new ChatService();