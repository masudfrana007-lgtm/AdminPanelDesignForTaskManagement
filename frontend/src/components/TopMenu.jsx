import { Link, useNavigate } from "react-router-dom";
import { getUser, logout } from "../auth";

export default function TopMenu() {
  const user = getUser();
  const nav = useNavigate();
  const role = user?.role;

  const doLogout = () => {
    logout();
    nav("/login", { replace: true });
  };

  return (
    <div className="topmenu">
      <div className="menu-left">
        <Link to="/" className="menu-item">Dashboard</Link>

        {(role === "admin" || role === "owner") && (
          <Link to="/users" className="menu-item">Users</Link>
        )}

        {role === "owner" && (
          <Link to="/tasks" className="menu-item">Tasks</Link>
        )}

        {(role === "owner" || role === "agent") && (
          <Link to="/sets" className="menu-item">Sets</Link>
        )}
      </div>

      <div className="menu-right">
        <span className="badge">{role}</span>
        <button className="btn small" onClick={doLogout}>Logout</button>
      </div>
    </div>
  );
}
