import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import morgan from "morgan";
import { rateLimit } from "express-rate-limit";
import cookieParser from "cookie-parser";
dotenv.config();

const limiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  limit: 100,
  standardHeaders: "draft-8",
  legacyHeaders: false,
});

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS", "UPDATE", "PUT"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  })
);
app.use(limiter);

app.use(cookieParser());

app.use(express.json({ limit: "1mb" }));
app.use(
  morgan(":method :url :status :res[content-length] - :response-time ms")
);

// Routes
import authRoutes from "./routes/auth.routes.js";
import studentRoutes from "./routes/student.routes.js";
import activityRoutes from "./routes/activity.routes.js";

app.use("/auth", authRoutes);
app.use("/students", studentRoutes);
app.use("/activity", activityRoutes);

export default app;
