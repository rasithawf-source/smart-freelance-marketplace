import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";

function ApplyModal({ job, onClose, onSuccess }) {
  const [form, setForm] = useState({ coverLetter: "", proposedRate: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await api.post("/applications", {
        jobId: job._id,
        coverLetter: form.coverLetter,
        proposedRate: Number(form.proposedRate),
      });
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to submit application.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <h2 className="modal-title">Apply for this Job</h2>
        <p className="text-secondary mb-2" style={{ marginBottom: 24 }}>
          Applying to: <strong style={{ color: "var(--text-primary)" }}>{job.title}</strong>
        </p>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Proposed Rate (USD)</label>
            <input
              className="form-input"
              type="number"
              placeholder={`Client budget: $${job.budget}`}
              min="0"
              value={form.proposedRate}
              onChange={(e) => setForm((f) => ({ ...f, proposedRate: e.target.value }))}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Cover Letter</label>
            <textarea
              className="form-textarea"
              placeholder="Introduce yourself, explain your relevant experience, and why you're the right fit…"
              value={form.coverLetter}
              onChange={(e) => setForm((f) => ({ ...f, coverLetter: e.target.value }))}
              style={{ minHeight: 160 }}
              required
            />
          </div>
          <div className="modal-actions">
            <button className="btn btn-secondary" type="button" onClick={onClose}>
              Cancel
            </button>
            <button className="btn btn-primary" type="submit" disabled={loading}>
              {loading ? "Submitting…" : "Submit Application"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function JobDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [applied, setApplied] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    api.get(`/jobs/${id}`)
      .then((r) => setJob(r.data))
      .catch(() => navigate("/"))
      .finally(() => setLoading(false));
  }, [id]);

  const handleDelete = async () => {
    if (!confirm("Delete this job? This action cannot be undone.")) return;
    setDeleteLoading(true);
    try {
      await api.delete(`/jobs/${id}`);
      navigate("/dashboard");
    } catch (err) {
      alert(err.response?.data?.message || "Delete failed.");
    } finally {
      setDeleteLoading(false);
    }
  };

  if (loading) return <div className="spinner-wrap"><div className="spinner" /></div>;
  if (!job) return null;

  const isOwner = user && job.postedBy?._id === user._id;
  const canApply = user && !isOwner && job.status === "open";

  const statusBadge = {
    open: "badge-green",
    "in-progress": "badge-yellow",
    closed: "badge-gray",
  };

  return (
    <div className="page">
      <div className="container">
        <button
          className="btn btn-secondary btn-sm"
          style={{ marginBottom: 28 }}
          onClick={() => navigate(-1)}
        >
          ← Back
        </button>

        <div className="job-detail-layout">
          {/* Main content */}
          <div>
            <div className="card">
              <div className="flex items-center gap-2 mb-2" style={{ marginBottom: 12 }}>
                <span className={`badge ${statusBadge[job.status]}`}>
                  {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                </span>
                <span className="badge badge-gray">{job.category}</span>
              </div>

              <h1 className="job-detail-title">{job.title}</h1>

              <div className="job-detail-section">
                <p className="section-label">Description</p>
                <p style={{ color: "var(--text-secondary)", lineHeight: 1.8, whiteSpace: "pre-wrap" }}>
                  {job.description}
                </p>
              </div>

              {job.skills?.length > 0 && (
                <div className="job-detail-section">
                  <p className="section-label">Required Skills</p>
                  <div className="skills-list">
                    {job.skills.map((s) => (
                      <span key={s} className="skill-tag">{s}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div>
            <div className="card" style={{ marginBottom: 16 }}>
              <p className="section-label">Job Details</p>
              <div className="info-row">
                <span className="label">Budget</span>
                <span className="value budget">${job.budget.toLocaleString()}</span>
              </div>
              <div className="info-row">
                <span className="label">Posted by</span>
                <span className="value">{job.postedBy?.name}</span>
              </div>
              <div className="info-row">
                <span className="label">Posted</span>
                <span className="value">
                  {new Date(job.createdAt).toLocaleDateString()}
                </span>
              </div>
              {job.deadline && (
                <div className="info-row">
                  <span className="label">Deadline</span>
                  <span className="value">
                    {new Date(job.deadline).toLocaleDateString()}
                  </span>
                </div>
              )}

              {isOwner && (
                <div style={{ marginTop: 20, display: "flex", flexDirection: "column", gap: 10 }}>
                  <Link to={`/jobs/${id}/applications`} className="btn btn-secondary">
                    View Applications
                  </Link>
                  <button
                    className="btn btn-danger"
                    onClick={handleDelete}
                    disabled={deleteLoading}
                  >
                    {deleteLoading ? "Deleting…" : "Delete Job"}
                  </button>
                </div>
              )}

              {canApply && !applied && (
                <button
                  className="btn btn-primary btn-full"
                  style={{ marginTop: 20 }}
                  onClick={() => setShowModal(true)}
                >
                  Apply Now
                </button>
              )}

              {applied && (
                <div className="alert alert-success" style={{ marginTop: 20, marginBottom: 0 }}>
                  ✓ Application submitted!
                </div>
              )}

              {!user && (
                <div style={{ marginTop: 20, textAlign: "center" }}>
                  <Link to="/login" className="btn btn-primary btn-full">
                    Sign in to Apply
                  </Link>
                </div>
              )}
            </div>

            {job.postedBy?.bio && (
              <div className="card">
                <p className="section-label">About the Client</p>
                <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", lineHeight: 1.6 }}>
                  {job.postedBy.bio}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {showModal && (
        <ApplyModal
          job={job}
          onClose={() => setShowModal(false)}
          onSuccess={() => {
            setShowModal(false);
            setApplied(true);
          }}
        />
      )}
    </div>
  );
}
