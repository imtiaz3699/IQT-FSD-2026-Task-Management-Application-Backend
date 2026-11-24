import "dotenv/config";

import app from "./app.js";
import connectDB from "./config/database.js";
import authRoutes from "./routes/auth.routes.js";
import cors from "cors";
app.use("/api/auth", authRoutes);
const PORT = process.env.PORT || 5000;


const allowedOrigins = [
  "http://localhost:5173",
  "https://my-project-three-mauve-43.vercel.app",
  ...(process.env.CLIENT_URLS ? process.env.CLIENT_URLS.split(",") : []),
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
      callback(new Error(`Origin ${origin} is not allowed by CORS`));
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Server failed:", error.message);
    process.exit(1);
  }
};

startServer();