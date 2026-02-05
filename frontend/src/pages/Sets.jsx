import { useEffect, useMemo, useState } from "react";
import api from "../services/api";
import "../styles/app.css";
import AppLayout from "../components/AppLayout";

const API_HOST = "http://159.198.40.145:5010";

export default function Sets() {
  const [sets, setSets] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [selectedSetId, setSelectedSetId] = useState(null);
  const [tasksInSet, setTasksInSet] = useState([]);
  const [err, setErr] = useState("");
  const [ok, setOk] = useState("");

  const [createForm, setCreateForm] = useState({ name: "", max_tasks: 3 });

  const [editingPos, setEditingPos] = useState({}); // taskId -> true/false
  const [posDraft, setPosDraft] = useState({});     // taskId -> number/string

  const selectedSet = useMemo(
    () => sets.find((s) => s.id === selectedSetId) || null,
    [sets, selectedSetId]
  );

  const availableTasks = useMemo(() => {
    const idsInSet = new Set(tasksInSet.map((t) => t.id));
    return tasks.filter((t) => !idsInSet.has(t.id));
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

  const moveTask = async (taskId, toPos) => {
    setErr(""); setOk("");
    if (!selectedSetId) return;
    try {
      await api.put(`/sets/${selectedSetId}/tasks/${taskId}/move`, {
        to_position: Number(toPos),
      });
      await loadSetTasks(selectedSetId);
      setOk("Order updated");
      setTimeout(() => setOk(""), 900);
    } catch (e2) {
      setErr(e2?.response?.data?.message || "Failed to update order");
    }
  };

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    const next = {};
    tasksInSet.forEach((t, idx) => {
      next[t.id] = Number(t.position ?? (idx + 1));
    });
    setPosDraft(next);
    setEditingPos({});
  }, [tasksInSet]);

  const createSet = async (e) => {
    e.preventDefault();
    setErr("");
    setOk("");
    try {
      await api.post("/sets", {
        name: createForm.name,
        max_tasks: Number(createForm.max_tasks),
      });
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
    setErr("");
    setOk("");
    await loadSetTasks(id);
  };

  const addTask = async (taskId) => {
    setErr("");
    setOk("");
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
    setErr("");
    setOk("");
    if (!selectedSetId) return;
    try {
      await api.delete(`/sets/${selectedSetId}/tasks/${taskId}`);
      await loadSetTasks(selectedSetId);
      setOk("Removed");
      setTimeout(() => setOk(""), 900);
    } catch (e2) {
      setErr(e2?.response?.data?.message || "Failed");
    }
  };

  const currentCount = tasksInSet.length;
  const max = selectedSet?.max_tasks ?? 0;

const TaskTable = ({ rows, mode }) => {
  const isRemove = mode === "remove";

  const startEdit = (t, idx) => {
    setEditingPos((p) => ({ ...p, [t.id]: true }));
    setPosDraft((p) => ({ ...p, [t.id]: Number(t.position ?? (idx + 1)) }));
  };

  const cancelEdit = (t, idx) => {
    setEditingPos((p) => ({ ...p, [t.id]: false }));
    setPosDraft((p) => ({ ...p, [t.id]: Number(t.position ?? (idx + 1)) }));
  };

  const confirmAndMove = (t, idx) => {
    const from = Number(t.position ?? (idx + 1));
    const to = Number(posDraft[t.id] || 0);

    if (!Number.isFinite(to) || to < 1) return;

    const okConfirm = window.confirm(
      `Change order?\n\n"${t.title}"\nMove from #${from} to #${to}\n\nThis will shift other tasks.`
    );

    if (!okConfirm) {
      cancelEdit(t, idx);
      return;
    }

    moveTask(t.id, to);
    setEditingPos((p) => ({ ...p, [t.id]: false }));
  };

  return (
    <div className="tableWrap niceTableWrap">
      <table className="table niceTable">
        <thead>
          <tr>
            <th style={{ width: 56 }}>S/N</th>
            <th style={{ width: 86 }}>Image</th>
            <th>Title</th>
            <th style={{ width: 90 }}>Qty</th>
            <th style={{ width: 110 }}>Rate</th>
            <th style={{ width: 130 }}>Commission</th>
            <th style={{ width: 120 }}>Price</th>
            <th style={{ width: 260, textAlign: "right" }}>Action</th>
          </tr>
        </thead>

        <tbody>
          {rows.map((t, idx) => {
            const isEditing = !!editingPos[t.id];

            return (
              <tr key={t.id}>
                <td>
                  <span className="snBadge">{t.position ?? (idx + 1)}</span>
                </td>

                <td>
                  {t.image_url ? (
                    <img className="taskAvatar" src={`${API_HOST}${t.image_url}`} alt="" />
                  ) : (
                    <div className="taskAvatar placeholder" />
                  )}
                </td>

                <td><div className="taskTitle">{t.title}</div></td>
                <td>{t.quantity}</td>
                <td>{t.rate}</td>
                <td>{t.commission_rate}%</td>
                <td><b>{t.price}</b></td>

                <td style={{ textAlign: "right" }}>
                  {isRemove ? (
                    <div className="tblActions">
                      {!isEditing ? (
                        <>
                          <button
                            className="btn small secondary"
                            type="button"
                            onClick={() => startEdit(t, idx)}
                          >
                            Edit order
                          </button>

                          <button
                            className="btn small danger"
                            onClick={() => removeTask(t.id)}
                            type="button"
                          >
                            Remove
                          </button>
                        </>
                      ) : (
                        <>
                          <input
                            type="number"
                            min={1}
                            className="miniPosInput"
                            value={posDraft[t.id] ?? (t.position ?? (idx + 1))}
                            onChange={(e) =>
                              setPosDraft((p) => ({ ...p, [t.id]: Number(e.target.value) }))
                            }
                          />

                          <button
                            className="btn small"
                            type="button"
                            onClick={() => confirmAndMove(t, idx)}
                          >
                            Update
                          </button>

                          <button
                            className="btn small secondary"
                            type="button"
                            onClick={() => cancelEdit(t, idx)}
                          >
                            Cancel
                          </button>
                        </>
                      )}
                    </div>
                  ) : (
                    <button className="btn small" onClick={() => addTask(t.id)} type="button">
                      Add
                    </button>
                  )}
                </td>
              </tr>
            );
          })}

          {!rows.length && (
            <tr>
              <td colSpan={8} className="emptyRow">
                {isRemove ? "No tasks added yet." : "All tasks are already in this set."}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

  return (
    <AppLayout>
      <div className="container">
        <h2>Sets (Packages)</h2>

        {/* Create Set */}
        <div className="card" style={{ marginBottom: 14 }}>
          <h3>Create Set</h3>
          <div className="small">
            Owner and Agent can create sets. Max tasks is enforced.
          </div>
          <div className="hr" />

          <form
            onSubmit={createSet}
            style={{ display: "grid", gap: 10, maxWidth: 420 }}
          >
            <div>
              <div className="small">Set name</div>
              <input
                value={createForm.name}
                onChange={(e) =>
                  setCreateForm((p) => ({ ...p, name: e.target.value }))
                }
              />
            </div>

            <div>
              <div className="small">Max tasks</div>
              <input
                type="number"
                value={createForm.max_tasks}
                onChange={(e) =>
                  setCreateForm((p) => ({ ...p, max_tasks: e.target.value }))
                }
              />
            </div>

            {err && <div className="error">{err}</div>}
            {ok && <div className="ok">{ok}</div>}

            <button className="btn" type="submit">
              Create
            </button>
          </form>
        </div>

        {/* All Sets + Set Details stacked */}
        <div className="row">
          <div className="col">
            {/* All Sets */}
            <div className="card">
              <h3>All Sets</h3>
              <div className="small">Click “Open” to manage tasks inside set.</div>
              <div className="hr" />

              <ul className="setList">
                {sets.map((s) => (
                  <li key={s.id} className="setRow">
                    <div className="setRowLeft">
                      <div className="setName">
                        <b>{s.name}</b>
                        <span className="badge">max {s.max_tasks}</span>
                      </div>
                    </div>

                    <button
                      className="btn small"
                      onClick={() => openSet(s.id)}
                      type="button"
                    >
                      Open
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Set Details */}
            <div className="card" style={{ marginTop: 14 }}>
              <h3>Set Details</h3>

              {!selectedSetId ? (
                <div className="small">Select a set from the list above.</div>
              ) : (
                <>
                  <div className="small">
                    Set: <b>{selectedSet?.name}</b> — capacity:
                    <span className="badge"> {currentCount}/{max}</span>
                  </div>

                  <div className="hr" />

                  {err && <div className="error">{err}</div>}
                  {ok && <div className="ok">{ok}</div>}

                  {/* Tasks in Set */}
                  <div style={{ marginBottom: 14 }}>
                    <div className="sectionTitle">
                      Tasks inside set
                      <span className="mutedChip">
                        {tasksInSet.length} items
                      </span>
                    </div>

                    <TaskTable rows={tasksInSet} mode="remove" />
                  </div>

                  {/* Add Task */}
                  <div>
                    <div className="sectionTitle">
                      Add a task
                      <span className="mutedChip">
                        {availableTasks.length} available
                      </span>
                    </div>

                    <TaskTable rows={availableTasks} mode="add" />
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
