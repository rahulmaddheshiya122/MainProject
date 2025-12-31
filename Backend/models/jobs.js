const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Job title is required"],
      trim: true,
      maxlength: [200, "Title cannot exceed 200 characters"]
    },
    company: {
      type: String,
      required: [true, "Company name is required"],
      trim: true,
      lowercase: true,
      maxlength: [100, "Company name cannot exceed 100 characters"]
    },
    location: {
      type: String,
      trim: true,
      maxlength: [100, "Location cannot exceed 100 characters"],
      default: "Remote"
    },
    applyLink: {
      type: String,
      required: [true, "Apply link is required"],
      trim: true,
      validate: {
        validator: function(v) {
          return /^https?:\/\/.+/.test(v);
        },
        message: "Please provide a valid URL"
      }
    },
    status: {
      type: String,
      enum: ["active", "expired", "closed"],
      default: "active"
    }
  },
  {
    timestamps: true
  }
);

// --- Indexes ---
jobSchema.index({ createdAt: -1 });
jobSchema.index({ company: 1 });
jobSchema.index({ status: 1 });
jobSchema.index({ title: "text", company: "text" });

module.exports = mongoose.model("Job", jobSchema);
