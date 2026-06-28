import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import JobCard from "../components/JobCard";
import api from "../api/axios";

const CATEGORIES = [
  "All",
  "Web Development",
  "Mobile Development",
  "Design",
  "Writing",
  "Marketing",
  "Data Science",
  "DevOps",
  "Other",
];

export default function Home() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    const fetchJobs = async () => {
      setLoading(true);
      try {
        const params = {};
        if (debouncedSearch) params.search = debouncedSearch;
        if (category !== "All") params.category = category;
        const { data } = await api.get("/jobs", { params });
        setJobs(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, [debouncedSearch, category]);

  return (
    <>
      <section className="hero">
        <div className="container">
          <h1 className="hero-title">
            Find your next <span className="highlight">freelance</span> opportunity
          </h1>
          <p className="hero-subtitle">
            Connect with clients who need your skills. Browse open projects and start earning today.
          </p>
          <div className="hero-actions">
            {user ? (
              <Link to="/post-job" className="btn btn-primary btn-lg">Post a Job</Link>
            ) : (
              <>
                <Link to="/register" className="btn btn-primary btn-lg">Get Started Free</Link>
                <Link to="/login" className="btn btn-secondary btn-lg">Sign In</Link>
              </>
            )}
          </div>
        </div>
      </section>

      <div className="page">
        <div className="container">
          <div className="search-bar">
            <input
              className="form-input"
              placeholder="Search jobs by title or keyword…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <select
              className="form-select"
              style={{ maxWidth: 220 }}
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {loading ? (
            <div className="spinner-wrap"><div className="spinner" /></div>
          ) : jobs.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">🔍</div>
              <h3 className="empty-state-title">No jobs found</h3>
              <p>Try different keywords or clear your filters.</p>
            </div>
          ) : (
            <>
              <p className="text-secondary mb-2" style={{ fontSize: "0.9rem" }}>
                {jobs.length} job{jobs.length !== 1 ? "s" : ""} available
              </p>
              <div className="jobs-grid">
                {jobs.map((job) => (
                  <JobCard key={job._id} job={job} />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
