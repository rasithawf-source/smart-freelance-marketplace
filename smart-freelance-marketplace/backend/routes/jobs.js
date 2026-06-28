const express = require("express");
const router = express.Router();
const Job = require("../models/Job");
const { protect } = require("../middleware/auth");

// GET /api/jobs — get all open jobs
router.get("/", async (req, res) => {
  try {
    const { category, search } = req.query;
    let filter = { status: "open" };

    if (category) filter.category = category;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    const jobs = await Job.find(filter)
      .populate("postedBy", "name email")
      .sort({ createdAt: -1 });

    res.json(jobs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/jobs/my — get jobs posted by logged-in user
router.get("/my", protect, async (req, res) => {
  try {
    const jobs = await Job.find({ postedBy: req.user._id }).sort({ createdAt: -1 });
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/jobs/:id — get single job
router.get("/:id", async (req, res) => {
  try {
    const job = await Job.findById(req.params.id).populate("postedBy", "name email bio");
    if (!job) return res.status(404).json({ message: "Job not found" });
    res.json(job);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/jobs — create a job
router.post("/", protect, async (req, res) => {
  try {
    const { title, description, budget, category, skills, deadline } = req.body;

    const job = await Job.create({
      title,
      description,
      budget,
      category,
      skills: skills || [],
      deadline,
      postedBy: req.user._id,
    });

    res.status(201).json(job);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PATCH /api/jobs/:id/status — update job status
router.patch("/:id/status", protect, async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: "Job not found" });
    if (job.postedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }
    job.status = req.body.status;
    await job.save();
    res.json(job);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE /api/jobs/:id — delete a job
router.delete("/:id", protect, async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: "Job not found" });
    if (job.postedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }
    await job.deleteOne();
    res.json({ message: "Job removed" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
