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
    const { data } = await api.get("/users");
    setList(data);
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

  return (
    <AppLayout>
      {/* ✅ Page-scoped wrapper so NOTHING leaks to other pages */}
      <div className="users-page">
        {/* ✅ Page-only CSS fixes: mobile overflow + table scroll + two cols stack */}
        <style>{`
          .users-page{
            min-width: 0;
            max-width: 100%;
            overflow-x: clip;
          }
          @supports not (overflow-x: clip) {
            .users-page{ overflow-x: hidden; }
          }

          /* let flex/grid children shrink instead of expanding the page */
          .users-page .container,
          .users-page .row,
          .users-page .col,
          .users-page .card{
            min-width: 0;
            max-width: 100%;
            box-sizing: border-box;
          }

          /* ✅ MOBILE: force 2 columns (Create + List) to stack vertically */
          @media (max-width: 900px){
            .users-page .row{
              display: block !important;   /* overrides flex rows from app.css */
              width: 100%;
            }
            .users-page .col{
              width: 100% !important;
              max-width: 100% !important;
            }
          }

          /* ✅ make form controls never overflow on small screens */
          .users-page input,
          .users-page button{
            width: 100%;
            max-width: 100%;
            box-sizing: border-box;
          }

          /* ✅ Table: scroll inside card, never push page width */
          .users-page .table-scroll{
            width: 100%;
            max-width: 100%;
            overflow-x: auto;
            overflow-y: hidden;
            -webkit-overflow-scrolling: touch;
          }

          /* key: table can be wider, wrapper will scroll */
          .users-page .table-scroll table{
            width: 100% !important;
            min-width: 900px;             /* desktop fits, mobile scrolls */
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

          <div className="row">
            <div className="col">
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
            </div>

            <div className="col">
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
                        <th>Created By</th>
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
                          <td>{u.created_by ?? "-"}</td>
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
      </div>
    </AppLayout>
  );
}
