import { useEffect, useState } from "react";
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
          <div className="col">
            <div className="card">
              <h3>Create Task (Owner)</h3>
              <div className="hr" />
              <form onSubmit={create} style={{ display: "grid", gap: 10 }}>
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

                <div>
                  <div className="small">Quantity</div>
                  <input
                    type="number"
                    value={form.quantity}
                    onChange={(e) => setForm(p => ({ ...p, quantity: e.target.value }))}
                  />
                </div>

                <div>
                  <div className="small">Commission Rate (%)</div>
                  <input
                    type="number"
                    value={form.commission_rate}
                    onChange={(e) => setForm(p => ({ ...p, commission_rate: e.target.value }))}
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

                <div>
                  <div className="small">Image</div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setForm(p => ({ ...p, image: e.target.files[0] }))}
                  />
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

                    {t.image_url && (
                      <img
                        src={t.image_url}
                        alt=""
                        style={{ width: 80, marginTop: 6, borderRadius: 6 }}
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
              </ul>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
