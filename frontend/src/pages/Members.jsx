import { useEffect, useState } from "react";
import api from "../services/api";
import { getUser } from "../auth";
import "../styles/app.css";
import AppLayout from "../components/AppLayout";
import { Link } from "react-router-dom";

export default function Members() {
  const me = getUser();
  const [list, setList] = useState([]);

  const load = async () => {
    const { data } = await api.get("/members");
    setList(data);
  };

  useEffect(() => { load(); }, []);

  return (
    <AppLayout>
      <div className="container">
        <div className="topbar">
          <div>
            <h2>Members</h2>
            <div className="small">
              You are <span className="badge">{me.role}</span>
            </div>
          </div>

          <Link to="/members/create" className="btn">
            + Create Member
          </Link>
        </div>

        <div className="card">
          <h3>Members List</h3>
          <div className="small">
            Agent sees only their members. Owner sees own + members created by their agents.
          </div>
          <div className="hr" />

          <table className="table">
            <thead>
              <tr>
                <th>Member ID</th>
                <th>Nickname</th>
                <th>Phone</th>
                <th>Email</th>
                <th>Ranking</th>
                <th>Withdraw</th>
                <th>Sponsor</th>
              </tr>
            </thead>
            <tbody>
              {list.map(m => (
                <tr key={m.short_id || m.id}>
                  <td>{m.short_id}</td>
                  <td>{m.nickname}</td>
                  <td>{m.phone}</td>
                  <td>{m.email || "-"}</td>
                  <td><span className="badge">{m.ranking}</span></td>
                  <td><span className="badge">{m.withdraw_privilege ? "Enabled" : "Disabled"}</span></td>
                  <td>{m.sponsor_short_id}</td>
                </tr>
              ))}

              {!list.length && (
                <tr>
                  <td colSpan="7" className="small">No members yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AppLayout>
  );
}
