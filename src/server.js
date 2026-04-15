require("dotenv").config();
const http = require("http");
const app = require("./app");
const connectDB = require("./config/db");
const { initSocket } = require("./config/socket");
const { initSocketService } = require("./services/socket.service");
const logger = require("./utils/logger");

const PORT = process.env.PORT || 5000;

const httpServer = http.createServer(app);
const io = initSocket(httpServer);

const start = async () => {
  try {
    await connectDB();
    initSocketService(io);

    httpServer.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`);
      logger.info(`Environment: ${process.env.NODE_ENV || "development"}`);
      logger.info(`Client URL: ${process.env.CLIENT_URL}`);
    });
  } catch (error) {
    logger.error(`Failed to start server: ${error.message}`);
    process.exit(1);
  }
};

start();