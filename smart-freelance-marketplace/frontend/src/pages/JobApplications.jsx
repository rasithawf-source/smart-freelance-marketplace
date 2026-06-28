import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios";

export default function JobApplications() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get(`/jobs/${id}`),
      api.get(`/applications/job/${id}`),
    ])
      .then(([jobRes, appsRes]) => {
        setJob(jobRes.data);
        setApplications(appsRes.data);
      })
      .catch(() => navigate("/dashboard"))
      .finally(() => setLoading(false));
  }, [id]);

  const updateStatus = async (appId, status) => {
    try {
      const { data } = await api.patch(`/applications/${appId}`, { status });
      setApplications((prev) =>
        prev.map((a) => (a._id === appId ? { ...a, status: data.status } : a))
      );
    } catch (err) {
      alert(err.response?.data?.message || "Update failed.");
    }
  };

  const statusBadge = {
    pending: "badge-yellow",
    accepted: "badge-green",
    rejected: "badge-red",
  };

  if (loading) return <div className="spinner-wrap"><div className="spinner" /></div>;

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

        <div className="page-header">
          <h1 className="page-title">Applications</h1>
          <p className="page-subtitle">
            {applications.length} application{applications.length !== 1 ? "s" : ""} for{" "}
            <strong>{job?.title}</strong>
          </p>
        </div>

        {applications.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📭</div>
            <h3 className="empty-state-title">No applications yet</h3>
            <p>Applications will appear here once freelancers apply.</p>
          </div>
        ) : (
          <div className="card">
            {applications.map((app) => (
              <div key={app._id} className="application-item">
                <div className="application-info">
                  <p className="application-title">{app.applicant?.name}</p>
                  <p className="application-meta">{app.applicant?.email}</p>

                  {app.applicant?.skills?.length > 0 && (
                    <div className="skills-list" style={{ marginTop: 8 }}>
                      {app.applicant.skills.map((s) => (
                        <span key={s} className="skill-tag">{s}</span>
                      ))}
                    </div>
                  )}

                  <p className="application-cover">{app.coverLetter}</p>

                  <div className="flex items-center gap-2 mt-1">
                    <span className="budget" style={{ fontSize: "0.95rem" }}>
                      ${app.proposedRate.toLocaleString()}
                    </span>
                    <span className="text-muted">proposed rate</span>
                  </div>
                </div>

                <div className="flex-col" style={{ gap: 8, flexShrink: 0, alignItems: "flex-end" }}>
                  <span className={`badge ${statusBadge[app.status]}`}>
                    {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                  </span>
                  {app.status === "pending" && (
                    <div className="application-actions">
                      <button
                        className="btn btn-success btn-sm"
                        onClick={() => updateStatus(app._id, "accepted")}
                      >
                        Accept
                      </button>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => updateStatus(app._id, "rejected")}
                      >
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
