const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Job title is required"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Job description is required"],
    },
    budget: {
      type: Number,
      required: [true, "Budget is required"],
      min: 0,
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      enum: [
        "Web Development",
        "Mobile Development",
        "Design",
        "Writing",
        "Marketing",
        "Data Science",
        "DevOps",
        "Other",
      ],
    },
    skills: {
      type: [String],
      default: [],
    },
    deadline: {
      type: Date,
    },
    status: {
      type: String,
      enum: ["open", "in-progress", "closed"],
      default: "open",
    },
    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Job", jobSchema);
