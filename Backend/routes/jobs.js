const express = require("express");
const router = express.Router();
const Job = require("../models/Job");
const auth = require("../middleware/auth");
const logger = require("../utils/logger");
const { validateCreateJob, validateUpdateStatus } = require("../validators/job.validator");

// --- POST /api/v1/jobs ---
// Create a new job listing (Protected - Admin only)
router.post("/", auth, async (req, res, next) => {
  try {
    const { title, company, location, applyLink } = req.body;

    validateCreateJob({ title, company, location, applyLink });

    const job = new Job({
      title,
      company,
      location,
      applyLink
    });

    const savedJob = await job.save();
    logger("Job created", { jobId: savedJob._id, company: savedJob.company });

    res.status(201).json({
      status: "success",
      message: "Job created successfully",
      data: savedJob
    });

  } catch (error) {
    if (error.name === "ValidationError") {
      error.statusCode = 400;
      error.message = Object.values(error.errors).map(err => err.message).join(", ");
    }
    next(error);
  }
});

// --- GET /api/v1/jobs ---
// Get all job listings (Public)
router.get("/", async (req, res, next) => {
  try {
    const { limit = 50, page = 1, company, search, status = "active" } = req.query;

    const query = { status };
    
    if (company) {
      query.company = new RegExp(company, "i");
    }
    
    if (search) {
      query.$text = { $search: search };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const jobs = await Job.find(query)
      .lean()
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip)
      .select("-__v");

    const total = await Job.countDocuments(query);

    res.status(200).json({
      status: "success",
      message: "Jobs fetched successfully",
      meta: {
        results: jobs.length,
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit))
      },
      data: jobs
    });

  } catch (error) {
    next(error);
  }
});

// --- GET /api/v1/jobs/:id ---
// Get a single job by ID (Public)
router.get("/:id", async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id)
      .lean()
      .select("-__v");

    if (!job) {
      const error = new Error("Job not found");
      error.statusCode = 404;
      return next(error);
    }

    res.status(200).json({
      status: "success",
      message: "Job fetched successfully",
      data: job
    });

  } catch (error) {
    if (error.name === "CastError") {
      error.statusCode = 400;
      error.message = "Invalid job ID";
    }
    next(error);
  }
});

// --- PATCH /api/v1/jobs/:id ---
// Update job status (Protected - Admin only)
router.patch("/:id", auth, async (req, res, next) => {
  try {
    const { status } = req.body;

    validateUpdateStatus(status, ["active", "expired", "closed"]);

    const job = await Job.findById(req.params.id);

    if (!job) {
      const error = new Error("Job not found");
      error.statusCode = 404;
      return next(error);
    }

    job.status = status;
    await job.save();
    
    logger("Job status updated", { jobId: job._id, newStatus: status });

    res.status(200).json({
      status: "success",
      message: "Job status updated successfully",
      data: job
    });

  } catch (error) {
    if (error.name === "CastError") {
      error.statusCode = 400;
      error.message = "Invalid job ID";
    }
    next(error);
  }
});

// --- DELETE /api/v1/jobs/:id ---
// Delete a job (Protected - Admin only)
router.delete("/:id", auth, async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      const error = new Error("Job not found");
      error.statusCode = 404;
      return next(error);
    }

    if (job.status !== "closed") {
      job.status = "closed";
      await job.save();
      logger("Job deleted", { jobId: job._id });
    }

    res.status(200).json({
      status: "success",
      message: "Job deleted successfully",
      data: null
    });

  } catch (error) {
    if (error.name === "CastError") {
      error.statusCode = 400;
      error.message = "Invalid job ID";
    }
    next(error);
  }
});

module.exports = router;
