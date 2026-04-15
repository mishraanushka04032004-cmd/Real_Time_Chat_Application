const { z } = require("zod");

const receiveMessageSchema = z.object({
  body: z.object({
    conversationId: z.string().min(1, "Conversation ID is required"),
    receiverId: z.string().min(1, "Receiver ID is required"),
    text: z.string().min(1, "Message text cannot be empty").max(5000, "Message text is too long"),
  }),
});

const getMessagesSchema = z.object({
  params: z.object({
    conversationId: z.string().min(1, "Conversation ID is required"),
  }),
  query: z.object({
    page: z.string().optional(),
    limit: z.string().optional(),
  }),
});

module.exports = {
  receiveMessageSchema,
  getMessagesSchema,
};
