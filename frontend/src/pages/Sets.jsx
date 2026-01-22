import { useEffect, useMemo, useState } from "react";
import api from "../services/api";
import "../styles/app.css";
import AppLayout from "../components/AppLayout";

export default function Sets() {
  const [sets, setSets] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [selectedSetId, setSelectedSetId] = useState(null);
  const [tasksInSet, setTasksInSet] = useState([]);
  const [err, setErr] = useState("");
  const [ok, setOk] = useState("");

  const [createForm, setCreateForm] = useState({ name: "", max_tasks: 3 });

  const selectedSet = useMemo(
    () => sets.find(s => s.id === selectedSetId) || null,
    [sets, selectedSetId]
  );

  const availableTasks = useMemo(() => {
    const idsInSet = new Set(tasksInSet.map(t => t.id));
    return tasks.filter(t => !idsInSet.has(t.id));
  }, [tasks, tasksInSet]);

  const load = async () => {
    const [s, t] = await Promise.all([api.get("/sets"), api.get("/tasks")]);
    setSets(s.data);
    setTasks(t.data);
  };

  const loadSetTasks = async (id) => {
    const { data } = await api.get(`/sets/${id}/tasks`);
    setTasksInSet(data);
  };

  useEffect(() => { load(); }, []);

  const createSet = async (e) => {
    e.preventDefault();
    setErr(""); setOk("");
    try {
      await api.post("/sets", { name: createForm.name, max_tasks: Number(createForm.max_tasks) });
      setCreateForm({ name: "", max_tasks: 3 });
      setOk("Set created");
      await load();
      setTimeout(() => setOk(""), 1500);
    } catch (e2) {
      setErr(e2?.response?.data?.message || "Failed");
    }
  };

  const openSet = async (id) => {
    setSelectedSetId(id);
    setErr(""); setOk("");
    await loadSetTasks(id);
  };

  const addTask = async (taskId) => {
    setErr(""); setOk("");
    if (!selectedSetId) return;
    try {
      await api.post(`/sets/${selectedSetId}/tasks`, { task_id: taskId });
      await loadSetTasks(selectedSetId);
      await load();
      setOk("Added");
      setTimeout(() => setOk(""), 900);
    } catch (e2) {
      setErr(e2?.response?.data?.message || "Failed");
    }
  };

  const removeTask = async (taskId) => {
    setErr(""); setOk("");
    if (!selectedSetId) return;
    await api.delete(`/sets/${selectedSetId}/tasks/${taskId}`);
    await loadSetTasks(selectedSetId);
    setOk("Removed");
    setTimeout(() => setOk(""), 900);
  };

  const currentCount = tasksInSet.length;
  const max = selectedSet?.max_tasks ?? 0;

  return (
    <AppLayout>
      <div className="container">
        <h2>Sets (Packages)</h2>

        <div className="card" style={{ marginBottom: 14 }}>
          <h3>Create Set</h3>
          <div className="small">Owner and Agent can create sets. Max tasks is enforced.</div>
          <div className="hr" />
          <form onSubmit={createSet} style={{ display: "grid", gap: 10, maxWidth: 420 }}>
            <div>
              <div className="small">Set name</div>
              <input
                value={createForm.name}
                onChange={(e) => setCreateForm(p => ({ ...p, name: e.target.value }))}
              />
            </div>
            <div>
              <div className="small">Max tasks</div>
              <input
                type="number"
                value={createForm.max_tasks}
                onChange={(e) => setCreateForm(p => ({ ...p, max_tasks: e.target.value }))}
              />
            </div>

            {err && <div className="error">{err}</div>}
            {ok && <div className="ok">{ok}</div>}

            <button className="btn" type="submit">Create</button>
          </form>
        </div>

        <div className="row">
          <div className="col">
            <div className="card">
              <h3>All Sets</h3>
              <div className="small">Click “Open” to manage tasks inside set.</div>
              <div className="hr" />
              <ul style={{ margin: 0, paddingLeft: 18, lineHeight: 1.7 }}>
                {sets.map(s => (
                  <li key={s.id}>
                    <button
                      className="btn small"
                      onClick={() => openSet(s.id)}
                      style={{ marginRight: 8 }}
                    >
                      Open
                    </button>
                    <b>{s.name}</b> <span className="badge">max {s.max_tasks}</span>
                    <div className="small">created_by: {s.created_by}</div>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="col">
            <div className="card">
              <h3>Set Details</h3>
              {!selectedSetId ? (
                <div className="small">Select a set from the left.</div>
              ) : (
                <>
                  <div className="small">
                    Set: <b>{selectedSet?.name}</b> — capacity: <span className="badge">{currentCount}/{max}</span>
                  </div>
                  <div className="hr" />

                  {err && <div className="error">{err}</div>}
                  {ok && <div className="ok">{ok}</div>}

                  <div style={{ marginBottom: 14 }}>
                    <div className="small"><b>Tasks inside set</b></div>
                    <ul style={{ margin: 8, paddingLeft: 18, lineHeight: 1.7 }}>
                      {tasksInSet.map(t => (
                        <li key={t.id}>
                          <b>{t.title}</b>
                          <div className="small">
                            Qty: {t.quantity} | Rate: {t.rate} | Commission: {t.commission_rate}% | Price: <b>{t.price}</b>
                          </div>
                          <button
                            className="btn small danger"
                            style={{ marginLeft: 8 }}
                            onClick={() => removeTask(t.id)}
                          >
                            remove
                          </button>
                        </li>
                      ))}
                      {!tasksInSet.length && <li className="small">No tasks added yet.</li>}
                    </ul>
                  </div>

                  <div>
                    <div className="small"><b>Add a task</b></div>
                    <ul style={{ margin: 8, paddingLeft: 18, lineHeight: 1.7 }}>
                      {availableTasks.map(t => (
                        <li key={t.id}>
                          <b>{t.title}</b>
                          <div className="small">
                            Qty: {t.quantity} | Price: <b>{t.price}</b>
                          </div>
                          <button
                            className="btn small"
                            style={{ marginLeft: 8 }}
                            onClick={() => addTask(t.id)}
                          >
                            add
                          </button>
                        </li>
                      ))}
                      {!availableTasks.length && (
                        <li className="small">All tasks are already in this set.</li>
                      )}
                    </ul>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
