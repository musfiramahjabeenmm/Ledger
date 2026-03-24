import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE = "http://localhost:8080/api";

/* ─── API helper — attaches JWT to every request ─── */
const api = async (path) => {
  const token = localStorage.getItem("token");
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (res.status === 401) {
    localStorage.removeItem("token");
    window.location.reload();
  }
  return res.json();
};

/* ─── Inject global styles once ─── */
function useStyles() {
  useEffect(() => {
    if (document.getElementById("ledger-dash-styles")) return;
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500&family=Outfit:wght@300;400;500;600&display=swap";
    document.head.appendChild(link);

    const s = document.createElement("style");
    s.id = "ledger-dash-styles";
    s.textContent = `
      *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
      body { background: #0A0A0A; font-family: 'Outfit', sans-serif; }

      @keyframes fadeUp   { from { opacity:0; transform:translateY(18px);} to { opacity:1; transform:translateY(0);} }
      @keyframes fadeIn   { from { opacity:0;} to { opacity:1;} }
      @keyframes spin     { to { transform:rotate(360deg);} }
      @keyframes fillBar  { from { width:0%;} to { width:var(--w);} }
      @keyframes pulse    { 0%,100%{opacity:1} 50%{opacity:.5} }
      @keyframes slideIn  { from{opacity:0;transform:translateX(-12px)} to{opacity:1;transform:translateX(0)} }

      .dash-root {
        display: flex;
        min-height: 100vh;
        background: #0A0A0A;
        color: #F5F0E8;
      }

      /* ── Sidebar ── */
      .sidebar {
        width: 220px;
        min-height: 100vh;
        background: #111;
        border-right: 1px solid #1A1A1A;
        display: flex;
        flex-direction: column;
        padding: 28px 0;
        position: fixed;
        top: 0; left: 0;
        z-index: 100;
        animation: fadeIn 0.4s ease both;
      }
      .sidebar-brand {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 0 24px 32px;
        border-bottom: 1px solid #1A1A1A;
        margin-bottom: 16px;
      }
      .brand-icon {
        width: 32px; height: 32px;
        border-radius: 8px;
        background: #E8A838;
        display: flex; align-items: center; justify-content: center;
        flex-shrink: 0;
      }
      .brand-name {
        font-size: 13px; font-weight: 600;
        color: #F5F0E8; letter-spacing: 0.07em;
      }
      .nav-section {
        padding: 0 12px;
        display: flex;
        flex-direction: column;
        gap: 2px;
        flex: 1;
      }
      .nav-label {
        font-size: 10px; font-weight: 500;
        color: #333; letter-spacing: 0.1em;
        text-transform: uppercase;
        padding: 12px 12px 6px;
      }
      .nav-item {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 10px 12px;
        border-radius: 8px;
        cursor: pointer;
        font-size: 13.5px;
        font-weight: 400;
        color: #555;
        border: none;
        background: transparent;
        width: 100%;
        text-align: left;
        font-family: 'Outfit', sans-serif;
        transition: all 0.2s ease;
        animation: slideIn 0.4s ease both;
      }
      .nav-item:hover { background: #1A1A1A; color: #999; }
      .nav-item.active { background: rgba(232,168,56,0.1); color: #E8A838; font-weight: 500; }
      .nav-item.active .nav-dot { background: #E8A838; }
      .nav-dot {
        width: 6px; height: 6px;
        border-radius: 50%;
        background: #333;
        flex-shrink: 0;
        transition: background 0.2s;
      }
      .sidebar-footer {
        padding: 16px 12px 0;
        border-top: 1px solid #1A1A1A;
        margin: 0 0;
      }
      .logout-btn {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 10px 12px;
        border-radius: 8px;
        cursor: pointer;
        font-size: 13px;
        color: #444;
        border: none;
        background: transparent;
        width: 100%;
        text-align: left;
        font-family: 'Outfit', sans-serif;
        transition: all 0.2s;
      }
      .logout-btn:hover { background: rgba(220,38,38,0.08); color: #F87171; }

      /* ── Main content ── */
      .main {
        margin-left: 220px;
        flex: 1;
        padding: 40px 40px;
        min-height: 100vh;
        animation: fadeIn 0.5s ease both;
      }

      /* ── Top bar ── */
      .topbar {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 36px;
        animation: fadeUp 0.4s ease both;
      }
      .topbar-greeting { font-family: 'Playfair Display', serif; font-size: 26px; font-weight: 400; color: #F5F0E8; }
      .topbar-date { font-size: 13px; color: #444; margin-top: 4px; }
      .topbar-avatar {
        width: 38px; height: 38px;
        border-radius: 50%;
        background: rgba(232,168,56,0.15);
        border: 1px solid rgba(232,168,56,0.3);
        display: flex; align-items: center; justify-content: center;
        font-size: 13px; font-weight: 600; color: #E8A838;
      }

      /* ── Stat cards ── */
      .stats-grid {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 16px;
        margin-bottom: 32px;
      }
      .stat-card {
        background: #111;
        border: 1px solid #1A1A1A;
        border-radius: 14px;
        padding: 22px 22px;
        animation: fadeUp 0.45s ease both;
        transition: border-color 0.2s;
      }
      .stat-card:hover { border-color: #2A2A2A; }
      .stat-label { font-size: 11px; font-weight: 500; color: #444; letter-spacing: 0.07em; text-transform: uppercase; margin-bottom: 10px; }
      .stat-value { font-family: 'Playfair Display', serif; font-size: 28px; font-weight: 400; color: #F5F0E8; line-height: 1; margin-bottom: 6px; }
      .stat-value.amber { color: #E8A838; }
      .stat-value.green { color: #4ADE80; }
      .stat-value.red   { color: #F87171; }
      .stat-sub { font-size: 11px; color: #333; }

      /* ── Section heading ── */
      .section-head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 16px;
      }
      .section-title { font-size: 13px; font-weight: 500; color: #666; letter-spacing: 0.06em; text-transform: uppercase; }
      .section-link { font-size: 12px; color: #E8A838; cursor: pointer; background: none; border: none; font-family: 'Outfit', sans-serif; }
      .section-link:hover { text-decoration: underline; }

      /* ── Two-column grid ── */
      .two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 24px; }

      /* ── Budget cards ── */
      .budget-panel {
        background: #111;
        border: 1px solid #1A1A1A;
        border-radius: 14px;
        padding: 24px;
        animation: fadeUp 0.5s ease both 0.1s;
      }
      .budget-item { margin-bottom: 20px; }
      .budget-item:last-child { margin-bottom: 0; }
      .budget-row { display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; }
      .budget-name { font-size: 13.5px; color: #C8C0B0; font-weight: 400; }
      .budget-pct  { font-size: 12px; color: #555; }
      .budget-pct.warn { color: #F59E0B; }
      .budget-pct.over { color: #F87171; }
      .bar-track { height: 5px; background: #1A1A1A; border-radius: 99px; overflow: hidden; }
      .bar-fill  {
        height: 100%;
        border-radius: 99px;
        background: #E8A838;
        width: var(--w);
        animation: fillBar 0.9s cubic-bezier(0.4,0,0.2,1) both;
        animation-delay: var(--d, 0s);
      }
      .bar-fill.warn { background: #F59E0B; }
      .bar-fill.over { background: #F87171; }
      .budget-amounts { font-size: 11px; color: #333; margin-top: 5px; }

      /* ── Transactions ── */
      .txn-panel {
        background: #111;
        border: 1px solid #1A1A1A;
        border-radius: 14px;
        padding: 24px;
        animation: fadeUp 0.5s ease both 0.15s;
      }
      .txn-item {
        display: flex;
        align-items: center;
        gap: 14px;
        padding: 12px 0;
        border-bottom: 1px solid #161616;
        transition: opacity 0.2s;
      }
      .txn-item:last-child { border-bottom: none; padding-bottom: 0; }
      .txn-item:hover { opacity: 0.8; }
      .txn-icon {
        width: 36px; height: 36px;
        border-radius: 10px;
        background: #1A1A1A;
        display: flex; align-items: center; justify-content: center;
        font-size: 15px;
        flex-shrink: 0;
      }
      .txn-info { flex: 1; min-width: 0; }
      .txn-name { font-size: 13.5px; color: #C8C0B0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
      .txn-cat  { font-size: 11px; color: #444; margin-top: 2px; }
      .txn-amount { font-size: 14px; font-weight: 500; flex-shrink: 0; }
      .txn-amount.debit  { color: #F87171; }
      .txn-amount.credit { color: #4ADE80; }
      .txn-date { font-size: 11px; color: #333; flex-shrink: 0; }

      /* ── Alert banner ── */
      .alert-banner {
        background: rgba(245,158,11,0.07);
        border: 1px solid rgba(245,158,11,0.2);
        border-radius: 10px;
        padding: 12px 18px;
        font-size: 13px;
        color: #F59E0B;
        margin-bottom: 20px;
        display: flex;
        align-items: center;
        gap: 10px;
        animation: fadeUp 0.3s ease both;
      }
      .alert-dot { width: 6px; height: 6px; border-radius: 50%; background: #F59E0B; flex-shrink: 0; animation: pulse 1.5s ease-in-out infinite; }

      /* ── Empty / loading states ── */
      .empty { text-align: center; padding: 32px; color: #333; font-size: 13px; }
      .spinner-wrap { display: flex; align-items: center; justify-content: center; padding: 48px; }
      .spinner-lg {
        width: 28px; height: 28px;
        border: 2px solid #1A1A1A;
        border-top-color: #E8A838;
        border-radius: 50%;
        animation: spin 0.8s linear infinite;
      }

      /* ── Responsive ── */
      @media (max-width: 900px) {
        .sidebar { width: 64px; }
        .brand-name, .nav-item span, .nav-label, .sidebar-footer .logout-label { display: none; }
        .nav-item { justify-content: center; padding: 12px; }
        .main { margin-left: 64px; padding: 28px 20px; }
        .stats-grid { grid-template-columns: 1fr 1fr; }
        .two-col { grid-template-columns: 1fr; }
      }
      @media (max-width: 580px) {
        .stats-grid { grid-template-columns: 1fr 1fr; }
        .main { padding: 20px 16px; }
      }
    `;
    document.head.appendChild(s);
  }, []);
}

/* ─── Category emoji map ─── */
const categoryEmoji = (name = "") => {
  const n = name.toLowerCase();
  if (n.includes("food") || n.includes("groceries") || n.includes("restaurant")) return "🍛";
  if (n.includes("transport") || n.includes("travel") || n.includes("fuel")) return "🚗";
  if (n.includes("entertain") || n.includes("movies") || n.includes("fun")) return "🎬";
  if (n.includes("health") || n.includes("medical") || n.includes("pharma")) return "💊";
  if (n.includes("cloth") || n.includes("fashion") || n.includes("shopping")) return "👕";
  if (n.includes("bill") || n.includes("util") || n.includes("electric")) return "⚡";
  if (n.includes("edu") || n.includes("course") || n.includes("book")) return "📚";
  if (n.includes("rent") || n.includes("home") || n.includes("house")) return "🏠";
  return "💳";
};

/* ─── Format currency ─── */
const fmt = (n) => `₹${Number(n || 0).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;

/* ─── Format date ─── */
const fmtDate = (d) => {
  if (!d) return "";
  const date = new Date(d);
  return date.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
};

/* ─── Nav items ─── */
const NAV = [
  { key: "dashboard", label: "Dashboard", icon: "◈" },
  { key: "transactions", label: "Transactions", icon: "⇄" },
  { key: "budgets", label: "Budgets", icon: "◎" },
  { key: "categories", label: "Categories", icon: "⊞" },
  { key: "accounts", label: "Accounts", icon: "◇" },
];

/* ══════════════════════════════════════════
   MAIN DASHBOARD COMPONENT
══════════════════════════════════════════ */
export default function Dashboard({ onNavigate, onLogout }) {
  useStyles();

  const [activePage, setActivePage] = useState("dashboard");
  const [loading, setLoading] = useState(true);
  const [budgets, setBudgets] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [alerts, setAlerts] = useState([]);

  /* ── Fetch all data in parallel ── */
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [b, t, a] = await Promise.all([
          api("/budgets"),
          api("/transactions"),
          // api("/accounts"),
        ]);
        setBudgets(Array.isArray(b) ? b : []);
        setTransactions(Array.isArray(t) ? t.slice(0, 8) : []);
        setAccounts(Array.isArray(a) ? a : []);

        // generate alerts for budgets over 80%
        const over = (Array.isArray(b) ? b : []).filter(
          (bgt) => bgt.allocatedAmount > 0 && (bgt.spentAmount / bgt.allocatedAmount) >= 0.8
        );
        setAlerts(over);
      } catch (e) {
        console.error("Dashboard fetch error:", e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  /* ── Derived stats ── */
  const totalSpent = transactions.filter(t => t.status === "SUCCESS").reduce((s, t) => s + (t.amount || 0), 0);
  const totalBalance = accounts.reduce((s, a) => s + (a.balance || 0), 0);
  const totalBudget = budgets.reduce((s, b) => s + (b.allocatedAmount || 0), 0);
  const totalBudgetSpent = budgets.reduce((s, b) => s + (b.spentAmount || 0), 0);
  const budgetPct = totalBudget > 0 ? Math.round((totalBudgetSpent / totalBudget) * 100) : 0;

  /* ── User initials from token ── */
  const getUserInitial = () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return "U";
      const payload = JSON.parse(atob(token.split(".")[1]));
      return (payload.name || payload.sub || "U").charAt(0).toUpperCase();
    } catch { return "U"; }
  };

  const today = new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" });
  
  const navigate = useNavigate();
  const handleNav = (key) => {
    setActivePage(key);
    navigate(`/${key}`);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    if (onLogout) onLogout();
    else window.location.reload();
  };

  return (
    <div className="dash-root">

      {/* ══ SIDEBAR ══ */}
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="brand-icon">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <path d="M8 2L13 5V11L8 14L3 11V5L8 2Z" fill="#0F0F0F" />
            </svg>
          </div>
          <span className="brand-name">LEDGER</span>
        </div>

        <nav className="nav-section">
          <span className="nav-label">Menu</span>
          {NAV.map((item, i) => (
            <button
              key={item.key}
              className={`nav-item ${activePage === item.key ? "active" : ""}`}
              style={{ animationDelay: `${i * 0.06}s` }}
              onClick={() => handleNav(item.key)}
            >
              <span style={{ fontSize: "15px", flexShrink: 0 }}>{item.icon}</span>
              <span>{item.label}</span>
              {activePage === item.key && <div className="nav-dot" style={{ marginLeft: "auto" }} />}
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button className="logout-btn" onClick={handleLogout}>
            <span style={{ fontSize: "15px" }}>→</span>
            <span className="logout-label">Sign out</span>
          </button>
        </div>
      </aside>

      {/* ══ MAIN CONTENT ══ */}
      <main className="main">

        {/* Top bar */}
        <div className="topbar">
          <div>
            <div className="topbar-greeting">Good day 👋</div>
            <div className="topbar-date">{today}</div>
          </div>
          <div className="topbar-avatar">{getUserInitial()}</div>
        </div>

        {loading ? (
          <div className="spinner-wrap">
            <div className="spinner-lg" />
          </div>
        ) : (
          <>
            {/* ── Budget alerts ── */}
            {alerts.map((a, i) => (
              <div key={i} className="alert-banner">
                <div className="alert-dot" />
                <span>
                  <strong>{a.categoryName || "Budget"}</strong> is at{" "}
                  {Math.round((a.spentAmount / a.allocatedAmount) * 100)}% —{" "}
                  {fmt(a.allocatedAmount - a.spentAmount)} remaining
                </span>
              </div>
            ))}

            {/* ── Stat cards ── */}
            <div className="stats-grid">
              <div className="stat-card" style={{ animationDelay: "0.05s" }}>
                <div className="stat-label">Total spent</div>
                <div className="stat-value amber">{fmt(totalSpent)}</div>
                <div className="stat-sub">This month</div>
              </div>
              <div className="stat-card" style={{ animationDelay: "0.1s" }}>
                <div className="stat-label">Total balance</div>
                <div className={`stat-value ${totalBalance >= 0 ? "green" : "red"}`}>{fmt(totalBalance)}</div>
                <div className="stat-sub">Across {accounts.length} account{accounts.length !== 1 ? "s" : ""}</div>
              </div>
              <div className="stat-card" style={{ animationDelay: "0.15s" }}>
                <div className="stat-label">Budget used</div>
                <div className={`stat-value ${budgetPct > 80 ? "red" : budgetPct > 60 ? "amber" : "green"}`}>
                  {budgetPct}%
                </div>
                <div className="stat-sub">{fmt(totalBudgetSpent)} of {fmt(totalBudget)}</div>
              </div>
              <div className="stat-card" style={{ animationDelay: "0.2s" }}>
                <div className="stat-label">Transactions</div>
                <div className="stat-value">{transactions.length}</div>
                <div className="stat-sub">Recent activity</div>
              </div>
            </div>

            {/* ── Two column: Budgets + Transactions ── */}
            <div className="two-col">

              {/* Budget health */}
              <div className="budget-panel">
                <div className="section-head">
                  <span className="section-title">Budget health</span>
                  <button className="section-link" onClick={() => handleNav("budgets")}>View all →</button>
                </div>
                {budgets.length === 0 ? (
                  <div className="empty">No budgets set yet</div>
                ) : (
                  budgets.slice(0, 6).map((b, i) => {
                    const pct = b.allocatedAmount > 0
                      ? Math.min(Math.round((b.spentAmount / b.allocatedAmount) * 100), 100)
                      : 0;
                    const cls = pct >= 100 ? "over" : pct >= 80 ? "warn" : "";
                    return (
                      <div key={b.id || i} className="budget-item">
                        <div className="budget-row">
                          <span className="budget-name">
                            {categoryEmoji(b.categoryName)} {b.categoryName || "Unnamed"}
                          </span>
                          <span className={`budget-pct ${cls}`}>{pct}%</span>
                        </div>
                        <div className="bar-track">
                          <div
                            className={`bar-fill ${cls}`}
                            style={{ "--w": `${pct}%`, "--d": `${i * 0.1}s` }}
                          />
                        </div>
                        <div className="budget-amounts">
                          {fmt(b.spentAmount)} spent · {fmt(b.allocatedAmount)} limit
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Recent transactions */}
              <div className="txn-panel">
                <div className="section-head">
                  <span className="section-title">Recent transactions</span>
                  <button className="section-link" onClick={() => handleNav("transactions")}>View all →</button>
                </div>
                {transactions.length === 0 ? (
                  <div className="empty">No transactions yet</div>
                ) : (
                  transactions.map((t, i) => {
                    const isCredit = t.type === "CREDIT" || t.amount < 0;
                    return (
                      <div key={t.id || i} className="txn-item">
                        <div className="txn-icon">{categoryEmoji(t.categoryName)}</div>
                        <div className="txn-info">
                          <div className="txn-name">{t.description || t.referenceId || "Transaction"}</div>
                          <div className="txn-cat">{t.categoryName || t.type || "—"}</div>
                        </div>
                        <div className={`txn-amount ${isCredit ? "credit" : "debit"}`}>
                          {isCredit ? "+" : "-"}{fmt(Math.abs(t.amount))}
                        </div>
                        <div className="txn-date">{fmtDate(t.createdAt || t.date)}</div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

          </>
        )}
      </main>
    </div>
  );
}
