import { useEffect, useState } from "react";
import memberApi from "../services/memberApi";
import MemberBottomNav from "../components/MemberBottomNav";
import "../styles/memberHistory.css";

export default function MemberHistory() {
  const [rows, setRows] = useState([]);
  const [summary, setSummary] = useState(null);
  const [err, setErr] = useState("");
  const [activeTab, setActiveTab] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Static data for testing
  const staticSummary = {
    deposits: { count: 15, total: 2500.50 },
    withdrawals: { count: 8, total: 1200.00 },
    tasks: { count: 45, total: 850.25 },
    today_sets: 2,
    today_tasks: 12,
    today_commission: 45.50,
    week_sets: 8,
    week_tasks: 35,
    week_commission: 180.75,
    lifetime_sets: 25,
    lifetime_tasks: 150,
    lifetime_commission: 975.25
  };

  const staticHistory = [
    // Deposits
    { id: 1, type: 'deposit', method: 'Bank Transfer', amount: 500.00, status: 'Completed', date: '2025-01-30T10:30:00Z', txId: 'DEP001' },
    { id: 2, type: 'deposit', method: 'USDT', amount: 250.00, status: 'Completed', date: '2025-01-29T15:45:00Z', txId: 'DEP002' },
    { id: 3, type: 'deposit', method: 'Crypto', amount: 1000.00, status: 'Pending', date: '2025-01-28T09:15:00Z', txId: 'DEP003' },
    { id: 4, type: 'deposit', method: 'Bank Transfer', amount: 300.50, status: 'Completed', date: '2025-01-27T14:20:00Z', txId: 'DEP004' },
    { id: 5, type: 'deposit', method: 'USDT', amount: 450.00, status: 'Completed', date: '2025-01-26T11:10:00Z', txId: 'DEP005' },
    
    // Withdrawals  
    { id: 6, type: 'withdrawal', method: 'Bank Transfer', amount: 200.00, status: 'Completed', date: '2025-01-25T16:30:00Z', txId: 'WTH001' },
    { id: 7, type: 'withdrawal', method: 'USDT', amount: 150.00, status: 'Processing', date: '2025-01-24T13:45:00Z', txId: 'WTH002' },
    { id: 8, type: 'withdrawal', method: 'Crypto', amount: 350.00, status: 'Completed', date: '2025-01-23T10:15:00Z', txId: 'WTH003' },
    { id: 9, type: 'withdrawal', method: 'Bank Transfer', amount: 500.00, status: 'Completed', date: '2025-01-22T12:00:00Z', txId: 'WTH004' },
    
    // Tasks
    { id: 10, type: 'task', setName: 'Amazon VIP 1', taskCount: 5, commission: 25.50, status: 'Completed', date: '2025-01-30T08:30:00Z' },
    { id: 11, type: 'task', setName: 'Alibaba VIP 2', taskCount: 8, commission: 45.75, status: 'Completed', date: '2025-01-29T14:15:00Z' },
    { id: 12, type: 'task', setName: 'Amazon VIP 1', taskCount: 3, commission: 18.25, status: 'In Progress', date: '2025-01-28T16:45:00Z' },
    { id: 13, type: 'task', setName: 'Aliexpress VIP 3', taskCount: 12, commission: 85.50, status: 'Completed', date: '2025-01-27T09:20:00Z' },
    { id: 14, type: 'task', setName: 'Amazon VIP 1', taskCount: 4, commission: 22.00, status: 'Completed', date: '2025-01-26T13:10:00Z' }
  ];

  const load = async () => {
    setErr("");
    try {
      // Using static data for now
      setRows(staticHistory);
      setSummary(staticSummary);
      
      // Uncomment below for dynamic data
      // const [hist, sum] = await Promise.all([
      //   memberApi.get("/member/history"),
      //   memberApi.get("/member/history-summary"),
      // ]);
      // setRows(hist.data || []);
      // setSummary(sum.data);
    } catch {
      setErr("Failed to load history");
    }
  };

  // Filter data based on active tab
  const filteredData = staticHistory.filter(item => {
    if (activeTab === "All") return true;
    return item.type === activeTab.toLowerCase();
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = filteredData.slice(startIndex, startIndex + itemsPerPage);

  // Reset page when tab changes
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab]);

  useEffect(() => {
    load();
  }, []);

  const fmt = (d) => {
    if (!d) return "-";
    try {
      return new Date(d).toLocaleString();
    } catch {
      return d;
    }
  };

  return (
    <div className="historyPage">
      <div className="historyContent">
        <div className="historyHeader">
          <h2 className="historyTitle">History & Earnings</h2>
          <div className="historySub">
            Daily · Weekly · Lifetime performance
          </div>
        </div>

        {err && <div className="historyAlert error">{err}</div>}

        {/* ================= SUMMARY GLASS CARDS ================= */}
        {/* Overall Summary Cards */}
        <div className="historySummary">
          <div className="summaryCard">
            <div className="summaryTitle">💰 Deposits</div>
            <div className="summaryGrid">
              <div>
                <div className="summaryLabel">Count</div>
                <div className="summaryValue">{staticSummary.deposits.count}</div>
              </div>
              <div>
                <div className="summaryLabel">Total Amount</div>
                <div className="summaryValue strong">${staticSummary.deposits.total.toFixed(2)}</div>
              </div>
            </div>
          </div>

          <div className="summaryCard">
            <div className="summaryTitle">💸 Withdrawals</div>
            <div className="summaryGrid">
              <div>
                <div className="summaryLabel">Count</div>
                <div className="summaryValue">{staticSummary.withdrawals.count}</div>
              </div>
              <div>
                <div className="summaryLabel">Total Amount</div>
                <div className="summaryValue strong">${staticSummary.withdrawals.total.toFixed(2)}</div>
              </div>
            </div>
          </div>

          <div className="summaryCard">
            <div className="summaryTitle">✅ Tasks</div>
            <div className="summaryGrid">
              <div>
                <div className="summaryLabel">Completed</div>
                <div className="summaryValue">{staticSummary.tasks.count}</div>
              </div>
              <div>
                <div className="summaryLabel">Earned</div>
                <div className="summaryValue strong">${staticSummary.tasks.total.toFixed(2)}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Performance Summary */}
        {summary && (
          <div className="historySummary">
            {[
              {
                title: "Today",
                sets: summary.today_sets,
                tasks: summary.today_tasks,
                amount: summary.today_commission,
              },
              {
                title: "This Week",
                sets: summary.week_sets,
                tasks: summary.week_tasks,
                amount: summary.week_commission,
              },
              {
                title: "Lifetime",
                sets: summary.lifetime_sets,
                tasks: summary.lifetime_tasks,
                amount: summary.lifetime_commission,
              },
            ].map((s) => (
              <div key={s.title} className="summaryCard">
                <div className="summaryTitle">{s.title}</div>

                <div className="summaryGrid">
                  <div>
                    <div className="summaryLabel">Sets</div>
                    <div className="summaryValue">{s.sets}</div>
                  </div>

                  <div>
                    <div className="summaryLabel">Tasks</div>
                    <div className="summaryValue">{s.tasks}</div>
                  </div>

                  <div>
                    <div className="summaryLabel">Commission</div>
                    <div className="summaryValue strong">
                      ${Number(s.amount).toFixed(2)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ================= FILTER TABS ================= */}
        <div className="historyTabs">
          {['All', 'Deposit', 'Withdrawal', 'Task'].map((tab) => (
            <button
              key={tab}
              className={`historyTab ${activeTab === tab ? 'active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* ================= HISTORY LIST ================= */}
        {!paginatedData.length ? (
          <div className="historyCard">
            <div className="historyEmpty">No {activeTab.toLowerCase()} history yet.</div>
          </div>
        ) : (
          paginatedData.map((item, i) => (
            <div key={item.id} className="historyCard">
              <div className="historyTop">
                <div className="historyIndex">#{startIndex + i + 1}</div>
                <div className={`historyBadge ${item.type}`}>
                  {item.type === 'deposit' && '💰 DEPOSIT'}
                  {item.type === 'withdrawal' && '💸 WITHDRAWAL'}
                  {item.type === 'task' && '✅ TASK'}
                </div>
                <div className={`historyStatus ${item.status.toLowerCase().replace(' ', '-')}`}>
                  {item.status}
                </div>
              </div>

              {/* Deposit/Withdrawal Details */}
              {(item.type === 'deposit' || item.type === 'withdrawal') && (
                <>
                  <div className="historyName">{item.method}</div>
                  <div className="historyGrid">
                    <div>
                      <div className="historyLabel">Amount</div>
                      <div className="historyValue strong">${item.amount.toFixed(2)}</div>
                    </div>
                    <div>
                      <div className="historyLabel">Transaction ID</div>
                      <div className="historyValue">{item.txId}</div>
                    </div>
                    <div>
                      <div className="historyLabel">Date</div>
                      <div className="historyValue">{fmt(item.date)}</div>
                    </div>
                  </div>
                </>
              )}

              {/* Task Details */}
              {item.type === 'task' && (
                <>
                  <div className="historyName">{item.setName}</div>
                  <div className="historyGrid">
                    <div>
                      <div className="historyLabel">Tasks Completed</div>
                      <div className="historyValue">{item.taskCount}</div>
                    </div>
                    <div>
                      <div className="historyLabel">Commission</div>
                      <div className="historyValue strong">${item.commission.toFixed(2)}</div>
                    </div>
                    <div>
                      <div className="historyLabel">Date</div>
                      <div className="historyValue">{fmt(item.date)}</div>
                    </div>
                  </div>
                </>
              )}
            </div>
          ))
        )}

        {/* ================= PAGINATION ================= */}
        {totalPages > 1 && (
          <div className="historyPagination">
            <button
              className="paginationBtn"
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              ← Previous
            </button>

            <div className="paginationInfo">
              Page {currentPage} of {totalPages}
            </div>

            <button
              className="paginationBtn"
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              Next →
            </button>
          </div>
        )}
      </div>

      <MemberBottomNav active="record" />
    </div>
  );
}
