import express from "express";
import cors from "cors";

import taskRoutes from "./routes/task.routes.js";

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use("/api/tasks", taskRoutes);

// Health Check
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "API is running!",
  });
});

export default app;