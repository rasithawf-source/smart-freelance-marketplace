import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

const CATEGORIES = [
  "Web Development",
  "Mobile Development",
  "Design",
  "Writing",
  "Marketing",
  "Data Science",
  "DevOps",
  "Other",
];

export default function PostJob() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: "",
    description: "",
    budget: "",
    category: "Web Development",
    skills: "",
    deadline: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.title || !form.description || !form.budget) {
      return setError("Title, description, and budget are required.");
    }
    setLoading(true);
    try {
      const payload = {
        ...form,
        budget: Number(form.budget),
        skills: form.skills
          ? form.skills.split(",").map((s) => s.trim()).filter(Boolean)
          : [],
      };
      const { data } = await api.post("/jobs", payload);
      navigate(`/jobs/${data._id}`);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to post job.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <div className="container" style={{ maxWidth: 720 }}>
        <div className="page-header">
          <h1 className="page-title">Post a Job</h1>
          <p className="page-subtitle">
            Describe your project and connect with the right freelancers.
          </p>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <div className="card">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Job Title</label>
              <input
                className="form-input"
                name="title"
                placeholder="e.g. Build a React dashboard with charts"
                value={form.title}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea
                className="form-textarea"
                name="description"
                placeholder="Describe the project scope, requirements, and what you're looking for in a freelancer…"
                value={form.description}
                onChange={handleChange}
                style={{ minHeight: 160 }}
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Budget (USD)</label>
                <input
                  className="form-input"
                  type="number"
                  name="budget"
                  placeholder="500"
                  min="0"
                  value={form.budget}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Category</label>
                <select
                  className="form-select"
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Required Skills</label>
                <input
                  className="form-input"
                  name="skills"
                  placeholder="React, TypeScript, CSS…"
                  value={form.skills}
                  onChange={handleChange}
                />
                <p className="form-hint">Separate with commas</p>
              </div>
              <div className="form-group">
                <label className="form-label">Deadline <span style={{color:"var(--text-muted)"}}>optional</span></label>
                <input
                  className="form-input"
                  type="date"
                  name="deadline"
                  value={form.deadline}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="flex gap-3 mt-2">
              <button className="btn btn-primary btn-lg" type="submit" disabled={loading}>
                {loading ? "Posting…" : "Post Job"}
              </button>
              <button
                className="btn btn-secondary btn-lg"
                type="button"
                onClick={() => navigate("/")}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
