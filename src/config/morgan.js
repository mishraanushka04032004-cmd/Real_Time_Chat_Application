const morgan = require("morgan");
const logger = require("../utils/logger");

const morganFormat = process.env.NODE_ENV === "production" ? "combined" : "dev";

const successHandler = morgan(morganFormat, {
  skip: (req, res) => res.statusCode >= 400 || req.originalUrl === "/health",
  stream: { write: (message) => logger.info(message.trim()) },
});

const errorHandler = morgan(morganFormat, {
  skip: (req, res) => res.statusCode < 400,
  stream: { write: (message) => logger.error(message.trim()) },
});

module.exports = {
  successHandler,
  errorHandler,
};
