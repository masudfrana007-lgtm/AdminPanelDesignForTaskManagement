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

  // --------------------
  // Auto Price Preview
  // --------------------
  const pricePreview = useMemo(() => {
    const qty = Number(form.quantity || 0);
    const rate = Number(form.rate || 0);
    const commission = Number(form.commission_rate || 0);

    const base = qty * rate;
    const commissionAmount = (base * commission) / 100;
    return (base + commissionAmount).toFixed(2);
  }, [form.quantity, form.rate, form.commission_rate]);

  const load = async () => {
    const { data } = await api.get("/tasks");
    setList(data);
  };

  useEffect(() => {
    load();
  }, []);

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
          {/* ------------------ */}
          {/* Create Task */}
          {/* ------------------ */}
          <div className="col">
            <div className="card">
              <h3>Create Task (Owner)</h3>
              <div className="hr" />

              <form onSubmit={create} style={{ display: "grid", gap: 10 }}>
                <div>
                  <div className="small">Title</div>
                  <input
                    value={form.title}
                    onChange={(e) =>
                      setForm(p => ({ ...p, title: e.target.value }))
                    }
                    required
                  />
                </div>

                <div>
                  <div className="small">Description</div>
                  <textarea
                    value={form.description}
                    onChange={(e) =>
                      setForm(p => ({ ...p, description: e.target.value }))
                    }
                  />
                </div>

                <div>
                  <div className="small">Quantity</div>
                  <input
                    type="number"
                    min="1"
                    value={form.quantity}
                    onChange={(e) =>
                      setForm(p => ({ ...p, quantity: e.target.value }))
                    }
                  />
                </div>

                <div>
                  <div className="small">Commission Rate (%)</div>
                  <input
                    type="number"
                    min="0"
                    value={form.commission_rate}
                    onChange={(e) =>
                      setForm(p => ({ ...p, commission_rate: e.target.value }))
                    }
                  />
                </div>

                <div>
                  <div className="small">Rate</div>
                  <input
                    type="number"
                    min="0"
                    value={form.rate}
                    onChange={(e) =>
                      setForm(p => ({ ...p, rate: e.target.value }))
                    }
                  />
                </div>

                {/* ------------------ */}
                {/* Auto Price Preview */}
                {/* ------------------ */}
                <div>
                  <div className="small">Auto Price</div>
                  <input value={pricePreview} disabled />
                </div>

                {/* ------------------ */}
                {/* Image Upload */}
                {/* ------------------ */}
                <div>
                  <div className="small">Image</div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) =>
                      setForm(p => ({ ...p, image: e.target.files[0] }))
                    }
                  />

                  {/* Image Preview */}
                  {form.image && (
                    <img
                      src={URL.createObjectURL(form.image)}
                      alt="preview"
                      style={{
                        width: 120,
                        marginTop: 8,
                        borderRadius: 8,
                        border: "1px solid #ddd"
                      }}
                    />
                  )}
                </div>

                {err && <div className="error">{err}</div>}
                {ok && <div className="ok">{ok}</div>}

                <button className="btn" type="submit">
                  Create
                </button>
              </form>
            </div>
          </div>

          {/* ------------------ */}
          {/* Task List */}
          {/* ------------------ */}
          <div className="col">
            <div className="card">
              <h3>All Tasks</h3>
              <div className="small">
                Agents can view tasks created by their owner.
              </div>
              <div className="hr" />

              <ul style={{ margin: 0, paddingLeft: 18, lineHeight: 1.7 }}>
                {list.map(t => (
                  <li key={t.id}>
                    <b>{t.title}</b>
                    <div className="small">{t.description || ""}</div>

                    {t.image_url && (
                      <img
                        src={t.image_url}
                        alt=""
                        style={{
                          width: 90,
                          marginTop: 6,
                          borderRadius: 6,
                          border: "1px solid #ddd"
                        }}
                      />
                    )}

                    <div className="small">
                      Qty: {t.quantity} | Rate: {t.rate} | Commission: {t.commission_rate}%
                    </div>

                    <div className="small">
                      Price: <b>{t.price}</b>
                    </div>
                  </li>
                ))}

                {!list.length && <li className="small">No tasks yet.</li>}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
