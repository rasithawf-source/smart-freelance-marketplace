import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";

const STATUS_BADGE = {
  open: "badge-green",
  "in-progress": "badge-yellow",
  closed: "badge-gray",
  pending: "badge-yellow",
  accepted: "badge-green",
  rejected: "badge-red",
};

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState("posted");
  const [postedJobs, setPostedJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get("/jobs/my"),
      api.get("/applications/my"),
    ])
      .then(([jobsRes, appsRes]) => {
        setPostedJobs(jobsRes.data);
        setApplications(appsRes.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const deleteJob = async (jobId) => {
    if (!confirm("Delete this job?")) return;
    try {
      await api.delete(`/jobs/${jobId}`);
      setPostedJobs((prev) => prev.filter((j) => j._id !== jobId));
    } catch (err) {
      alert(err.response?.data?.message || "Delete failed.");
    }
  };

  if (loading) return <div className="spinner-wrap"><div className="spinner" /></div>;

  const pendingApps = applications.filter((a) => a.status === "pending").length;
  const acceptedApps = applications.filter((a) => a.status === "accepted").length;
  const openJobs = postedJobs.filter((j) => j.status === "open").length;

  return (
    <div className="page">
      <div className="container">
        <div className="page-header">
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">
            Welcome back, <strong>{user?.name}</strong> ·{" "}
            <span style={{ color: "var(--accent)", textTransform: "capitalize" }}>
              {user?.role}
            </span>
          </p>
        </div>

        {/* Stats */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-number">{postedJobs.length}</div>
            <div className="stat-label">Jobs Posted</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{openJobs}</div>
            <div className="stat-label">Open Jobs</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{applications.length}</div>
            <div className="stat-label">Applications Sent</div>
          </div>
          <div className="stat-card">
            <div className="stat-number" style={{ color: "var(--success)" }}>
              {acceptedApps}
            </div>
            <div className="stat-label">Accepted</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="dashboard-tabs">
          <button
            className={`tab-btn ${tab === "posted" ? "active" : ""}`}
            onClick={() => setTab("posted")}
          >
            Posted Jobs ({postedJobs.length})
          </button>
          <button
            className={`tab-btn ${tab === "applications" ? "active" : ""}`}
            onClick={() => setTab("applications")}
          >
            My Applications ({applications.length})
          </button>
        </div>

        {/* Posted jobs tab */}
        {tab === "posted" && (
          <>
            <div className="section-header">
              <h2 className="section-title">Your Posted Jobs</h2>
              <Link to="/post-job" className="btn btn-primary btn-sm">
                + Post New Job
              </Link>
            </div>

            {postedJobs.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">📋</div>
                <h3 className="empty-state-title">No jobs posted yet</h3>
                <p>Post your first job to start receiving applications.</p>
                <Link to="/post-job" className="btn btn-primary" style={{ marginTop: 20 }}>
                  Post a Job
                </Link>
              </div>
            ) : (
              <div className="card" style={{ padding: 0, overflow: "hidden" }}>
                {postedJobs.map((job, i) => (
                  <div
                    key={job._id}
                    style={{
                      padding: "20px 24px",
                      borderBottom: i < postedJobs.length - 1 ? "1px solid var(--border)" : "none",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 16,
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <div className="flex items-center gap-2 mb-1" style={{ marginBottom: 6 }}>
                        <span className={`badge ${STATUS_BADGE[job.status]}`}>{job.status}</span>
                        <span className="badge badge-gray">{job.category}</span>
                      </div>
                      <p
                        className="font-bold"
                        style={{ cursor: "pointer", color: "var(--text-primary)" }}
                        onClick={() => navigate(`/jobs/${job._id}`)}
                      >
                        {job.title}
                      </p>
                      <p className="text-sm text-muted" style={{ marginTop: 4 }}>
                        ${job.budget.toLocaleString()} · {new Date(job.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Link
                        to={`/jobs/${job._id}/applications`}
                        className="btn btn-secondary btn-sm"
                      >
                        Applications
                      </Link>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => deleteJob(job._id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* Applications tab */}
        {tab === "applications" && (
          <>
            <div className="section-header">
              <h2 className="section-title">Your Applications</h2>
              <Link to="/" className="btn btn-secondary btn-sm">Browse Jobs</Link>
            </div>

            {applications.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">🚀</div>
                <h3 className="empty-state-title">No applications yet</h3>
                <p>Start browsing jobs and apply to your first project.</p>
                <Link to="/" className="btn btn-primary" style={{ marginTop: 20 }}>
                  Browse Jobs
                </Link>
              </div>
            ) : (
              <div className="card">
                {applications.map((app) => (
                  <div key={app._id} className="application-item">
                    <div className="application-info">
                      <p
                        className="application-title"
                        style={{ cursor: "pointer" }}
                        onClick={() => navigate(`/jobs/${app.job?._id}`)}
                      >
                        {app.job?.title}
                      </p>
                      <div className="flex items-center gap-2">
                        <span className="badge badge-gray">{app.job?.category}</span>
                        <span className="text-sm text-muted">
                          Budget: ${app.job?.budget?.toLocaleString()}
                        </span>
                      </div>
                      <p className="application-cover">
                        <strong style={{ color: "var(--text-primary)" }}>
                          Your rate: ${app.proposedRate.toLocaleString()}
                        </strong>{" "}
                        · {new Date(app.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <span className={`badge ${STATUS_BADGE[app.status]}`}>
                      {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
