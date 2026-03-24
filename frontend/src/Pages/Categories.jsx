import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE = "http://localhost:8080/api";

const api = async (path, method = "GET", body = null) => {
  const token = localStorage.getItem("token");
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  if (res.status === 401) {
    localStorage.removeItem("token");
    window.location.reload();
  }
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || `Request failed: ${res.status}`);
  return data;
};

function useStyles() {
  useEffect(() => {
    if (document.getElementById("ledger-cat-styles")) return;
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500&family=Outfit:wght@300;400;500;600&display=swap";
    document.head.appendChild(link);

    const s = document.createElement("style");
    s.id = "ledger-cat-styles";
    s.textContent = `
      *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
      body { background: #0A0A0A; font-family: 'Outfit', sans-serif; }

      @keyframes fadeUp  { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
      @keyframes fadeIn  { from{opacity:0} to{opacity:1} }
      @keyframes slideIn { from{opacity:0;transform:translateX(40px)} to{opacity:1;transform:translateX(0)} }
      @keyframes spin    { to{transform:rotate(360deg)} }

      .cat-root { display:flex; min-height:100vh; background:#0A0A0A; color:#F5F0E8; }

      .sidebar {
        width:220px; min-height:100vh; background:#111;
        border-right:1px solid #1A1A1A; display:flex;
        flex-direction:column; padding:28px 0;
        position:fixed; top:0; left:0; z-index:100;
      }
      .sidebar-brand {
        display:flex; align-items:center; gap:10px;
        padding:0 24px 32px; border-bottom:1px solid #1A1A1A; margin-bottom:16px;
      }
      .brand-icon {
        width:32px; height:32px; border-radius:8px; background:#E8A838;
        display:flex; align-items:center; justify-content:center; flex-shrink:0;
      }
      .brand-name { font-size:13px; font-weight:600; color:#F5F0E8; letter-spacing:0.07em; }
      .nav-section { padding:0 12px; display:flex; flex-direction:column; gap:2px; flex:1; }
      .nav-label { font-size:10px; font-weight:500; color:#333; letter-spacing:0.1em; text-transform:uppercase; padding:12px 12px 6px; }
      .nav-item {
        display:flex; align-items:center; gap:10px; padding:10px 12px;
        border-radius:8px; cursor:pointer; font-size:13.5px; font-weight:400;
        color:#555; border:none; background:transparent; width:100%;
        text-align:left; font-family:'Outfit',sans-serif; transition:all 0.2s;
      }
      .nav-item:hover { background:#1A1A1A; color:#999; }
      .nav-item.active { background:rgba(232,168,56,0.1); color:#E8A838; font-weight:500; }
      .nav-dot { width:6px; height:6px; border-radius:50%; background:#333; flex-shrink:0; margin-left:auto; }
      .nav-item.active .nav-dot { background:#E8A838; }
      .sidebar-footer { padding:16px 12px 0; border-top:1px solid #1A1A1A; }
      .logout-btn {
        display:flex; align-items:center; gap:10px; padding:10px 12px;
        border-radius:8px; cursor:pointer; font-size:13px; color:#444;
        border:none; background:transparent; width:100%;
        font-family:'Outfit',sans-serif; transition:all 0.2s;
      }
      .logout-btn:hover { background:rgba(220,38,38,0.08); color:#F87171; }

      .cat-main { margin-left:220px; flex:1; padding:40px; animation:fadeIn 0.4s ease both; }

      .page-header { display:flex; align-items:center; justify-content:space-between; margin-bottom:32px; animation:fadeUp 0.4s ease both; }
      .page-title { font-family:'Playfair Display',serif; font-size:26px; font-weight:400; color:#F5F0E8; margin-bottom:4px; }
      .page-sub { font-size:13px; color:#444; }
      .add-btn {
        display:flex; align-items:center; gap:8px; padding:11px 20px;
        background:#E8A838; color:#0A0A0A; border:none; border-radius:10px;
        font-family:'Outfit',sans-serif; font-size:13.5px; font-weight:600;
        cursor:pointer; transition:opacity 0.2s, transform 0.15s;
      }
      .add-btn:hover { opacity:0.88; transform:translateY(-1px); }

      .stats-row { display:grid; grid-template-columns:repeat(3,1fr); gap:14px; margin-bottom:28px; }
      .stat-card { background:#111; border:1px solid #1A1A1A; border-radius:12px; padding:18px 20px; animation:fadeUp 0.4s ease both; transition:border-color 0.2s; }
      .stat-card:hover { border-color:#2A2A2A; }
      .stat-label { font-size:11px; font-weight:500; color:#444; letter-spacing:0.07em; text-transform:uppercase; margin-bottom:8px; }
      .stat-val { font-family:'Playfair Display',serif; font-size:28px; font-weight:400; }
      .c-amber { color:#E8A838; }
      .c-green  { color:#4ADE80; }
      .c-red    { color:#F87171; }

      .filters { display:flex; gap:8px; margin-bottom:24px; animation:fadeUp 0.4s ease both 0.05s; flex-wrap:wrap; }
      .filter-pill {
        padding:6px 16px; border-radius:99px; font-size:12px; font-weight:500;
        border:1px solid #1E1E1E; background:transparent; color:#555;
        cursor:pointer; font-family:'Outfit',sans-serif; transition:all 0.2s;
      }
      .filter-pill:hover { border-color:#2A2A2A; color:#888; }
      .filter-pill.on { background:#E8A838; color:#0A0A0A; border-color:#E8A838; }

      .cat-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(268px,1fr)); gap:14px; }

      .cat-card {
        background:#111; border:1px solid #1A1A1A; border-radius:14px;
        padding:20px 22px; transition:border-color 0.2s, transform 0.15s;
        animation:fadeUp 0.45s ease both;
      }
      .cat-card:hover { border-color:#2A2A2A; transform:translateY(-2px); }
      .cat-card.off { opacity:0.45; }

      .card-top { display:flex; align-items:flex-start; justify-content:space-between; margin-bottom:14px; }
      .card-icon { width:40px; height:40px; border-radius:10px; background:#1A1A1A; display:flex; align-items:center; justify-content:center; font-size:18px; }
      .card-actions { display:flex; gap:6px; opacity:0; transition:opacity 0.2s; }
      .cat-card:hover .card-actions { opacity:1; }
      .action-btn {
        width:28px; height:28px; border-radius:7px; background:#1A1A1A;
        border:1px solid #2A2A2A; cursor:pointer;
        display:flex; align-items:center; justify-content:center;
        font-size:13px; color:#666; transition:all 0.2s;
      }
      .action-btn:hover { background:#222; color:#E8A838; border-color:rgba(232,168,56,0.3); }
      .action-btn.tog:hover { background:rgba(74,222,128,0.1); color:#4ADE80; border-color:rgba(74,222,128,0.2); }

      .card-name { font-size:15px; font-weight:500; color:#C8C0B0; margin-bottom:10px; }
      .badges { display:flex; gap:6px; flex-wrap:wrap; }
      .badge { padding:3px 10px; border-radius:99px; font-size:11px; font-weight:500; letter-spacing:0.04em; }
      .b-expense  { background:rgba(248,113,113,0.1); color:#F87171; border:1px solid rgba(248,113,113,0.2); }
      .b-income   { background:rgba(74,222,128,0.1);  color:#4ADE80; border:1px solid rgba(74,222,128,0.2); }
      .b-active   { background:rgba(74,222,128,0.07); color:#4ADE80; border:1px solid rgba(74,222,128,0.15); }
      .b-inactive { background:rgba(255,255,255,0.04); color:#555; border:1px solid #1E1E1E; }
      .card-date { font-size:11px; color:#333; margin-top:10px; }

      .empty-state { grid-column:1/-1; text-align:center; padding:60px 20px; animation:fadeUp 0.4s ease both; }
      .empty-icon { width:56px; height:56px; border-radius:14px; background:#161616; border:1px solid #1E1E1E; display:flex; align-items:center; justify-content:center; font-size:22px; margin:0 auto 16px; }
      .empty-state h3 { font-size:16px; color:#555; font-weight:400; margin-bottom:6px; }
      .empty-state p  { font-size:13px; color:#333; }

      .spin-wrap { display:flex; align-items:center; justify-content:center; padding:80px; }
      .spin-lg { width:28px; height:28px; border:2px solid #1A1A1A; border-top-color:#E8A838; border-radius:50%; animation:spin 0.8s linear infinite; }
      .spin-sm { width:15px; height:15px; border:2px solid rgba(10,10,10,0.2); border-top-color:#0A0A0A; border-radius:50%; animation:spin 0.7s linear infinite; display:inline-block; }

      .overlay { position:fixed; inset:0; background:rgba(0,0,0,0.65); z-index:200; animation:fadeIn 0.2s ease both; backdrop-filter:blur(3px); }
      .panel {
        position:fixed; top:0; right:0; width:420px; height:100vh;
        background:#111; border-left:1px solid #1E1E1E;
        padding:40px 36px; z-index:201;
        animation:slideIn 0.3s cubic-bezier(0.4,0,0.2,1) both;
        display:flex; flex-direction:column; overflow-y:auto;
      }
      .panel-head { display:flex; align-items:center; justify-content:space-between; margin-bottom:36px; }
      .panel-title { font-family:'Playfair Display',serif; font-size:22px; font-weight:400; color:#F5F0E8; }
      .close-btn {
        width:32px; height:32px; border-radius:8px; background:#1A1A1A;
        border:1px solid #2A2A2A; cursor:pointer;
        display:flex; align-items:center; justify-content:center;
        font-size:15px; color:#555; transition:all 0.2s;
      }
      .close-btn:hover { color:#F5F0E8; border-color:#3A3A3A; background:#222; }

      .panel-body { display:flex; flex-direction:column; gap:22px; flex:1; }
      .field { display:flex; flex-direction:column; gap:8px; }
      .field-label { font-size:11px; font-weight:500; color:#555; letter-spacing:0.08em; text-transform:uppercase; }
      .field-label-sub { font-size:11px; color:#444; font-weight:400; letter-spacing:0; text-transform:none; margin-left:6px; }
      .field-input {
        padding:12px 16px; background:#1A1A1A; border:1px solid #2A2A2A;
        border-radius:10px; color:#F5F0E8; font-family:'Outfit',sans-serif;
        font-size:14px; outline:none; transition:border-color 0.2s, box-shadow 0.2s;
        width:100%;
      }
      .field-input::placeholder { color:#444; }
      .field-input:focus { border-color:#E8A838; box-shadow:0 0 0 3px rgba(232,168,56,0.08); }
      .field-input.err { border-color:rgba(248,113,113,0.4); }

      .amount-wrap {
        display:flex; align-items:center; gap:8px;
        background:#1A1A1A; border:1px solid #2A2A2A;
        border-radius:10px; padding:12px 16px;
        transition:border-color 0.2s, box-shadow 0.2s;
      }
      .amount-wrap:focus-within { border-color:#E8A838; box-shadow:0 0 0 3px rgba(232,168,56,0.08); }
      .amount-wrap.err { border-color:rgba(248,113,113,0.4); }
      .amount-sym { font-size:15px; color:#E8A838; font-weight:500; flex-shrink:0; }
      .amount-input {
        flex:1; background:transparent; border:none; outline:none;
        color:#F5F0E8; font-family:'Outfit',sans-serif; font-size:14px;
      }
      .amount-input::placeholder { color:#444; }

      .income-bar {
        height:3px; background:#1A1A1A; border-radius:99px; overflow:hidden; margin-top:-10px;
      }
      .income-bar-fill { height:100%; border-radius:99px; transition:width 0.3s ease, background 0.3s; }

      .field-hint { font-size:11px; color:#444; margin-top:-10px; }
      .field-hint.warn { color:#F59E0B; }
      .field-hint.err  { color:#F87171; }

      .type-row { display:flex; background:#161616; border:1px solid #1E1E1E; border-radius:10px; padding:4px; gap:4px; }
      .type-opt { flex:1; padding:10px; border-radius:7px; font-size:13px; font-weight:500; border:none; cursor:pointer; font-family:'Outfit',sans-serif; transition:all 0.2s; color:#444; background:transparent; }
      .type-opt:hover { color:#888; }
      .type-opt.sel-exp { background:rgba(248,113,113,0.15); color:#F87171; }
      .type-opt.sel-inc { background:rgba(74,222,128,0.15);  color:#4ADE80; }

      .panel-error { background:rgba(220,38,38,0.08); border:1px solid rgba(220,38,38,0.2); border-radius:8px; padding:10px 14px; font-size:13px; color:#F87171; }

      .submit-btn {
        margin-top:auto; padding:13px; background:#E8A838; color:#0A0A0A;
        border:none; border-radius:10px; font-family:'Outfit',sans-serif;
        font-size:14px; font-weight:600; cursor:pointer; letter-spacing:0.02em;
        transition:opacity 0.2s, transform 0.15s;
        display:flex; align-items:center; justify-content:center; gap:8px;
      }
      .submit-btn:hover:not(:disabled) { opacity:0.88; transform:translateY(-1px); }
      .submit-btn:disabled { opacity:0.4; cursor:not-allowed; }

      .toast {
        position:fixed; bottom:28px; right:28px; padding:12px 18px;
        border-radius:10px; font-size:13px; font-weight:500; z-index:400;
        animation:fadeUp 0.3s ease both; font-family:'Outfit',sans-serif;
      }
      .toast.ok  { background:rgba(74,222,128,0.1);  border:1px solid rgba(74,222,128,0.2);  color:#4ADE80; }
      .toast.err { background:rgba(220,38,38,0.1);   border:1px solid rgba(220,38,38,0.2);   color:#F87171; }

      @media (max-width:900px) {
        .sidebar { width:64px; }
        .brand-name, .nav-item span, .nav-label { display:none; }
        .nav-item { justify-content:center; padding:12px; }
        .cat-main { margin-left:64px; padding:28px 16px; }
        .stats-row { grid-template-columns:1fr 1fr; }
        .panel { width:100%; }
      }
    `;
    document.head.appendChild(s);
  }, []);
}

const emoji = (name = "") => {
  const n = name.toLowerCase();
  if (n.includes("food") || n.includes("dining") || n.includes("grocer")) return "🍛";
  if (n.includes("transport") || n.includes("travel") || n.includes("fuel")) return "🚗";
  if (n.includes("entertain") || n.includes("movie")) return "🎬";
  if (n.includes("health") || n.includes("medical")) return "💊";
  if (n.includes("shop") || n.includes("cloth") || n.includes("fashion")) return "🛍️";
  if (n.includes("bill") || n.includes("util") || n.includes("electric")) return "⚡";
  if (n.includes("edu") || n.includes("book") || n.includes("course")) return "📚";
  if (n.includes("rent") || n.includes("home") || n.includes("house")) return "🏠";
  if (n.includes("salary") || n.includes("wage")) return "💰";
  if (n.includes("freelance")) return "💻";
  if (n.includes("invest")) return "📈";
  return "💳";
};

const fmtDate = (d) => d
  ? new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
  : "";

const fmt = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;

const NAV = [
  { key: "dashboard",    label: "Dashboard",    icon: "◈" },
  { key: "transactions", label: "Transactions", icon: "⇄" },
  { key: "budgets",      label: "Budgets",      icon: "◎" },
  { key: "categories",   label: "Categories",   icon: "⊞" },
  { key: "accounts",     label: "Accounts",     icon: "◇" },
];

export default function CategoriesPage({ onLogout }) {
  useStyles();
  const navigate = useNavigate();

  /* ── User income from onboarding ── */
  const userIncome = Number(localStorage.getItem("userIncome")) || 0;

  /* ── State ── */
  const [categories, setCategories]   = useState([]);
  const [filter, setFilter]           = useState("ALL");
  const [loading, setLoading]         = useState(true);
  const [panelOpen, setPanelOpen]     = useState(false);
  const [editing, setEditing]         = useState(null);
  const [formName, setFormName]       = useState("");
  const [formType, setFormType]       = useState("EXPENSE");
  const [formBudget, setFormBudget]   = useState("");
  const [budgetError, setBudgetError] = useState("");
  const [formError, setFormError]     = useState("");
  const [formLoading, setFormLoading] = useState(false);
  const [toast, setToast]             = useState(null);

  /* ── Derived ── */
  const budgetNum  = Number(formBudget) || 0;
  const budgetPct  = userIncome > 0 ? Math.min((budgetNum / userIncome) * 100, 100) : 0;
  const barColor   = budgetPct >= 100 ? "#F87171" : budgetPct >= 80 ? "#F59E0B" : "#4ADE80";

  const showToast = (msg, type = "ok") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const data = await api("/categories");
      setCategories(Array.isArray(data) ? data : []);
    } catch (e) {
      showToast("Failed to load categories", "err");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCategories(); }, []);

  const openAdd = () => {
    setEditing(null); setFormName(""); setFormType("EXPENSE");
    setFormBudget(""); setBudgetError(""); setFormError("");
    setPanelOpen(true);
  };

  const openEdit = (cat) => {
    setEditing(cat); setFormName(cat.categoryName);
    setFormType(cat.categoryType);
    setFormBudget(""); setBudgetError(""); setFormError("");
    setPanelOpen(true);
  };

  const closePanel = () => {
    setPanelOpen(false); setEditing(null);
    setFormName(""); setFormType("EXPENSE");
    setFormBudget(""); setBudgetError(""); setFormError("");
  };

  const handleBudgetChange = (val) => {
    setFormBudget(val);
    setBudgetError("");
    if (userIncome > 0 && Number(val) > userIncome) {
      setBudgetError(`Cannot exceed your income of ${fmt(userIncome)}`);
    }
  };

  const handleSubmit = async () => {
    if (!formName.trim()) return setFormError("Category name is required.");
    if (formType === "EXPENSE") {
      if (!formBudget || Number(formBudget) <= 0)
        return setFormError("Please enter a valid budget amount.");
      if (userIncome > 0 && Number(formBudget) > userIncome)
        return setFormError(`Budget cannot exceed your income of ${fmt(userIncome)}`);
    }
    setFormError(""); setFormLoading(true);
    try {
      const payload = { categoryName: formName.trim(), categoryType: formType };
      if (editing) {
        await api(`/categories/${editing.categoryId}`, "PUT", payload);
        showToast(`${formName} updated`);
      } else {
        await api("/categories", "POST", payload);
        showToast(`${formName} created`);
      }
      closePanel();
      fetchCategories();
    } catch (e) {
      setFormError(e.message || "Something went wrong.");
    } finally {
      setFormLoading(false);
    }
  };

  const handleToggle = async (cat) => {
    try {
      const path = cat.categoryStatus === "ACTIVE"
        ? `/categories/${cat.categoryId}/deactivate`
        : `/categories/${cat.categoryId}/activate`;
      await api(path, "PUT");
      showToast(`${cat.categoryName} ${cat.categoryStatus === "ACTIVE" ? "deactivated" : "activated"}`);
      fetchCategories();
    } catch (e) {
      showToast("Failed to update status", "err");
    }
  };

  const handleLogoutClick = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("onboarded");
    if (onLogout) onLogout();
    else window.location.reload();
  };

  const filtered = categories.filter((c) => {
    if (filter === "ALL")      return true;
    if (filter === "INCOME")   return c.categoryType === "INCOME";
    if (filter === "EXPENSE")  return c.categoryType === "EXPENSE";
    if (filter === "ACTIVE")   return c.categoryStatus === "ACTIVE";
    if (filter === "INACTIVE") return c.categoryStatus === "INACTIVE";
    return true;
  });

  const incomeCount  = categories.filter(c => c.categoryType === "INCOME").length;
  const expenseCount = categories.filter(c => c.categoryType === "EXPENSE").length;

  return (
    <div className="cat-root">

      {/* ── Sidebar ── */}
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="brand-icon">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <path d="M8 2L13 5V11L8 14L3 11V5L8 2Z" fill="#0F0F0F"/>
            </svg>
          </div>
          <span className="brand-name">LEDGER</span>
        </div>
        <nav className="nav-section">
          <span className="nav-label">Menu</span>
          {NAV.map((item, i) => (
            <button
              key={item.key}
              className={`nav-item ${item.key === "categories" ? "active" : ""}`}
              style={{ animationDelay: `${i * 0.05}s` }}
              onClick={() => navigate(`/${item.key}`)}
            >
              <span style={{ fontSize: "15px", flexShrink: 0 }}>{item.icon}</span>
              <span>{item.label}</span>
              {item.key === "categories" && <div className="nav-dot" />}
            </button>
          ))}
        </nav>
        <div className="sidebar-footer">
          <button className="logout-btn" onClick={handleLogoutClick}>
            <span style={{ fontSize: "15px" }}>→</span>
            <span>Sign out</span>
          </button>
        </div>
      </aside>

      {/* ── Main ── */}
      <main className="cat-main">

        <div className="page-header">
          <div>
            <div className="page-title">Categories</div>
            <div className="page-sub">Organise your income and expenses into groups</div>
          </div>
          <button className="add-btn" onClick={openAdd}>
            <span style={{ fontSize: "17px", lineHeight: 1 }}>+</span>
            Add category
          </button>
        </div>

        <div className="stats-row">
          <div className="stat-card" style={{ animationDelay: "0.05s" }}>
            <div className="stat-label">Total</div>
            <div className="stat-val c-amber">{categories.length}</div>
          </div>
          <div className="stat-card" style={{ animationDelay: "0.1s" }}>
            <div className="stat-label">Income</div>
            <div className="stat-val c-green">{incomeCount}</div>
          </div>
          <div className="stat-card" style={{ animationDelay: "0.15s" }}>
            <div className="stat-label">Expense</div>
            <div className="stat-val c-red">{expenseCount}</div>
          </div>
        </div>

        <div className="filters">
          {["ALL", "EXPENSE", "INCOME", "ACTIVE", "INACTIVE"].map((f) => (
            <button key={f} className={`filter-pill ${filter === f ? "on" : ""}`} onClick={() => setFilter(f)}>
              {f.charAt(0) + f.slice(1).toLowerCase()}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="spin-wrap"><div className="spin-lg" /></div>
        ) : (
          <div className="cat-grid">
            {filtered.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">⊞</div>
                <h3>No categories found</h3>
                <p>{filter === "ALL" ? "Add your first category to get started" : `No ${filter.toLowerCase()} categories`}</p>
              </div>
            ) : (
              filtered.map((cat, i) => (
                <div
                  key={cat.categoryId}
                  className={`cat-card ${cat.categoryStatus === "INACTIVE" ? "off" : ""}`}
                  style={{ animationDelay: `${i * 0.04}s` }}
                >
                  <div className="card-top">
                    <div className="card-icon">{emoji(cat.categoryName)}</div>
                    <div className="card-actions">
                      <button className="action-btn" onClick={() => openEdit(cat)} title="Edit">✎</button>
                      <button
                        className="action-btn tog"
                        onClick={() => handleToggle(cat)}
                        title={cat.categoryStatus === "ACTIVE" ? "Deactivate" : "Activate"}
                      >
                        {cat.categoryStatus === "ACTIVE" ? "⊘" : "✓"}
                      </button>
                    </div>
                  </div>
                  <div className="card-name">{cat.categoryName}</div>
                  <div className="badges">
                    <span className={`badge ${cat.categoryType === "EXPENSE" ? "b-expense" : "b-income"}`}>
                      {cat.categoryType}
                    </span>
                    <span className={`badge ${cat.categoryStatus === "ACTIVE" ? "b-active" : "b-inactive"}`}>
                      {cat.categoryStatus}
                    </span>
                  </div>
                  <div className="card-date">Created {fmtDate(cat.createdAt)}</div>
                </div>
              ))
            )}
          </div>
        )}
      </main>

      {/* ── Panel ── */}
      {panelOpen && (
        <>
          <div className="overlay" onClick={closePanel} />
          <div className="panel">
            <div className="panel-head">
              <div className="panel-title">{editing ? "Edit category" : "New category"}</div>
              <button className="close-btn" onClick={closePanel}>✕</button>
            </div>

            <div className="panel-body">

              {/* Category name */}
              <div className="field">
                <label className="field-label">Category name</label>
                <input
                  className="field-input"
                  placeholder="e.g. Food & Dining"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                  autoFocus
                />
              </div>

              {/* Type */}
              <div className="field">
                <label className="field-label">Type</label>
                <div className="type-row">
                  <button
                    className={`type-opt ${formType === "EXPENSE" ? "sel-exp" : ""}`}
                    onClick={() => { setFormType("EXPENSE"); setFormBudget(""); setBudgetError(""); }}
                  >
                    Expense
                  </button>
                  <button
                    className={`type-opt ${formType === "INCOME" ? "sel-inc" : ""}`}
                    onClick={() => { setFormType("INCOME"); setFormBudget(""); setBudgetError(""); }}
                  >
                    Income
                  </button>
                </div>
              </div>

              {/* Budget — only for expense */}
              {formType === "EXPENSE" && (
                <div className="field">
                  <label className="field-label">
                    Monthly budget
                    {userIncome > 0 && (
                      <span className="field-label-sub">max {fmt(userIncome)}</span>
                    )}
                  </label>
                  <div className={`amount-wrap ${budgetError ? "err" : ""}`}>
                    <span className="amount-sym">₹</span>
                    <input
                      className="amount-input"
                      type="number"
                      placeholder="0"
                      value={formBudget}
                      onChange={(e) => handleBudgetChange(e.target.value)}
                    />
                    {userIncome > 0 && budgetNum > 0 && (
                      <span style={{ fontSize: "12px", color: budgetPct >= 100 ? "#F87171" : budgetPct >= 80 ? "#F59E0B" : "#4ADE80", flexShrink: 0 }}>
                        {Math.round(budgetPct)}%
                      </span>
                    )}
                  </div>

                  {/* Income usage bar */}
                  {userIncome > 0 && budgetNum > 0 && (
                    <div className="income-bar">
                      <div className="income-bar-fill" style={{ width: `${budgetPct}%`, background: barColor }} />
                    </div>
                  )}

                  {/* Hint / error */}
                  {budgetError ? (
                    <div className="field-hint err">{budgetError}</div>
                  ) : userIncome > 0 && budgetNum > 0 ? (
                    <div className={`field-hint ${budgetPct >= 80 ? "warn" : ""}`}>
                      {fmt(userIncome - budgetNum)} of income remaining
                    </div>
                  ) : userIncome > 0 ? (
                    <div className="field-hint">Your monthly income is {fmt(userIncome)}</div>
                  ) : null}
                </div>
              )}

              {formError && <div className="panel-error">{formError}</div>}

              <button
                className="submit-btn"
                onClick={handleSubmit}
                disabled={formLoading || !!budgetError}
              >
                {formLoading
                  ? <span className="spin-sm" />
                  : editing ? "Save changes" : "Create category"}
              </button>

            </div>
          </div>
        </>
      )}

      {toast && <div className={`toast ${toast.type}`}>{toast.msg}</div>}
    </div>
  );
}
