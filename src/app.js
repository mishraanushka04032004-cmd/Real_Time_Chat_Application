const express = require("express");
const cors = require("cors");
const chatRoutes = require("./routes/chat.routes");
const { errorHandler, notFound } = require("./middlewares/error.middleware");

const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const morgan = require("./config/morgan");

const app = express();


app.use(helmet());


const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { success: false, error: "Too many requests, please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use("/api", limiter);


app.use(morgan.successHandler);
app.use(morgan.errorHandler);


app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  })
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));


app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use("/api", chatRoutes);


app.use(notFound);
app.use(errorHandler);

module.exports = app;