import { useEffect, useMemo, useState } from "react";
import api from "../services/api";
import AppLayout from "../components/AppLayout";
import "../styles/sets.css";

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
  const [posDraft, setPosDraft] = useState({}); // taskId -> number/string

  const [setQuery, setSetQuery] = useState("");
  const [taskQuery, setTaskQuery] = useState("");

  const selectedSet = useMemo(
    () => sets.find((s) => s.id === selectedSetId) || null,
    [sets, selectedSetId]
  );

  const money = (n) =>
    new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 }).format(
      Number(n || 0)
    );

  const commissionAmount = (t) => {
    const qty = Number(t.quantity || 0);
    const rate = Number(t.rate || 0);
    const price = Number(t.price ?? qty * rate);
    const cr = Number(t.commission_rate || 0);
    return (price * cr) / 100;
  };

  const filteredSets = useMemo(() => {
    const q = setQuery.trim().toLowerCase();
    if (!q) return sets;
    return sets.filter((s) => String(s.name || "").toLowerCase().includes(q));
  }, [sets, setQuery]);

  const availableTasks = useMemo(() => {
    const idsInSet = new Set(tasksInSet.map((t) => t.id));
    const arr = tasks.filter((t) => !idsInSet.has(t.id));
    const q = taskQuery.trim().toLowerCase();
    if (!q) return arr;
    return arr.filter((t) => {
      const title = String(t.title || "").toLowerCase();
      const type = String(t.task_type || "").toLowerCase();
      return title.includes(q) || type.includes(q);
    });
  }, [tasks, tasksInSet, taskQuery]);

  const filteredTasksInSet = useMemo(() => {
    const q = taskQuery.trim().toLowerCase();
    if (!q) return tasksInSet;
    return tasksInSet.filter((t) => {
      const title = String(t.title || "").toLowerCase();
      const type = String(t.task_type || "").toLowerCase();
      return title.includes(q) || type.includes(q);
    });
  }, [tasksInSet, taskQuery]);

  const toast = (msg, ms = 1200) => {
    setOk(msg);
    setTimeout(() => setOk(""), ms);
  };

  const load = async () => {
    setErr("");
    try {
      const [s, t] = await Promise.all([api.get("/sets"), api.get("/tasks")]);
      setSets(Array.isArray(s.data) ? s.data : []);
      setTasks(Array.isArray(t.data) ? t.data : []);
    } catch (e) {
      setErr(e?.response?.data?.message || "Failed to load sets/tasks");
    }
  };

  const loadSetTasks = async (id) => {
    setErr("");
    try {
      const { data } = await api.get(`/sets/${id}/tasks`);
      setTasksInSet(Array.isArray(data) ? data : []);
    } catch (e) {
      setTasksInSet([]);
      setErr(e?.response?.data?.message || "Failed to load set tasks");
    }
  };

  const openSet = async (id) => {
    setSelectedSetId(id);
    setErr("");
    setOk("");
    await loadSetTasks(id);
  };

  const createSet = async (e) => {
    e.preventDefault();
    setErr("");
    setOk("");

    const name = String(createForm.name || "").trim();
    const max_tasks = Number(createForm.max_tasks);

    if (!name) return setErr("Set name is required");
    if (!Number.isFinite(max_tasks) || max_tasks < 1)
      return setErr("Max tasks must be at least 1");

    try {
      await api.post("/sets", { name, max_tasks });
      setCreateForm({ name: "", max_tasks: 3 });
      toast("Set created");
      await load();
    } catch (e2) {
      setErr(e2?.response?.data?.message || "Failed to create set");
    }
  };

const deleteSet = async (id) => {
  setErr("");
  setOk("");

  // 1) first ask the server what will happen (preview)
  let preview = null;
  try {
    const { data } = await api.get(`/sets/${id}/delete-preview`);
    preview = data;
  } catch (e) {
    // if preview endpoint fails, fallback to old flow
    const okConfirm = window.confirm(
      `Delete this set?\n\nThis cannot be undone.`
    );
    if (!okConfirm) return;

    try {
      await api.delete(`/sets/${id}`);
      toast("Set deleted");
      await load();
      if (selectedSetId === id) {
        setSelectedSetId(null);
        setTasksInSet([]);
      }
      return;
    } catch (e2) {
      return setErr(e2?.response?.data?.message || "Failed to delete set");
    }
  }

  const setName = preview?.set?.name || `#${id}`;
  const assignedCount = Number(preview?.assigned_count || 0);
  const activeCount = Number(preview?.active_count || 0);
  const activeMembers = Array.isArray(preview?.active_members) ? preview.active_members : [];

  // 2) if unused -> normal delete confirm
  if (assignedCount === 0) {
    const okConfirm = window.confirm(
      `Delete set "${setName}"?\n\nThis will permanently delete the set and all tasks inside it.\n\nThis cannot be undone.`
    );
    if (!okConfirm) return;

    try {
      await api.delete(`/sets/${id}`);
      toast("Set deleted");
      await load();

      if (selectedSetId === id) {
        setSelectedSetId(null);
        setTasksInSet([]);
      }
    } catch (e2) {
      setErr(e2?.response?.data?.message || "Failed to delete set");
    }
    return;
  }

  // 3) used -> show who is running it now, then archive confirm
  const who = activeMembers
    .slice(0, 12)
    .map((m) => `- ${m.short_id || m.member_id} (${m.nickname || "-"})`)
    .join("\n");

  const more = activeMembers.length > 12 ? `\n...and ${activeMembers.length - 12} more` : "";

  const msg =
    `This set was USED before, so please confirm before deleting.\n\n` +
    `Set: "${setName}"\n` +
    `Assigned total: ${assignedCount}\n` +
    `Running now: ${activeCount}\n\n` +
    (activeCount > 0
      ? `Running members:\n${who}${more}\n\n`
      : "") +
    `Confirm archive? (History/earnings will remain.)`;

  const okConfirm = window.confirm(msg);
  if (!okConfirm) return;

  try {
    await api.delete(`/sets/${id}?force=true`);
    toast("Set archived");
    await load();

    if (selectedSetId === id) {
      setSelectedSetId(null);
      setTasksInSet([]);
    }
  } catch (e2) {
    setErr(e2?.response?.data?.message || "Failed to archive set");
  }
};

  const addTask = async (taskId) => {
    setErr("");
    setOk("");
    if (!selectedSetId) return;

    try {
      await api.post(`/sets/${selectedSetId}/tasks`, { task_id: taskId });
      await loadSetTasks(selectedSetId);
      await load();
      toast("Task added", 900);
    } catch (e2) {
      setErr(e2?.response?.data?.message || "Failed to add task");
    }
  };

  const removeTask = async (taskId) => {
    setErr("");
    setOk("");
    if (!selectedSetId) return;

    try {
      await api.delete(`/sets/${selectedSetId}/tasks/${taskId}`);
      await loadSetTasks(selectedSetId);
      toast("Task removed", 900);
    } catch (e2) {
      setErr(e2?.response?.data?.message || "Failed to remove task");
    }
  };

  const moveTask = async (taskId, toPos) => {
    setErr("");
    setOk("");
    if (!selectedSetId) return;

    try {
      await api.put(`/sets/${selectedSetId}/tasks/${taskId}/move`, {
        to_position: Number(toPos),
      });
      await loadSetTasks(selectedSetId);
      toast("Order updated", 900);
    } catch (e2) {
      const data = e2?.response?.data;
      setErr(
        data?.pg
          ? `${data.message} | ${data.pg.code || ""} ${data.pg.constraint || ""} ${
              data.pg.detail || ""
            }`.trim()
          : data?.message || "Failed to update order"
      );
    }
  };

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    const next = {};
    tasksInSet.forEach((t, idx) => {
      next[t.id] = Number(t.position ?? idx + 1);
    });
    setPosDraft(next);
    setEditingPos({});
  }, [tasksInSet]);

  const currentCount = tasksInSet.length;
  const max = selectedSet?.max_tasks ?? 0;

  const TaskTable = ({ rows, mode }) => {
    const isRemove = mode === "remove";

    const startEdit = (t, idx) => {
      setEditingPos((p) => ({ ...p, [t.id]: true }));
      setPosDraft((p) => ({ ...p, [t.id]: Number(t.position ?? idx + 1) }));
    };

    const cancelEdit = (t, idx) => {
      setEditingPos((p) => ({ ...p, [t.id]: false }));
      setPosDraft((p) => ({ ...p, [t.id]: Number(t.position ?? idx + 1) }));
    };

    const confirmAndMove = (t, idx) => {
      const from = Number(t.position ?? idx + 1);
      const to = Number(posDraft[t.id] || 0);

      if (!Number.isFinite(to) || to < 1) return;

      const okConfirm = window.confirm(
        `Change order?\n\n"${t.title}"\nMove from #${from} to #${to}\n\nThis will shift other tasks.`
      );
      if (!okConfirm) return cancelEdit(t, idx);

      moveTask(t.id, to);
      setEditingPos((p) => ({ ...p, [t.id]: false }));
    };

    return (
      <div className="sx-tableWrap">
        <table className="sx-table">
          <thead>
            <tr>
              <th style={{ width: 70 }}>Pos</th>
              <th style={{ width: 92 }}>Image</th>
              <th>Title</th>
              <th style={{ width: 120 }}>Type</th>
              <th style={{ width: 70 }}>Qty</th>
              <th style={{ width: 90 }}>Rate</th>
              <th style={{ width: 120 }}>Comm %</th>
              <th style={{ width: 120 }}>Comm</th>
              <th style={{ width: 120 }}>Price</th>
              <th style={{ width: 210, textAlign: "right" }}>Action</th>
            </tr>
          </thead>

          <tbody>
            {rows.map((t, idx) => {
              const isEditing = !!editingPos[t.id];
              const price =
                t.price ?? Number(t.quantity || 0) * Number(t.rate || 0);

              return (
                <tr key={t.id}>
                  <td>
                    <span className="sx-pill">{t.position ?? idx + 1}</span>
                  </td>

                  <td>
                    {t.image_url ? (
                      <img
                        className="sx-avatar"
                        src={`${API_HOST}${t.image_url}`}
                        alt=""
                      />
                    ) : (
                      <div className="sx-avatar sx-avatar--ph" />
                    )}
                  </td>

                  <td>
                    <div className="sx-title">{t.title}</div>
                    <div className="sx-sub">
                      ID: <span className="sx-mono">{t.id}</span>
                    </div>
                  </td>

                  <td style={{ textTransform: "capitalize" }}>
                    {t.task_type || "-"}
                  </td>

                  <td>{t.quantity}</td>
                  <td>{money(t.rate)}</td>
                  <td>{t.commission_rate}%</td>
                  <td>
                    <b>{money(commissionAmount(t))}</b>
                  </td>
                  <td>
                    <b>{money(price)}</b>
                  </td>

                  <td style={{ textAlign: "right" }}>
                    {isRemove ? (
                      <div className="sx-actions">
                        {!isEditing ? (
                          <>
                            <button
                              className="sx-btn sx-btn--soft"
                              type="button"
                              onClick={() => startEdit(t, idx)}
                            >
                              Edit order
                            </button>
                            <button
                              className="sx-btn sx-btn--danger"
                              type="button"
                              onClick={() => removeTask(t.id)}
                            >
                              Remove
                            </button>
                          </>
                        ) : (
                          <>
                            <input
                              type="number"
                              min={1}
                              className="sx-input sx-input--mini"
                              value={posDraft[t.id] ?? (t.position ?? idx + 1)}
                              onChange={(e) =>
                                setPosDraft((p) => ({
                                  ...p,
                                  [t.id]: Number(e.target.value),
                                }))
                              }
                            />
                            <button
                              className="sx-btn"
                              type="button"
                              onClick={() => confirmAndMove(t, idx)}
                            >
                              Update
                            </button>
                            <button
                              className="sx-btn sx-btn--soft"
                              type="button"
                              onClick={() => cancelEdit(t, idx)}
                            >
                              Cancel
                            </button>
                          </>
                        )}
                      </div>
                    ) : (
                      <button
                        className="sx-btn"
                        onClick={() => addTask(t.id)}
                        type="button"
                      >
                        Add
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}

            {!rows.length && (
              <tr>
                <td colSpan={10} className="sx-emptyRow">
                  {isRemove
                    ? "No tasks inside this set yet."
                    : "All tasks are already in this set."}
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
      <div className="sx-page">
        <div className="sx-header">
          <div>
            <div className="sx-h1">Sets</div>
            <div className="sx-h2">
              Create sets and manage task order inside each package.
            </div>
          </div>

          <div className="sx-status">
            {!!err && <div className="sx-alert sx-alert--err">{err}</div>}
            {!!ok && <div className="sx-alert sx-alert--ok">{ok}</div>}
          </div>
        </div>

        <div className="sx-grid">
          {/* LEFT: Sets list + Create */}
          <div className="sx-card">
            <div className="sx-cardTop">
              <div className="sx-cardTitle">All Sets</div>
              <input
                className="sx-input"
                placeholder="Search sets..."
                value={setQuery}
                onChange={(e) => setSetQuery(e.target.value)}
              />
            </div>

            <div className="sx-list">
              {filteredSets.map((s) => {
                const active = s.id === selectedSetId;
                return (
                  <button
                    key={s.id}
                    type="button"
                    className={`sx-listItem ${active ? "is-active" : ""}`}
                    onClick={() => openSet(s.id)}
                  >
                    <div className="sx-listMain">
                      <div className="sx-listName">{s.name}</div>
                      <div className="sx-listMeta">
                        Max tasks: <b>{s.max_tasks}</b>
                      </div>
                    </div>

                    <div className="sx-listRight">
                      <span className="sx-chip">#{s.id}</span>
                      <button
                        type="button"
                        className="sx-btn sx-btn--danger sx-btn--xs"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteSet(s.id);
                        }}
                        title="Will fail if assigned to members"
                      >
                        Delete
                      </button>
                    </div>
                  </button>
                );
              })}

              {!filteredSets.length && (
                <div className="sx-empty">
                  No sets found. Try another search.
                </div>
              )}
            </div>

            <div className="sx-divider" />

            <div className="sx-cardTitle">Create Set</div>
            <form className="sx-form" onSubmit={createSet}>
              <div>
                <div className="sx-label">Set name</div>
                <input
                  className="sx-input"
                  value={createForm.name}
                  onChange={(e) =>
                    setCreateForm((p) => ({ ...p, name: e.target.value }))
                  }
                />
              </div>

              <div>
                <div className="sx-label">Max tasks</div>
                <input
                  className="sx-input"
                  type="number"
                  min={1}
                  value={createForm.max_tasks}
                  onChange={(e) =>
                    setCreateForm((p) => ({ ...p, max_tasks: e.target.value }))
                  }
                />
              </div>

              <button className="sx-btn sx-btn--wide" type="submit">
                Create set
              </button>
            </form>
          </div>

          {/* RIGHT: Set Details */}
          <div className="sx-card">
            {!selectedSetId ? (
              <div className="sx-emptyBig">
                <div className="sx-emptyBigTitle">Select a set</div>
                <div className="sx-emptyBigSub">
                  Choose a set from the left to view and manage tasks.
                </div>
              </div>
            ) : (
              <>
                <div className="sx-stickyTop">
                  <div className="sx-cardTitle">Set Details</div>
                  <div className="sx-detailRow">
                    <div>
                      <div className="sx-detailName">{selectedSet?.name}</div>
                      <div className="sx-detailSub">
                        Capacity{" "}
                        <span className="sx-chip">
                          {currentCount}/{max}
                        </span>
                      </div>
                    </div>

                    <input
                      className="sx-input"
                      placeholder="Search tasks (title/type)..."
                      value={taskQuery}
                      onChange={(e) => setTaskQuery(e.target.value)}
                    />
                  </div>
                </div>

                <div className="sx-section">
                  <div className="sx-sectionTop">
                    <div className="sx-sectionTitle">Tasks in this set</div>
                    <span className="sx-chip">{filteredTasksInSet.length}</span>
                  </div>
                  <TaskTable rows={filteredTasksInSet} mode="remove" />
                </div>

                <div className="sx-section">
                  <div className="sx-sectionTop">
                    <div className="sx-sectionTitle">Add a task</div>
                    <span className="sx-chip">{availableTasks.length}</span>
                  </div>
                  <TaskTable rows={availableTasks} mode="add" />
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
