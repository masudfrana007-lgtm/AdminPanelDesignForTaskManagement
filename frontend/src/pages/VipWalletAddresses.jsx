// src/pages/VipWalletAddresses.jsx
import { useEffect, useState } from "react";
import AppLayout from "../components/AppLayout";
import api from "../services/api";
import "../styles/app.css";

const VIPS = [
  { key: "V1", label: "VIP 1" },
  { key: "V2", label: "VIP 2" },
  { key: "V3", label: "VIP 3" },
];

// ✅ ONLY one slot: USDT TRC20
const SLOT = { asset: "USDT", network: "TRC20", label: "USDT (TRC20)" };

// ✅ backend host (image preview must use backend, not frontend 5175)
 const toAbsUrl = (p) => {
   if (!p) return "";
   if (/^(https?:)?\/\//i.test(p)) return p;
   return p.startsWith("/") ? p : `/${p}`;
 };

function slotKey(vip_rank, asset, network) {
  return `${vip_rank}__${String(asset || "").toUpperCase()}__${String(
    network || ""
  ).toUpperCase()}`;
}

export default function VipWalletAddresses() {
  const [vip, setVip] = useState("V1");
  const [rows, setRows] = useState({}); // key -> row
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [ok, setOk] = useState("");

  async function loadAll() {
    setErr("");
    setOk("");
    try {
      const { data } = await api.get("/vip-deposit-addresses");
      const map = {};
      for (const r of data || []) {
        const k = slotKey(r.vip_rank, r.asset, r.network || "");
        map[k] = {
          vip_rank: String(r.vip_rank || "").toUpperCase(),
          asset: String(r.asset || "").toUpperCase(),
          network: String(r.network || "").toUpperCase(),
          wallet_address: r.wallet_address || "",
          photo_url: r.photo_url || "",
          is_active: r.is_active !== false,
        };
      }
      setRows(map);
    } catch (e) {
      setErr(e?.response?.data?.message || "Failed to load");
    }
  }

  useEffect(() => {
    loadAll();
  }, []);

  function getRow() {
    const k = slotKey(vip, SLOT.asset, SLOT.network);
    return (
      rows[k] || {
        vip_rank: vip,
        asset: SLOT.asset,
        network: SLOT.network,
        wallet_address: "",
        photo_url: "",
        is_active: true,
      }
    );
  }

  function patchRow(patch) {
    const k = slotKey(vip, SLOT.asset, SLOT.network);
    setRows((prev) => ({
      ...prev,
      [k]: { ...getRow(), ...patch },
    }));
  }

  async function uploadPhoto(file) {
    setBusy(true);
    setErr("");
    setOk("");
    try {
      const fd = new FormData();
      fd.append("photo", file);
      fd.append("vip_rank", vip);

      // ✅ correct endpoint
      const { data } = await api.post("/vip-deposit-addresses/photo", fd);

      // backend returns: { vip_rank, photo_url: "/uploads/vip-wallets/..." }
      patchRow({ photo_url: data?.photo_url || "" });
      setOk("Photo uploaded");
    } catch (e) {
      setErr(e?.response?.data?.message || "Upload failed");
    } finally {
      setBusy(false);
    }
  }

  async function save() {
    const row = getRow();
    setBusy(true);
    setErr("");
    setOk("");
    try {
      if (!String(row.wallet_address || "").trim()) {
        setErr("Wallet address is required");
        return;
      }

      await api.post("/vip-deposit-addresses/upsert", {
        vip_rank: vip,
        asset: "USDT",
        network: "TRC20",
        wallet_address: String(row.wallet_address || "").trim(),
        photo_url: String(row.photo_url || "").trim(), // keep relative in DB
        is_active: row.is_active !== false,
      });

      setOk(`${vip} saved`);
      await loadAll();
    } catch (e) {
      setErr(e?.response?.data?.message || "Save failed");
    } finally {
      setBusy(false);
    }
  }

  const row = getRow();

  return (
    <AppLayout>
      <div className="container">
        <div className="topbar">
          <div>
            <h2>VIP Wallet Addresses</h2>
            <div className="small">Only USDT (TRC20) for VIP 1/2/3.</div>
          </div>

          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <button className="btn ghost" onClick={loadAll} disabled={busy}>
              Refresh
            </button>
            <button className="btn" onClick={save} disabled={busy}>
              {busy ? "Saving..." : "Save"}
            </button>
          </div>
        </div>

        {err && <div className="alert err">{err}</div>}
        {ok && <div className="alert ok">{ok}</div>}

        {/* VIP tabs */}
        <div
          className="row"
          style={{ gap: 8, marginBottom: 12, flexWrap: "wrap" }}
        >
          {VIPS.map((v) => (
            <button
              key={v.key}
              className={`btn ${vip === v.key ? "" : "ghost"}`}
              onClick={() => {
                setVip(v.key);
                setErr("");
                setOk("");
              }}
              disabled={busy}
            >
              {v.label}
            </button>
          ))}
        </div>

        <div className="card">
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: 12,
              flexWrap: "wrap",
            }}
          >
            <div>
              <h3 style={{ margin: 0 }}>{SLOT.label}</h3>
              <div className="small" style={{ opacity: 0.8 }}>
                Rank: <b>{VIPS.find(v => v.key === vip)?.label || vip}</b>
              </div>
            </div>

            <label
              className="small"
              style={{ display: "flex", gap: 8, alignItems: "center" }}
            >
              <input
                type="checkbox"
                checked={row.is_active !== false}
                onChange={(e) => patchRow({ is_active: e.target.checked })}
                disabled={busy}
              />
              Active
            </label>
          </div>

          <div className="row" style={{ gap: 12, marginTop: 12, flexWrap: "wrap" }}>
            <div style={{ flex: 1, minWidth: 260 }}>
              <div className="field">
                <div className="label" style={{ color: "#000" }}>Wallet address</div>
                <input
                  className="input"
                  value={row.wallet_address || ""}
                  onChange={(e) => patchRow({ wallet_address: e.target.value })}
                  placeholder="Paste USDT TRC20 address"
                  disabled={busy}
                />
              </div>

              <div className="field" style={{ marginTop: 10 }}>
                <div className="label" style={{ color: "#000" }}>QR / Photo</div>

                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
                  <input
                    className="input"
                    value={row.photo_url || ""}
                    onChange={(e) => patchRow({ photo_url: e.target.value })}
                    placeholder="Or paste photo URL (relative or full)"
                    style={{ flex: 1, minWidth: 260 }}
                    disabled={busy}
                  />

                  <label className="btn ghost" style={{ cursor: "pointer" }}>
                    Upload photo
                    <input
                      type="file"
                      accept="image/*"
                      style={{ display: "none" }}
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (!f) return;
                        uploadPhoto(f);
                        e.target.value = "";
                      }}
                      disabled={busy}
                    />
                  </label>
                </div>
              </div>
            </div>

            <div style={{ width: 260 }}>
              <div className="small" style={{ marginBottom: 6, opacity: 0.8 }}>
                Preview
              </div>

              {row.photo_url ? (
                <img
                  // ✅ important fix: load from backend :5010
                  src={toAbsUrl(row.photo_url)}
                  alt="QR"
                  style={{
                    width: "100%",
                    borderRadius: 12,
                    border: "1px solid rgba(255,255,255,.12)",
                    background: "rgba(255,255,255,.04)",
                  }}
                  onError={(e) => (e.currentTarget.style.display = "none")}
                />
              ) : (
                <div
                  style={{
                    height: 180,
                    borderRadius: 12,
                    border: "1px dashed rgba(255,255,255,.20)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    opacity: 0.7,
                  }}
                  className="small"
                >
                  No photo
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
