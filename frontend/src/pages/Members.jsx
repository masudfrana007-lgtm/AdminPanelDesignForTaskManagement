import { useEffect, useState } from "react";
import api from "../services/api";
import AppLayout from "../components/AppLayout";

export default function Members() {
  const [list, setList] = useState([]);

  const load = async () => {
    const { data } = await api.get("/members");
    setList(data);
  };

  useEffect(() => { load(); }, []);

  const approve = async (id) => {
    await api.patch(`/members/${id}/approve`);
    load();
  };

  const reject = async (id) => {
    await api.patch(`/members/${id}/reject`);
    load();
  };

  return (
    <AppLayout>
      <div className="container">
        <div className="card">
          <h3>Members</h3>

          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nickname</th>
                <th>Phone</th>
                <th>Status</th>
                <th>Ranking</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {list.map(m => (
                <tr key={m.id}>
                  <td>{m.short_id}</td>
                  <td>{m.nickname}</td>
                  <td>{m.phone}</td>
                  <td><span className="badge">{m.approval_status}</span></td>
                  <td>{m.ranking}</td>
                  <td>
                    {m.approval_status === "pending" && (
                      <>
                        <button className="btn" onClick={() => approve(m.id)}>Approve</button>
                        <button className="btn danger" onClick={() => reject(m.id)}>Reject</button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AppLayout>
  );
}
