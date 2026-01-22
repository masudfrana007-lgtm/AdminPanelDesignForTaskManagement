import { useEffect, useMemo, useState } from "react";
import api from "../services/api";
import "../styles/app.css";
import AppLayout from "../components/AppLayout";

export default function Tasks() {
  const [list, setList] = useState([]);
  const [form, setForm] = useState({
    title: "",
    description: "",
    quantity: 1,
    commission_rate: 0,
    rate: 0,
    image: null,
  });
  const [err, setErr] = useState("");
  const [ok, setOk] = useState("");

  const load = async () => {
    const { data } = await api.get("/tasks");
    setList(data);
  };

  useEffect(() => { load(); }, []);

  // Live price preview
  const previewPrice = useMemo(() => {
    const q = Number(form.quantity || 0);
    const r = Number(form.rate || 0);
    const c = Number(form.commission_rate || 0);
    const base = q * r;
    return base + (base * c) / 100;
  }, [form.quantity, form.rate, form.commission_rate]);

  const create = async (e) => {
    e.preventDefault();
    setErr(""); 
    setOk("");

    try {
      const fd = new FormData();
      fd.append("title", form.title);
      fd.append("description", form.description);
      fd.append("quantity", form.quantity);
      fd.append("commission_rate", form.commission_rate);
      fd.append("rate", form.rate);
      if (form.image) fd.append("image", form.image);

      await api.post("/tasks", fd, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      setForm({
        title: "",
        description: "",
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

  return (
    <AppLayout>
      <div className="container">
        <h2>Tasks</h2>

        <div className="row">
          {/* Create */}
          <div className="col">
            <div className="card">
              <h3>Create Task (Owner)</h3>
              <div className="hr" />

              <form onSubmit={create} style={{ display: "grid", gap: 12 }}>
                <div>
                  <div className="small">Title</div>
                  <input
                    value={form.title}
                    onChange={(e) => setForm(p => ({ ...p, title: e.target.value }))}
                  />
                </div>

                <div>
                  <div className="small">Description</div>
                  <textarea
                    value={form.description}
                    onChange={(e) => setForm(p => ({ ...p, description: e.target.value }))}
                  />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  <div>
                    <div className="small">Quantity</div>
                    <input
                      type="number"
                      value={form.quantity}
                      onChange={(e) => setForm(p => ({ ...p, quantity: e.target.value }))}
                    />
                  </div>

                  <div>
                    <div className="small">Rate</div>
                    <input
                      type="number"
                      value={form.rate}
                      onChange={(e) => setForm(p => ({ ...p, rate: e.target.value }))}
                    />
                  </div>
                </div>

                <div>
                  <div className="small">Commission Rate (%)</div>
                  <input
                    type="number"
                    value={form.commission_rate}
                    onChange={(e) => setForm(p => ({ ...p, commission_rate: e.target.value }))}
                  />
                </div>

                {/* Live Price Preview */}
                <div className="card" style={{ background: "#f9fafb", padding: 10 }}>
                  <div className="small">Auto Calculated Price</div>
                  <h3 style={{ margin: 0 }}>{previewPrice.toFixed(2)}</h3>
                </div>

                <div>
                  <div className="small">Image</div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setForm(p => ({ ...p, image: e.target.files[0] }))}
                  />
                </div>

                {/* Image preview */}
                {form.image && (
                  <img
                    src={URL.createObjectURL(form.image)}
                    alt=""
                    style={{
                      width: 120,
                      marginTop: 6,
                      borderRadius: 8,
                      border: "1px solid #ddd"
                    }}
                  />
                )}

                {err && <div className="error">{err}</div>}
                {ok && <div className="ok">{ok}</div>}

                <button className="btn" type="submit">Create</button>
              </form>
            </div>
          </div>

          {/* List */}
          <div className="col">
            <div className="card">
              <h3>All Tasks</h3>
              <div className="small">Agents can view tasks created by their owner.</div>
              <div className="hr" />

              {list.map(t => (
                <div
                  key={t.id}
                  style={{
                    display: "flex",
                    gap: 12,
                    border: "1px solid #e5e7eb",
                    borderRadius: 8,
                    padding: 10,
                    marginBottom: 10,
                    alignItems: "center"
                  }}
                >
                  {t.image_url && (
                    <img
                      src={t.image_url}
                      alt=""
                      style={{
                        width: 80,
                        height: 80,
                        objectFit: "cover",
                        borderRadius: 6,
                        border: "1px solid #ddd"
                      }}
                    />
                  )}

                  <div style={{ flex: 1 }}>
                    <b>{t.title}</b>
                    <div className="small">{t.description || ""}</div>

                    <div className="small" style={{ marginTop: 4 }}>
                      Qty: {t.quantity} | Rate: {t.rate} | Commission: {t.commission_rate}%
                    </div>

                    <div className="small">
                      Price: <b>{t.price}</b>
                    </div>
                  </div>
                </div>
              ))}

              {!list.length && (
                <div className="small">No tasks yet.</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
