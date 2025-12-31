const mongoose = require("mongoose");
const logger = require("../utils/logger");

// --- Mongoose Configuration ---
mongoose.set("strictQuery", true);

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      autoIndex: true,
    });

    console.log(`✓ MongoDB Connected: ${conn.connection.host}`);
    logger("MongoDB connected", { host: conn.connection.host });
    
    // --- Connection Event Handlers ---
    mongoose.connection.on("error", (err) => {
      console.error("✗ MongoDB connection error:", err);
      logger("MongoDB error", { error: err.message });
    });

    mongoose.connection.on("disconnected", () => {
      console.warn("⚠ MongoDB disconnected");
      logger("MongoDB disconnected");
    });

    mongoose.connection.on("reconnected", () => {
      console.log("✓ MongoDB reconnected");
      logger("MongoDB reconnected");
    });

  } catch (error) {
    console.error("✗ MongoDB connection failed:", error.message);
    logger("MongoDB connection failed", { error: error.message });
    process.exit(1);
  }
};

module.exports = { connectDB, mongoose };
