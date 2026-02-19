import { useEffect, useState } from "react";
import api from "../services/api";
import { getUser } from "../auth";
import "../styles/app.css";
import AppLayout from "../components/AppLayout";

export default function Users() {
  const me = getUser();
  const [list, setList] = useState([]);
  const [err, setErr] = useState("");
  const [ok, setOk] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: me.role === "admin" ? "owner" : "agent",
  });

  const load = async () => {
    try {
      const { data } = await api.get("/users");
      setList(data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onChange = (key, value) => {
    setForm((p) => ({ ...p, [key]: value }));
    setFieldErrors((p) => ({ ...p, [key]: null }));
  };

  const create = async (e) => {
    e.preventDefault();
    setErr("");
    setOk("");
    setFieldErrors({});

    try {
      await api.post("/users", form);
      setForm({
        name: "",
        email: "",
        password: "",
        role: me.role === "admin" ? "owner" : "agent",
      });
      setOk("Created successfully");
      await load();
      setTimeout(() => setOk(""), 1500);
    } catch (e2) {
      const data = e2?.response?.data;

      if (data?.fieldErrors) {
        setFieldErrors(data.fieldErrors);
      } else {
        setErr(data?.message || "Failed");
      }
    }
  };

  const toggleBlock = async (user) => {
    try {
      if (user.is_blocked) {
        await api.post(`/users/${user.id}/unblock`);
      } else {
        await api.post(`/users/${user.id}/block`);
      }
      await load();
    } catch (e) {
      console.error(e);
      setErr("Failed to update status");
      setTimeout(() => setErr(""), 2000);
    }
  };

  return (
    <AppLayout>
      <div className="users-page">
        <style>{`
          .users-page{
            min-width: 0;
            max-width: 100%;
            overflow-x: clip;
          }
          @supports not (overflow-x: clip) {
            .users-page{ overflow-x: hidden; }
          }
          .users-page .container,
          .users-page .row,
          .users-page .col,
          .users-page .card{
            min-width: 0;
            max-width: 100%;
            box-sizing: border-box;
          }
          @media (max-width: 900px){
            .users-page .row{
              display: block !important;
              width: 100%;
            }
            .users-page .col{
              width: 100% !important;
              max-width: 100% !important;
            }
          }
          .users-page input,
          .users-page button{
            width: 100%;
            max-width: 100%;
            box-sizing: border-box;
          }
          .users-page .table-scroll{
            width: 100%;
            max-width: 100%;
            overflow-x: auto;
            overflow-y: hidden;
            -webkit-overflow-scrolling: touch;
          }
          .users-page .table-scroll table{
            width: 100% !important;
            min-width: 900px;
            max-width: none !important;
            table-layout: auto;
            border-collapse: collapse;
          }
          .users-page .table-scroll th,
          .users-page .table-scroll td{
            white-space: nowrap;
          }
          @media (max-width: 520px){
            .users-page .table-scroll table{ min-width: 760px; }
          }
          .badge.red{ background: #e74c3c; color: white; }
          .badge.green{ background: #2ecc71; color: white; }
          .btn-sm { padding: 4px 8px; font-size: 0.8rem; margin-left: 4px; }
        `}</style>

        <div className="container">
          <div className="topbar">
            <div>
              <h2>Users</h2>
              <div className="small">
                You are <span className="badge">{me.role}</span>
              </div>
            </div>
          </div>

          <div style={{ display: "grid", gap: 16 }}>
            {/* Create User Form */}
            <div className="card">
              <h3>Create {me.role === "admin" ? "Owner" : "Agent"}</h3>
              <div className="small">
                {me.role === "admin"
                  ? "Admin can create owner only."
                  : "Owner can create agent only."}
              </div>
              <div className="hr" />

              <form onSubmit={create} style={{ display: "grid", gap: 10 }}>
                <div>
                  <div className="small">Name</div>
                  <input
                    value={form.name}
                    onChange={(e) => onChange("name", e.target.value)}
                  />
                  {fieldErrors.name && (
                    <div className="error">{fieldErrors.name[0]}</div>
                  )}
                </div>

                <div>
                  <div className="small">Email</div>
                  <input
                    value={form.email}
                    onChange={(e) => onChange("email", e.target.value)}
                  />
                  {fieldErrors.email && (
                    <div className="error">{fieldErrors.email[0]}</div>
                  )}
                </div>

                <div>
                  <div className="small">Password (min 6)</div>
                  <input
                    type="password"
                    value={form.password}
                    onChange={(e) => onChange("password", e.target.value)}
                  />
                  {fieldErrors.password && (
                    <div className="error">{fieldErrors.password[0]}</div>
                  )}
                </div>

                <div>
                  <div className="small">Role</div>
                  <input value={form.role} disabled />
                </div>

                {err && <div className="error">{err}</div>}
                {ok && <div className="ok">{ok}</div>}

                <button className="btn" type="submit">
                  Create
                </button>
              </form>
            </div>

            {/* Users List */}
            <div className="card">
              <h3>List</h3>
              <div className="small">
                Admin sees all. Owner sees self + agents created by owner.
              </div>
              <div className="hr" />

              <div className="table-scroll">
                <table className="table">
                  <thead>
                    <tr>
                      <th>User ID</th>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Status</th>
                      <th>Created By</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {list.map((u) => (
                      <tr key={u.short_id}>
                        <td>{u.short_id}</td>
                        <td>{u.name}</td>
                        <td>{u.email}</td>
                        <td>
                          <span className="badge">{u.role}</span>
                        </td>
                        <td>
                          <span className={`badge ${u.is_blocked ? "red" : "green"}`}>
                            {u.is_blocked ? "Blocked" : "Active"}
                          </span>
                        </td>
                        <td>{u.created_by ?? "-"}</td>
                        <td>
                          {u.role !== "admin" && (
                            <button
                              className="btn btn-sm"
                              onClick={() => toggleBlock(u)}
                            >
                              {u.is_blocked ? "Unblock" : "Block"}
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="small" style={{ opacity: 0.7, marginTop: 8 }}>
                Tip: swipe left/right to see all columns.
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
