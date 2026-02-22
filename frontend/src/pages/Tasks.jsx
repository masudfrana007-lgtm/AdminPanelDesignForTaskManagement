import { useEffect, useMemo, useState } from "react";
import api from "../services/api";
import "../styles/app.css";
import AppLayout from "../components/AppLayout";

// ✅ always use same domain (nginx proxy safe)
const toAbsUrl = (p) => {
  if (!p) return "";
  if (/^(https?:)?\/\//i.test(p)) return p;
  return p.startsWith("/") ? p : `/${p}`;
};

export default function Tasks() {
  const [list, setList] = useState([]);

  const [form, setForm] = useState({
    title: "",
    description: "",
    task_type: "regular",
    quantity: 1,
    commission_rate: 0,
    rate: 0,
    image: null,
  });

  // modal edit state
  const [editOpen, setEditOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [edit, setEdit] = useState({
    title: "",
    description: "",
    quantity: 1,
    commission_rate: 0,
    rate: 0,
    image: null,
    existing_image_url: null,
  });

  const [err, setErr] = useState("");
  const [ok, setOk] = useState("");

  const load = async () => {
    const { data } = await api.get("/tasks");
    setList(data || []);
  };

  useEffect(() => {
    load();
  }, []);

  // Live price preview (create)
  const previewPrice = useMemo(() => {
    const q = Number(form.quantity || 0);
    const r = Number(form.rate || 0);
    const c = Number(form.commission_rate || 0);
    const base = q * r;
    return base + (base * c) / 100;
  }, [form.quantity, form.rate, form.commission_rate]);

  // Live price preview (edit)
  const editPreviewPrice = useMemo(() => {
    const q = Number(edit.quantity || 0);
    const r = Number(edit.rate || 0);
    const c = Number(edit.commission_rate || 0);
    const base = q * r;
    return base + (base * c) / 100;
  }, [edit.quantity, edit.rate, edit.commission_rate]);

  const create = async (e) => {
    e.preventDefault();
    setErr("");
    setOk("");

    try {
      const fd = new FormData();
      fd.append("title", form.title);
      fd.append("description", form.description);
      fd.append("task_type", form.task_type);
      fd.append("quantity", form.quantity);
      fd.append("commission_rate", form.commission_rate);
      fd.append("rate", form.rate);
      if (form.image) fd.append("image", form.image);

      await api.post("/tasks", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setForm({
        title: "",
        description: "",
        task_type: "regular",
        quantity: 1,
        commission_rate: 0,
        rate: 0,
        image: null,
      });

      setOk("Task created");
      await load();
      setTimeout(() => setOk(""), 1500);
    } catch (e2) {
      setErr(e2?.response?.data?.message || "Failed");
    }
  };

  const openEdit = (t) => {
    setErr("");
    setOk("");
    setEditingId(t.id);
    setEdit({
      title: t.title || "",
      description: t.description || "",
      quantity: t.quantity ?? 1,
      commission_rate: t.commission_rate ?? 0,
      rate: t.rate ?? 0,
      image: null, // optional replace
      existing_image_url: t.image_url || null,
    });
    setEditOpen(true);
  };

  const closeEdit = () => {
    setEditOpen(false);
    setEditingId(null);
    setEdit({
      title: "",
      description: "",
      quantity: 1,
      commission_rate: 0,
      rate: 0,
      image: null,
      existing_image_url: null,
    });
  };

  const saveEdit = async () => {
    if (!editingId) return;

    setErr("");
    setOk("");

    try {
      const fd = new FormData();
      fd.append("title", edit.title);
      fd.append("description", edit.description);
      fd.append("quantity", edit.quantity);
      fd.append("commission_rate", edit.commission_rate);
      fd.append("rate", edit.rate);
      if (edit.image) fd.append("image", edit.image);

      await api.put(`/tasks/${editingId}`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setOk("Task updated");
      closeEdit();
      await load();
      setTimeout(() => setOk(""), 1500);
    } catch (e2) {
      setErr(e2?.response?.data?.message || "Failed");
    }
  };

  const removeTask = async (id) => {
    if (!confirm("Delete this task?")) return;

    setErr("");
    setOk("");

    try {
      await api.delete(`/tasks/${id}`);
      setOk("Task deleted");
      await load();
      setTimeout(() => setOk(""), 1500);
    } catch (e2) {
      setErr(e2?.response?.data?.message || "Failed");
    }
  };

  return (
    <AppLayout>
      <div className="container">
        <h2>Tasks</h2>

        {/* CREATE */}
        <div className="card">
          <h3>Create Task (Owner)</h3>
          <div className="hr" />

          <form onSubmit={create} className="taskFormCompact">
            {/* Left column */}
            <div className="taskFormMain">
              <div>
                <div className="small">Title</div>
                <input
                  value={form.title}
                  onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                />
              </div>

              <div>
                <div className="small">Description</div>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                />
              </div>

              <div>
                <div className="small">Task Type</div>
                <select
                  value={form.task_type}
                  onChange={(e) => setForm((p) => ({ ...p, task_type: e.target.value }))}
                >
                  <option value="regular">Regular</option>
                  <option value="combo">Combo</option>
                </select>
              </div>

              <div className="taskFormGrid2">
                <div>
                  <div className="small">Quantity</div>
                  <input
                    type="number"
                    value={form.quantity}
                    onChange={(e) => setForm((p) => ({ ...p, quantity: e.target.value }))}
                  />
                </div>

                <div>
                  <div className="small">Rate</div>
                  <input
                    type="number"
                    value={form.rate}
                    onChange={(e) => setForm((p) => ({ ...p, rate: e.target.value }))}
                  />
                </div>
              </div>

              <div>
                <div className="small">Commission Rate (%)</div>
                <input
                  type="number"
                  value={form.commission_rate}
                  onChange={(e) => setForm((p) => ({ ...p, commission_rate: e.target.value }))}
                />
              </div>
            </div>

            {/* Right column */}
            <div className="taskFormSide">
              <div className="taskMiniCard">
                <div className="small">Auto Calculated Price</div>
                <div className="taskPrice">{previewPrice.toFixed(2)}</div>
              </div>

              <div>
                <div className="small">Image</div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setForm((p) => ({ ...p, image: e.target.files?.[0] || null }))}
                />
              </div>

              {form.image && (
                <img
                  className="taskThumb"
                  src={URL.createObjectURL(form.image)}
                  alt=""
                />
              )}

              <button className="btn taskCreateBtn" type="submit">
                Create
              </button>

              {err && <div className="error">{err}</div>}
              {ok && <div className="ok">{ok}</div>}
            </div>
          </form>

          
        </div>

        {/* LIST TABLE BELOW */}
        <div className="card" style={{ marginTop: 16 }}>
          <h3>All Tasks</h3>
          <div className="small">Agents can view tasks created by their owner.</div>
          <div className="hr" />

          {!!list.length ? (
            <div className="tableWrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>Image</th>
                    <th>Type</th>
                    <th>Title</th>
                    <th>Description</th>
                    <th>Qty</th>
                    <th>Rate</th>
                    <th>Commission</th>
                    <th>Price</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {list.map((t) => (
                    <tr
                      key={t.id}
                      style={
                        t.task_type === "combo"
                          ? { background: "rgb(180 204 255)", color: "#fff" } // blue row + white text
                          : undefined
                      }
                    >
                      
                      <td>
                        {t.image_url ? (
                          <img
                            src={toAbsUrl(t.image_url)}
                            alt=""
                            style={{
                              width: 56,
                              height: 56,
                              objectFit: "cover",
                              borderRadius: 8,
                              border: "1px solid #ddd",
                              display: "block",
                            }}
                          />
                        ) : (
                          <span className="small">—</span>
                        )}
                      </td>

                      <td className="small">
                        {t.task_type === "combo" ? "Combo" : "Regular"}
                      </td>


                      <td>
                        <b>{t.title}</b>
                      </td>

                      {/* show trimmed description in table */}
                      <td className="small" style={{ maxWidth: 420 }}>
                        <div
                          style={{
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                          }}
                          title={t.description || ""}
                        >
                          {t.description || ""}
                        </div>
                      </td>

                      <td>{t.quantity}</td>
                      <td>{t.rate}</td>
                      <td>{t.commission_rate}%</td>
                      <td>
                        <b>{t.price}</b>
                      </td>

                      <td>
                        <div className="tblActions">
                          <button type="button" className="btn small" onClick={() => openEdit(t)}>
                            Edit
                          </button>

                          <button type="button" className="btn small danger" onClick={() => removeTask(t.id)}>
                            Delete
                          </button>
                        </div>
                      </td>

                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="small">No tasks yet.</div>
          )}
        </div>

        {/* EDIT MODAL */}
        {editOpen && (
          <div className="modalOverlay" role="dialog" aria-modal="true" aria-label="Edit task">
            <div className="modalCard">
              <div className="modalTop">
                <div className="modalTitle">Edit Task</div>
                <button className="iconClose" type="button" onClick={closeEdit} aria-label="Close">
                  ✕
                </button>
              </div>

              <div className="modalBody" style={{ display: "grid", gap: 12 }}>
                <div>
                  <div className="small">Title</div>
                  <input
                    value={edit.title}
                    onChange={(e) => setEdit((p) => ({ ...p, title: e.target.value }))}
                  />
                </div>

                <div>
                  <div className="small">Description</div>
                  <textarea
                    value={edit.description}
                    onChange={(e) => setEdit((p) => ({ ...p, description: e.target.value }))}
                  />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  <div>
                    <div className="small">Quantity</div>
                    <input
                      type="number"
                      value={edit.quantity}
                      onChange={(e) => setEdit((p) => ({ ...p, quantity: e.target.value }))}
                    />
                  </div>

                  <div>
                    <div className="small">Rate</div>
                    <input
                      type="number"
                      value={edit.rate}
                      onChange={(e) => setEdit((p) => ({ ...p, rate: e.target.value }))}
                    />
                  </div>
                </div>

                <div>
                  <div className="small">Commission Rate (%)</div>
                  <input
                    type="number"
                    value={edit.commission_rate}
                    onChange={(e) =>
                      setEdit((p) => ({ ...p, commission_rate: e.target.value }))
                    }
                  />
                </div>

                <div className="card" style={{ background: "#f9fafb", padding: 10 }}>
                  <div className="small">Auto Calculated Price</div>
                  <h3 style={{ margin: 0 }}>{editPreviewPrice.toFixed(2)}</h3>
                </div>

                <div>
                  <div className="small">Replace Image (optional)</div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) =>
                      setEdit((p) => ({ ...p, image: e.target.files?.[0] || null }))
                    }
                  />
                </div>

                {/* show existing image if no new selected */}
                {!edit.image && edit.existing_image_url && (
                  <img
                    src={toAbsUrl(edit.existing_image_url)}
                    alt=""
                    style={{
                      width: 160,
                      borderRadius: 10,
                      border: "1px solid #ddd",
                    }}
                  />
                )}

                {/* show new selected preview */}
                {edit.image && (
                  <img
                    src={URL.createObjectURL(edit.image)}
                    alt=""
                    style={{
                      width: 160,
                      borderRadius: 10,
                      border: "1px solid #ddd",
                    }}
                  />
                )}
              </div>

              <div className="modalFooter">
                <button className="btn secondary" type="button" onClick={closeEdit}>
                  Cancel
                </button>
                <button className="btn" type="button" onClick={saveEdit}>
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
