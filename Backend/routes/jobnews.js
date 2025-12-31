const express = require("express");
const router = express.Router();
const JobNews = require("../models/JobNews");
const auth = require("../middleware/auth");
const logger = require("../utils/logger");
const { validateCreateNews } = require("../validators/news.validator");
const { validateUpdateStatus } = require("../validators/job.validator");

// --- POST /api/v1/news ---
// Create a new job news item (Protected - Admin only)
router.post("/", auth, async (req, res, next) => {
  try {
    const { title, summary, sourceLink } = req.body;

    validateCreateNews({ title, summary, sourceLink });

    const news = new JobNews({
      title,
      summary,
      sourceLink
    });

    const savedNews = await news.save();
    logger("News created", { newsId: savedNews._id });

    res.status(201).json({
      status: "success",
      message: "News created successfully",
      data: savedNews
    });

  } catch (error) {
    if (error.name === "ValidationError") {
      error.statusCode = 400;
      error.message = Object.values(error.errors).map(err => err.message).join(", ");
    }
    next(error);
  }
});

// --- GET /api/v1/news ---
// Get all job news items (Public)
router.get("/", async (req, res, next) => {
  try {
    const { limit = 50, page = 1, status = "active" } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const newsList = await JobNews.find({ status })
      .lean()
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip)
      .select("-__v");

    const total = await JobNews.countDocuments({ status });

    res.status(200).json({
      status: "success",
      message: "News fetched successfully",
      meta: {
        results: newsList.length,
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit))
      },
      data: newsList
    });

  } catch (error) {
    next(error);
  }
});

// --- GET /api/v1/news/:id ---
// Get a single news item by ID (Public)
router.get("/:id", async (req, res, next) => {
  try {
    const news = await JobNews.findById(req.params.id)
      .lean()
      .select("-__v");

    if (!news) {
      const error = new Error("News item not found");
      error.statusCode = 404;
      return next(error);
    }

    res.status(200).json({
      status: "success",
      message: "News fetched successfully",
      data: news
    });

  } catch (error) {
    if (error.name === "CastError") {
      error.statusCode = 400;
      error.message = "Invalid news ID";
    }
    next(error);
  }
});

// --- PATCH /api/v1/news/:id ---
// Update news status (Protected - Admin only)
router.patch("/:id", auth, async (req, res, next) => {
  try {
    const { status } = req.body;

    validateUpdateStatus(status, ["active", "archived"]);

    const news = await JobNews.findById(req.params.id);

    if (!news) {
      const error = new Error("News item not found");
      error.statusCode = 404;
      return next(error);
    }

    news.status = status;
    await news.save();
    
    logger("News status updated", { newsId: news._id, newStatus: status });

    res.status(200).json({
      status: "success",
      message: "News status updated successfully",
      data: news
    });

  } catch (error) {
    if (error.name === "CastError") {
      error.statusCode = 400;
      error.message = "Invalid news ID";
    }
    next(error);
  }
});

// --- DELETE /api/v1/news/:id ---
// Delete a news item (Protected - Admin only)
router.delete("/:id", auth, async (req, res, next) => {
  try {
    const news = await JobNews.findById(req.params.id);

    if (!news) {
      const error = new Error("News item not found");
      error.statusCode = 404;
      return next(error);
    }

    if (news.status !== "archived") {
      news.status = "archived";
      await news.save();
      logger("News deleted", { newsId: news._id });
    }

    res.status(200).json({
      status: "success",
      message: "News deleted successfully",
      data: null
    });

  } catch (error) {
    if (error.name === "CastError") {
      error.statusCode = 400;
      error.message = "Invalid news ID";
    }
    next(error);
  }
});

module.exports = router;
