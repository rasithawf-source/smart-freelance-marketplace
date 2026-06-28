import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const isActive = (path) => pathname === path ? "nav-link active" : "nav-link";

  return (
    <nav className="navbar">
      <div className="container">
        <Link to="/" className="nav-logo">
          Smart<span>Freelance</span>
        </Link>

        <div className="nav-links">
          <Link to="/" className={isActive("/")}>Browse Jobs</Link>

          {user ? (
            <>
              <Link to="/post-job" className={isActive("/post-job")}>Post a Job</Link>
              <Link to="/dashboard" className={isActive("/dashboard")}>Dashboard</Link>
              <button className="btn btn-secondary btn-sm" onClick={handleLogout}>
                Sign Out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className={isActive("/login")}>Sign In</Link>
              <Link to="/register" className="btn btn-primary btn-sm">
                Get Started
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
