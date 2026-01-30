import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import MemberBottomNav from "../components/MemberBottomNav";
import "../styles/TaskList.css";
import memberApi from "../services/memberApi";

function money(n) {
  const num = Number(n || 0);
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 }).format(num);
}

// ✅ Convert backend image path to a real browser URL
function toImageUrl(img) {
  if (!img) return "";

  const s = String(img).trim();
  if (!s) return "";

  // already absolute: http / https / data url
  if (/^(https?:)?\/\//i.test(s) || /^data:/i.test(s)) return s;

  // remove starting slashes so we can join cleanly
  const clean = s.replace(/^\/+/, "");

  // use same base as your axios baseURL
  const base = (import.meta.env.VITE_API_URL || "http://localhost:5010").replace(/\/+$/, "");
  return `${base}/${clean}`;
}

// Keep your UI shape the same
function normalizeTaskRow(row) {
  return {
    id: String(row?.id ?? ""),
    title: row?.title || "Task",
    ref: row?.ref || "—",
    image: row?.image || "",
    difficulty: row?.difficulty || "—",
    reward: Number(row?.reward || 0),
    status: row?.status || "Active",
    createdAt: row?.createdAt || "-",
    steps: Array.isArray(row?.steps) ? row.steps : [],
  };
}

export default function TaskList() {
  const nav = useNavigate();
  const loc = useLocation();

  const startingBalance = loc.state?.balance ?? 97280.12;

  const [balance] = useState(startingBalance);
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState("All");

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

const load = async () => {
  setLoading(true);
  setErr("");
  try {
    const r = await memberApi.get("/member/active-set");
    const d = r.data || null;

    if (!d?.active) {
      setTasks([]);
      return;
    }

    const currentIndex = Number(d.assignment?.current_task_index || 0);
    const totalTasks = Number(d.total_tasks || 0);
    const setName = d.set?.name || d.set?.id || "-";

    const rows = (Array.isArray(d.tasks) ? d.tasks : []).map((t, i) => {
      const qty = Number(t?.quantity ?? 1);
      const rate = Number(t?.rate ?? 0);
      const commissionRate = Number(t?.commission_rate ?? 0);

      const orderAmount = qty * rate;
      const commission = (orderAmount * commissionRate) / 100;

      // ✅ status by position
      const status =
        i < currentIndex ? "Completed" : i === currentIndex ? "Active" : "Pending";

      return normalizeTaskRow({
        id: t?.id ?? `SET-${d.set?.id ?? ""}-#${i + 1}`,
        title: t?.title || `Order ${i + 1}`,
        ref: d.sponsor_short_id || "—",
        image: toImageUrl(t?.image_url),
        difficulty: status, // or keep "Active"/"Pending"/"Completed"
        reward: commission,
        status,
        createdAt: d.assignment?.created_at
          ? new Date(d.assignment.created_at).toLocaleString()
          : "-",
        // optional: show serial info
        steps: [
          `SET-${setName} • Step ${i + 1}/${totalTasks}`,
          status === "Completed"
            ? "Already completed ✅"
            : status === "Active"
            ? "Current order (submit enabled)"
            : "Upcoming (locked until current is done)",
        ],
      });
    });

    setTasks(rows);
  } catch (e) {
    const msg = e?.response?.data?.message || e?.message || "Failed to load tasks";
    setErr(msg);
    setTasks([]);
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    return tasks.filter((t) => {
      const matchText =
        !s ||
        String(t.id).toLowerCase().includes(s) ||
        String(t.title).toLowerCase().includes(s) ||
        String(t.ref).toLowerCase().includes(s);

      const matchFilter = filter === "All" ? true : t.status === filter;
      return matchText && matchFilter;
    });
  }, [tasks, q, filter]);

  return (
    <div className="tl-page">
      

      

      <MemberBottomNav active="menu" />
    </div>
  );
}
