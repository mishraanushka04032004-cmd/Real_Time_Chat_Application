const { createClerkClient, verifyToken } = require("@clerk/backend");
const logger = require("../utils/logger");

const clerkClient = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY,
});

const requireAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Unauthorized: No token provided" });
    }

    const token = authHeader.split(" ")[1];

    const payload = await verifyToken(token, {
      secretKey: process.env.CLERK_SECRET_KEY,
    });

    if (!payload || !payload.sub) {
      return res.status(401).json({ message: "Unauthorized: Invalid token" });
    }

    req.userId = payload.sub;
    next();
  } catch (error) {
    logger.error(`Clerk auth error: ${error.message}`);
    return res.status(401).json({ message: "Unauthorized: Token verification failed" });
  }
};

module.exports = { requireAuth, clerkClient };