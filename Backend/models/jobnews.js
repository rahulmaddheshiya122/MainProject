const mongoose = require("mongoose");

const jobNewsSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "News title is required"],
      trim: true,
      maxlength: [300, "Title cannot exceed 300 characters"]
    },
    summary: {
      type: String,
      required: [true, "Summary is required"],
      trim: true,
      maxlength: [1000, "Summary cannot exceed 1000 characters"]
    },
    sourceLink: {
      type: String,
      trim: true,
      validate: {
        validator: function(v) {
          return !v || /^https?:\/\/.+/.test(v);
        },
        message: "Please provide a valid URL"
      }
    },
    status: {
      type: String,
      enum: ["active", "archived"],
      default: "active"
    }
  },
  {
    timestamps: true
  }
);

// --- Indexes ---
jobNewsSchema.index({ createdAt: -1 });
jobNewsSchema.index({ status: 1 });

module.exports = mongoose.model("JobNews", jobNewsSchema);
