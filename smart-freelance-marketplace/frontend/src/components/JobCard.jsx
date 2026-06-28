import { useNavigate } from "react-router-dom";

const CATEGORY_COLORS = {
  "Web Development": "badge-blue",
  "Mobile Development": "badge-blue",
  Design: "badge-yellow",
  Writing: "badge-green",
  Marketing: "badge-yellow",
  "Data Science": "badge-blue",
  DevOps: "badge-gray",
  Other: "badge-gray",
};

export default function JobCard({ job }) {
  const navigate = useNavigate();

  const timeAgo = (date) => {
    const diff = Date.now() - new Date(date);
    const days = Math.floor(diff / 86400000);
    if (days === 0) return "Today";
    if (days === 1) return "Yesterday";
    if (days < 7) return `${days} days ago`;
    return new Date(date).toLocaleDateString();
  };

  return (
    <div
      className="card card-clickable job-card"
      onClick={() => navigate(`/jobs/${job._id}`)}
    >
      <div className="job-card-header">
        <h3 className="job-card-title">{job.title}</h3>
        <span className={`badge ${CATEGORY_COLORS[job.category] || "badge-gray"}`}>
          {job.category}
        </span>
      </div>

      <p className="job-card-desc">{job.description}</p>

      {job.skills?.length > 0 && (
        <div className="skills-list">
          {job.skills.slice(0, 4).map((skill) => (
            <span key={skill} className="skill-tag">{skill}</span>
          ))}
          {job.skills.length > 4 && (
            <span className="skill-tag">+{job.skills.length - 4}</span>
          )}
        </div>
      )}

      <div className="job-card-footer">
        <span className="budget">${job.budget.toLocaleString()}</span>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted">
            by {job.postedBy?.name || "Anonymous"}
          </span>
          <span className="text-muted">·</span>
          <span className="text-sm text-muted">{timeAgo(job.createdAt)}</span>
        </div>
      </div>
    </div>
  );
}
