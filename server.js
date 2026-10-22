import "dotenv/config";
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import productsRouter from "./routes/products.js";
import authRouter from "./routes/auth.js";
import ordersRouter from "./routes/orders.js";

const app = express();
const port = process.env.PORT || 5000;
if (!process.env.JWT_SECRET) {
  console.error("JWT_SECRET is missing. Copy .env.example to .env and configure it.");
  process.exit(1);
}
app.disable("x-powered-by");
app.use(cors({
  origin: (origin, callback) => {
    const allowed = (process.env.CLIENT_URL || "http://localhost:5173").split(",").map(s => s.trim());
    if (!origin || allowed.includes(origin)) return callback(null, true);
    return callback(new Error("Origin is not allowed by CORS"));
  }
}));
app.use(express.json({ limit: "100kb" }));

app.get("/api/health", (_req, res) => res.json({ status: "ok", service: "ShopEase API" }));
app.use("/api/products", productsRouter);
app.use("/api/auth", authRouter);
app.use("/api/orders", ordersRouter);

app.use((req, res) => res.status(404).json({ message: "Route not found." }));
app.use((error, _req, res, _next) => {
  console.error(error.message);
  if (error.code === 11000) return res.status(409).json({ message: "This record already exists." });
  if (error.name === "ValidationError" || error.name === "CastError") return res.status(400).json({ message: "Please check the submitted information." });
  if (error.message === "Origin is not allowed by CORS") return res.status(403).json({ message: error.message });
  res.status(500).json({ message: "Server error. Please try again." });
});

try {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to MongoDB");
  app.listen(port, () => console.log(`ShopEase API listening on port ${port}`));
} catch (error) {
  console.error("Could not connect to MongoDB:", error.message);
  process.exit(1);
}
