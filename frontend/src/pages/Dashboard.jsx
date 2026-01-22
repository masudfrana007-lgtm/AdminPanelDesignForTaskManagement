import { Link, useNavigate } from "react-router-dom";
import { getUser, logout } from "../auth";
import "../styles/app.css";
import AppLayout from "../components/AppLayout";

export default function Dashboard() {
  const user = getUser();
  const nav = useNavigate();

  const doLogout = () => {
    logout();
    nav("/login", { replace: true });
  };

  const role = user?.role;

  return (
    <AppLayout>
    <div className="container">
      <div className="topbar">
        <div>
          <h2>Dashboard</h2>
          <div className="small">
            Signed in as <b>{user?.name}</b> ({user?.email}) — <span className="badge">{role}</span>
          </div>
        </div>
      </div>

      <div className="row">
        {(role === "admin" || role === "owner") && (
          <Link className="pilllink" to="/users">
            <b>Users</b>
            <div className="small">
              {role === "admin" ? "Create owners" : "Create agents"}
            </div>
          </Link>
        )}

        {role === "owner" && (
          <Link className="pilllink" to="/tasks">
            <b>Tasks</b>
            <div className="small">Create tasks (owners only)</div>
          </Link>
        )}

        {(role === "owner" || role === "agent") && (
          <Link className="pilllink" to="/sets">
            <b>Sets (Packages)</b>
            <div className="small">Create sets and assign tasks</div>
          </Link>
        )}
      </div>

      <div className="hr" />
      <div className="card">
        <h3>Rules</h3>
        <ul className="small" style={{ margin: 0, paddingLeft: 18, lineHeight: 1.7 }}>
          <li>Admin can create Owner</li>
          <li>Owner can create Agent</li>
          <li>Owner can create Tasks</li>
          <li>Owner and Agent can create Sets</li>
          <li>Set has <b>max_tasks</b> — cannot add more than this</li>
        </ul>
      </div>
    </div>
  </AppLayout>
  );
}
