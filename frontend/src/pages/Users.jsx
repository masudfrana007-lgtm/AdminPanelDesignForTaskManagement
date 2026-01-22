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
    role: me.role === "admin" ? "owner" : "agent"
  });

  const load = async () => {
    const { data } = await api.get("/users");
    setList(data);
  };

  useEffect(() => {
    load();
  }, []);

  const onChange = (key, value) => {
    setForm(p => ({ ...p, [key]: value }));
    setFieldErrors(p => ({ ...p, [key]: null }));
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
        role: me.role === "admin" ? "owner" : "agent"
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
                  {list.map(u => (
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
          </div>
        </div>
      </div>
  </AppLayout>
  );
}
