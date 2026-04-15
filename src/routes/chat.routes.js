const express = require("express");
const router = express.Router();
const { requireAuth } = require("../middlewares/clerk.middleware");
const validate = require("../middlewares/validate.middleware");
const { receiveMessageSchema, getMessagesSchema } = require("../validations/chat.validation");
const {
  syncUser,
  getUsers,
  getOrCreateConversation,
  getMessages,
  sendMessage,
  getConversations,
} = require("../controllers/chat.controller");


router.use(requireAuth);

router.post("/users/sync", syncUser);

router.get("/users", getUsers);


router.get("/conversations", getConversations);
router.get("/conversations/:otherUserId", getOrCreateConversation);


router.get("/messages/:conversationId", validate(getMessagesSchema), getMessages);
router.post("/messages", validate(receiveMessageSchema), sendMessage);

module.exports = router;