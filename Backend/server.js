const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const { connectDB, mongoose } = require("./config/db");
const logger = require("./utils/logger");
const jobRoutes = require("./routes/job.routes");
const newsRoutes = require("./routes/news.routes");

// --- Load Environment Variables ---
dotenv.config();

// --- Environment Safety Check ---
if (!process.env.MONGO_URI) {
  console.error("✗ FATAL: MONGO_URI is not defined in .env file");
  process.exit(1);
}

if (!process.env.ADMIN_KEY) {
  console.warn("⚠ WARNING: ADMIN_KEY is not set. Admin routes will be unprotected.");
}

// --- Initialize Express ---
const app = express();

// Trust proxy (required for rate limiting behind reverse proxy)
app.set("trust proxy", 1);

// --- Connect Database ---
connectDB();

// --- Middleware ---

// Security headers
app.use(helmet());

// Rate limiter
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per windowMs
  message: {
    status: "error",
    message: "Too many requests, please try again later"
  },
  standardHeaders: true,
  legacyHeaders: false
});

app.use("/api/", limiter);

// CORS configuration - Production-safe
const allowedOrigins = process.env.FRONTEND_URL?.split(",").map(url => url.trim()) || [];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    // In development, allow all origins
    if (process.env.NODE_ENV === "development") {
      return callback(null, true);
    }
    
    // In production, check whitelist
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      logger("CORS blocked request", { origin });
      callback(new Error("Not allowed by CORS"));
    }
  }
}));

// Body parser
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Request logging (development)
if (process.env.NODE_ENV === "development") {
  app.use((req, res, next) => {
    logger(`${req.method} ${req.path}`);
    next();
  });
}

// --- Routes ---

// Health check
app.get("/", (req, res) => {
  res.json({
    status: "success",
    message: "ScrollJob API is running",
    data: {
      version: "v1",
      timestamp: new Date().toISOString()
    }
  });
});

// Enhanced health check for monitoring
app.get("/health", (req, res) => {
  res.json({
    status: "success",
    message: "Health check passed",
    data: {
      uptime: process.uptime(),
      database: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + "MB",
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + "MB"
      },
      timestamp: new Date().toISOString()
    }
  });
});

// API routes
app.use("/api/v1/jobs", jobRoutes);
app.use("/api/v1/news", newsRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    status: "error",
    message: "Route not found",
    data: null
  });
});

// Centralized error handler
app.use((err, req, res, next) => {
  logger("Error occurred", { 
    message: err.message, 
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined 
  });
  
  const statusCode = err.statusCode || err.status || 500;
  
  res.status(statusCode).json({
    status: "error",
    message: err.message || "Internal server error",
    data: null,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack })
  });
});

// --- Start Server ---

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`✓ ScrollJob API running on port ${PORT}`);
  console.log(`✓ Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(`✓ Auth: ${process.env.ADMIN_KEY ? "Enabled" : "Disabled"}`);
  console.log(`✓ CORS: ${allowedOrigins.length > 0 ? "Configured" : "Open"}`);
  
  logger("Server started successfully", { 
    port: PORT, 
    env: process.env.NODE_ENV,
    allowedOrigins: allowedOrigins.length > 0 ? allowedOrigins : ["*"] 
  });
});

// --- Graceful Shutdown ---

// Handle unhandled promise rejections
process.on("unhandledRejection", (err) => {
  logger("Unhandled Rejection", { error: err.message });
  console.error("✗ Unhandled Rejection:", err.message);
  server.close(() => process.exit(1));
});

// Handle uncaught exceptions
process.on("uncaughtException", (err) => {
  logger("Uncaught Exception", { error: err.message });
  console.error("✗ Uncaught Exception:", err.message);
  server.close(() => process.exit(1));
});

// Handle SIGTERM (cloud platform shutdown signal)
process.on("SIGTERM", () => {
  logger("SIGTERM received, shutting down gracefully");
  console.log("✓ SIGTERM received, shutting down gracefully");
  
  server.close(() => {
    console.log("✓ Server closed");
    mongoose.connection.close(false, () => {
      console.log("✓ MongoDB connection closed");
      process.exit(0);
    });
  });
});
