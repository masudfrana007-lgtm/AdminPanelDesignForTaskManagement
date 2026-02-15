import "./DashboardMain.css";
import { useNavigate } from "react-router-dom";
import { getUser, logout } from "../auth";
import AppLayout from "../components/AppLayout";

const stats = [
  {
    title: "Deposit",
    sub: "Deposit today",
    icon: "⬇️",
    theme: "green",
    rows: [
      ["Deposit today", 1345],
      ["Deposit in Month", 8240],
      ["Total deposit till today", 22569],
    ],
  },
  {
    title: "Withdraw",
    sub: "Withdraw today",
    icon: "⬆️",
    theme: "red",
    rows: [
      ["Withdraw today", 323],
      ["Withdraw in Month", 5700],
      ["Total withdraw till today", 16245],
    ],
  },
  {
    title: "Sales Report",
    sub: "Net sell todays",
    icon: "🛒",
    theme: "purple",
    rows: [
      ["Net sell today", 2740],
      ["Net sell in month", 16823],
    ],
  },
];

const tx = [
  { id: "TRX-0532", date: "23 Apr 2024", amount: 960 },
  { id: "TRX-0529", date: "22 Apr 2024", amount: 240 },
  { id: "TRX-0525", date: "21 Apr 2024", amount: 850 },
  { id: "TRX-0519", date: "20 Apr 2024", amount: 1210 },
  { id: "TRX-0573", date: "29 Apr 2024", amount: 555 },
  { id: "TRX-0512", date: "29 Apr 2024", amount: 850 },
  { id: "TRX-0513", date: "19 Apr 2024", amount: 850 },
  { id: "TRX-0511", date: "19 Apr 2024", amount: 555 },
];

function money(n) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);
}

/** Build a smooth-ish SVG path from points */
function pathFromPoints(points, w = 560, h = 240, pad = 18) {
  const xs = points.map((p) => p[0]);
  const ys = points.map((p) => p[1]);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);

  const sx = (x) =>
    pad + ((x - minX) / (maxX - minX || 1)) * (w - pad * 2);
  const sy = (y) =>
    h - pad - ((y - minY) / (maxY - minY || 1)) * (h - pad * 2);

  const pts = points.map(([x, y]) => [sx(x), sy(y)]);
  let d = `M ${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)}`;
  for (let i = 1; i < pts.length; i++) {
    const [x, y] = pts[i];
    d += ` L ${x.toFixed(1)} ${y.toFixed(1)}`;
  }
  return d;
}

export default function DashboardMain() {
  const nav = useNavigate();
  const user = getUser();
  const role = user?.role;

  const doLogout = () => {
    logout();
    nav("/login", { replace: true });
  };

  // fake series (close to your screenshot vibe)
  const revenue = [
    [1, 40],
    [2, 55],
    [3, 38],
    [4, 46],
    [5, 62],
    [6, 50],
    [7, 70],
    [8, 58],
    [9, 76],
  ];
  const withdraw = [
    [1, 22],
    [2, 28],
    [3, 18],
    [4, 24],
    [5, 35],
    [6, 30],
    [7, 42],
    [8, 34],
    [9, 48],
  ];

  const revPath = pathFromPoints(revenue);
  const wdrPath = pathFromPoints(withdraw);

  return (
    <AppLayout>
      <div className="db">
        {/* Top bar (inside content area) */}
        {/* Page grid */}
        <div className="dbGrid">
          {/* Stat cards */}
          <section className="dbCards">
            {stats.map((card) => (
              <article className={`sCard s-${card.theme}`} key={card.title}>
                <div className="sHead">
                  <div className={`sIcon sIcon-${card.theme}`} aria-hidden="true">
                    {card.icon}
                  </div>
                  <div className="sMeta">
                    <div className="sTitle">{card.title}</div>
                    <div className="sSub">{card.sub}</div>
                  </div>

                  <div className="sSpark" aria-hidden="true">
                    <svg viewBox="0 0 84 40">
                      <path
                        d="M2 30 C12 18, 22 34, 34 20 C44 8, 56 26, 66 14 C74 4, 80 12, 82 6"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeLinecap="round"
                      />
                      <path
                        d="M2 30 C12 18, 22 34, 34 20 C44 8, 56 26, 66 14 C74 4, 80 12, 82 6 L82 38 L2 38 Z"
                        fill="currentColor"
                        opacity=".10"
                      />
                    </svg>
                  </div>
                </div>

                <div className="sRows">
                  {card.rows.map(([label, value]) => (
                    <div className="sRow" key={label}>
                      <span className="sLabel">{label}</span>
                      <span className="sValue">{money(value)}</span>
                    </div>
                  ))}
                </div>
              </article>
            ))}
          </section>

          {/* Middle: chart + transactions */}
          <section className="dbMid">
            <article className="panel panelChart">
              <div className="pHead">
                <div>
                  <div className="pTitle">Revenue & Withdraw Overview</div>
                  <div className="pSub">Comparison from last 14 days</div>
                </div>

                <div className="tabs" role="tablist" aria-label="Range">
                  <button className="tab" type="button">
                    Last 7 Days
                  </button>
                  <button className="tab isActive" type="button">
                    Last 30
                  </button>
                  <button className="tab" type="button">
                    Months
                  </button>
                </div>
              </div>

              <div className="chartWrap">
                <div className="chartLegend">
                  <span className="lgItem">
                    <i className="dot dotBlue" /> Revenue
                  </span>
                  <span className="lgItem">
                    <i className="dot dotRed" /> Withdraw
                  </span>
                </div>

                <svg
                  className="chart"
                  viewBox="0 0 640 280"
                  role="img"
                  aria-label="Revenue and withdraw line chart"
                >
                  <g className="grid">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <line
                        key={i}
                        x1="40"
                        x2="620"
                        y1={40 + i * 50}
                        y2={40 + i * 50}
                      />
                    ))}
                  </g>

                  <path className="lineBlue" d={revPath} />
                  <path className="lineRed" d={wdrPath} />

                  <g className="hint">
                    <rect x="250" y="92" rx="12" ry="12" width="160" height="86" />
                    <text x="265" y="122" className="hintT">
                      Revenue
                    </text>
                    <text x="265" y="145" className="hintV">
                      {money(1345)}
                    </text>

                    <text x="340" y="122" className="hintT">
                      Withdraw
                    </text>
                    <text x="340" y="145" className="hintV">
                      {money(323)}
                    </text>
                  </g>

                  <g className="xlab">
                    <text x="70" y="268">
                      Apr 23
                    </text>
                    <text x="185" y="268">
                      Apr 10
                    </text>
                    <text x="300" y="268">
                      Apr 12
                    </text>
                    <text x="410" y="268">
                      Apr 14
                    </text>
                    <text x="520" y="268">
                      Apr 24
                    </text>
                  </g>
                </svg>
              </div>
            </article>

            <article className="panel panelTx">
              <div className="pHead">
                <div className="pTitle">Recent Transactions</div>
                <button className="linkBtn" type="button">
                  View All
                </button>
              </div>

              <div className="txTable">
                <div className="txHead">
                  <span>ID</span>
                  <span>Date</span>
                  <span className="txRight">Amount</span>
                </div>

                <div className="txBody">
                  {tx.map((t) => (
                    <div className="txRow" key={t.id}>
                      <span className="txId">{t.id}</span>
                      <span className="txDate">{t.date}</span>
                      <span className="txAmt txRight">{money(t.amount)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </article>
          </section>

          {/* Bottom: pie */}
          <section className="dbBottom">
            <article className="panel panelPie">
              <div className="pHead">
                <div className="pTitle">Deposits & Withdraws Overview</div>
              </div>

              <div className="pieRow">
                <div className="pieLegend">
                  <div className="leg">
                    <i className="dot dotGreen" /> Deposits
                    <span className="legVal">{money(5265)}</span>
                  </div>
                  <div className="leg">
                    <i className="dot dotRed" /> Withdraw
                    <span className="legVal">{money(2323)}</span>
                  </div>
                </div>

                <div className="pieWrap" aria-label="Pie chart" role="img">
                  <svg viewBox="0 0 120 120" className="pie">
                    <circle className="pieBase" cx="60" cy="60" r="44" />
                    <circle
                      className="pieGreen"
                      cx="60"
                      cy="60"
                      r="44"
                      strokeDasharray={`${2.764 * 44 * 0.68} ${2.764 * 44}`}
                      strokeDashoffset="0"
                    />
                    <circle
                      className="pieRed"
                      cx="60"
                      cy="60"
                      r="44"
                      strokeDasharray={`${2.764 * 44 * 0.32} ${2.764 * 44}`}
                      strokeDashoffset={`${-(2.764 * 44 * 0.68)}`}
                    />
                    <circle className="pieHole" cx="60" cy="60" r="28" />

                    <text x="38" y="52" className="pieTxtRed">
                      32%
                    </text>
                    <text x="66" y="76" className="pieTxtGreen">
                      68%
                    </text>
                  </svg>
                </div>
              </div>
            </article>
          </section>
        </div>
      </div>
    </AppLayout>
  );
}
