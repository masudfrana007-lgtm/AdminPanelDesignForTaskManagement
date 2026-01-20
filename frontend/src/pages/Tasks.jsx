import { useEffect, useState } from "react";
import api from "../services/api";
import "../styles/app.css";
import TopMenu from "../components/TopMenu";

export default function Tasks() {
  const [list, setList] = useState([]);
  const [form, setForm] = useState({ title: "", description: "" });
  const [err, setErr] = useState("");
  const [ok, setOk] = useState("");

  const load = async () => {
    const { data } = await api.get("/tasks");
    setList(data);
  };

  useEffect(() => { load(); }, []);

  const create = async (e) => {
    e.preventDefault();
    setErr(""); setOk("");
    try {
      await api.post("/tasks", form);
      setForm({ title: "", description: "" });
      setOk("Task created");
      await load();
      setTimeout(() => setOk(""), 1500);
    } catch (e2) {
      setErr(e2?.response?.data?.message || "Failed");
    }
  };

  return (
     <>
    <TopMenu />
    <div className="container">
      <h2>Tasks</h2>
      <div className="row">
        <div className="col">
          <div className="card">
            <h3>Create Task (Owner)</h3>
            <div className="hr" />
            <form onSubmit={create} style={{ display: "grid", gap: 10 }}>
              <div>
                <div className="small">Title</div>
                <input value={form.title} onChange={(e) => setForm(p => ({ ...p, title: e.target.value }))} />
              </div>
              <div>
                <div className="small">Description</div>
                <textarea value={form.description} onChange={(e) => setForm(p => ({ ...p, description: e.target.value }))} />
              </div>
              {err && <div className="error">{err}</div>}
              {ok && <div className="ok">{ok}</div>}
              <button className="btn" type="submit">Create</button>
            </form>
          </div>
        </div>

        <div className="col">
          <div className="card">
            <h3>All Tasks</h3>
            <div className="small">Agents can view tasks created by their owner.</div>
            <div className="hr" />
            <ul style={{ margin: 0, paddingLeft: 18, lineHeight: 1.7 }}>
              {list.map(t => (
                <li key={t.id}>
                  <b>{t.title}</b>
                  <div className="small">{t.description || ""}</div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}
