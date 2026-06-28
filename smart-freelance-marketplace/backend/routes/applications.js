const express = require("express");
const router = express.Router();
const Application = require("../models/Application");
const Job = require("../models/Job");
const { protect } = require("../middleware/auth");

// POST /api/applications — apply for a job
router.post("/", protect, async (req, res) => {
  try {
    const { jobId, coverLetter, proposedRate } = req.body;

    const job = await Job.findById(jobId);
    if (!job) return res.status(404).json({ message: "Job not found" });
    if (job.status !== "open") {
      return res.status(400).json({ message: "This job is not open for applications" });
    }
    if (job.postedBy.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: "You cannot apply to your own job" });
    }

    const existing = await Application.findOne({ job: jobId, applicant: req.user._id });
    if (existing) {
      return res.status(400).json({ message: "You have already applied for this job" });
    }

    const application = await Application.create({
      job: jobId,
      applicant: req.user._id,
      coverLetter,
      proposedRate,
    });

    await application.populate([
      { path: "job", select: "title budget category" },
      { path: "applicant", select: "name email" },
    ]);

    res.status(201).json(application);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/applications/my — get my applications (as freelancer)
router.get("/my", protect, async (req, res) => {
  try {
    const applications = await Application.find({ applicant: req.user._id })
      .populate("job", "title budget category status postedBy")
      .sort({ createdAt: -1 });
    res.json(applications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/applications/job/:jobId — get all applications for a job (job owner only)
router.get("/job/:jobId", protect, async (req, res) => {
  try {
    const job = await Job.findById(req.params.jobId);
    if (!job) return res.status(404).json({ message: "Job not found" });
    if (job.postedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const applications = await Application.find({ job: req.params.jobId })
      .populate("applicant", "name email bio skills")
      .sort({ createdAt: -1 });

    res.json(applications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PATCH /api/applications/:id — update application status
router.patch("/:id", protect, async (req, res) => {
  try {
    const application = await Application.findById(req.params.id).populate("job");
    if (!application) return res.status(404).json({ message: "Application not found" });

    if (application.job.postedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    application.status = req.body.status;
    await application.save();
    res.json(application);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
