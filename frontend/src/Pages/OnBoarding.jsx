import { useState, useEffect } from "react";

const API_BASE = "http://localhost:8080/api";

/* ─── API helper ─── */
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
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || `Request failed: ${res.status}`);
    return data;
};

/* ─── Get userId from JWT — uses 'sub' field ─── */
const getUserId = () => {
    try {
        const token = localStorage.getItem("token");
        if (!token) return null;
        const payload = JSON.parse(atob(token.split(".")[1]));
        return payload.sub;
    } catch { return null; }
};

/* ─── Inject styles ─── */
function useStyles() {
    useEffect(() => {
        if (document.getElementById("ledger-onboard-styles")) return;
        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = "https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500&family=Outfit:wght@300;400;500;600&display=swap";
        document.head.appendChild(link);

        const s = document.createElement("style");
        s.id = "ledger-onboard-styles";
        s.textContent = `
      *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
      body { background: #0A0A0A; }

      @keyframes fadeUp  { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
      @keyframes fadeIn  { from{opacity:0} to{opacity:1} }
      @keyframes spin    { to{transform:rotate(360deg)} }
      @keyframes pulse   { 0%,100%{box-shadow:0 0 0 0 rgba(232,168,56,0)} 50%{box-shadow:0 0 24px 4px rgba(232,168,56,0.2)} }

      .ob-page {
        min-height: 100vh;
        background: #0A0A0A;
        display: flex;
        align-items: center;
        justify-content: center;
        font-family: 'Outfit', sans-serif;
        padding: 24px;
      }

      .ob-card {
        width: 100%;
        max-width: 620px;
        background: #111;
        border: 1px solid #1E1E1E;
        border-radius: 20px;
        padding: 48px 52px;
        animation: fadeUp 0.5s ease both;
      }

      .ob-progress-track {
        height: 3px;
        background: #1A1A1A;
        border-radius: 99px;
        margin-bottom: 40px;
        overflow: hidden;
      }
      .ob-progress-fill {
        height: 100%;
        background: #E8A838;
        border-radius: 99px;
        transition: width 0.5s ease;
      }

      .ob-steps {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 36px;
      }
      .ob-step-dot {
        width: 8px; height: 8px;
        border-radius: 50%;
        background: #1E1E1E;
        transition: all 0.3s ease;
      }
      .ob-step-dot.active { background: #E8A838; width: 24px; border-radius: 4px; }
      .ob-step-dot.done   { background: #E8A838; opacity: 0.4; }

      .ob-step-label {
        font-size: 11px; font-weight: 500;
        color: #E8A838; letter-spacing: 0.1em;
        text-transform: uppercase;
        margin-bottom: 10px;
      }
      .ob-title {
        font-family: 'Playfair Display', serif;
        font-size: 28px; font-weight: 400;
        color: #F5F0E8; line-height: 1.2;
        margin-bottom: 8px;
        animation: fadeUp 0.4s ease both 0.05s;
      }
      .ob-subtitle {
        font-size: 13.5px; color: #555;
        line-height: 1.7; margin-bottom: 32px;
        animation: fadeUp 0.4s ease both 0.1s;
      }

      .ob-goals {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 12px;
        margin-bottom: 32px;
      }
      .ob-goal-card {
        padding: 18px 16px;
        background: #161616;
        border: 1px solid #1E1E1E;
        border-radius: 12px;
        cursor: pointer;
        transition: all 0.2s ease;
        animation: fadeUp 0.4s ease both;
        text-align: left;
      }
      .ob-goal-card:hover { border-color: #2A2A2A; background: #1A1A1A; }
      .ob-goal-card.selected { border-color: #E8A838; background: rgba(232,168,56,0.06); }
      .ob-goal-icon  { font-size: 22px; margin-bottom: 10px; display: block; }
      .ob-goal-title { font-size: 13.5px; font-weight: 500; color: #C8C0B0; margin-bottom: 4px; }
      .ob-goal-desc  { font-size: 11px; color: #444; line-height: 1.5; }

      .ob-cats {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
        margin-bottom: 32px;
      }
      .ob-cat-chip {
        display: flex;
        align-items: center;
        gap: 7px;
        padding: 10px 16px;
        background: #161616;
        border: 1px solid #1E1E1E;
        border-radius: 99px;
        cursor: pointer;
        font-size: 13px;
        color: #666;
        font-family: 'Outfit', sans-serif;
        transition: all 0.2s ease;
        animation: fadeUp 0.4s ease both;
      }
      .ob-cat-chip:hover { border-color: #2A2A2A; color: #888; }
      .ob-cat-chip.selected { border-color: #E8A838; color: #E8A838; background: rgba(232,168,56,0.06); }
      .ob-cat-dot {
        width: 6px; height: 6px;
        border-radius: 50%;
        background: #333;
        transition: background 0.2s;
        flex-shrink: 0;
      }
      .ob-cat-chip.selected .ob-cat-dot { background: #E8A838; }

      .ob-budget-list {
        display: flex;
        flex-direction: column;
        gap: 12px;
        margin-bottom: 16px;
        max-height: 300px;
        overflow-y: auto;
        padding-right: 4px;
      }
      .ob-budget-list::-webkit-scrollbar { width: 3px; }
      .ob-budget-list::-webkit-scrollbar-thumb { background: #2A2A2A; border-radius: 4px; }

      .ob-budget-row {
        display: flex;
        align-items: center;
        gap: 14px;
        padding: 14px 16px;
        background: #161616;
        border: 1px solid #1E1E1E;
        border-radius: 12px;
        animation: fadeUp 0.4s ease both;
      }
      .ob-budget-emoji { font-size: 18px; flex-shrink: 0; }
      .ob-budget-name  { flex: 1; font-size: 13.5px; color: #C8C0B0; }
      .ob-amount-wrap {
        display: flex;
        align-items: center;
        gap: 6px;
        background: #1A1A1A;
        border: 1px solid #2A2A2A;
        border-radius: 8px;
        padding: 8px 12px;
        transition: border-color 0.2s;
      }
      .ob-amount-wrap:focus-within { border-color: #E8A838; box-shadow: 0 0 0 3px rgba(232,168,56,0.06); }
      .ob-amount-symbol { font-size: 13px; color: #555; }
      .ob-amount-input {
        width: 90px;
        background: transparent;
        border: none;
        outline: none;
        font-family: 'Outfit', sans-serif;
        font-size: 14px;
        color: #F5F0E8;
        text-align: right;
      }
      .ob-amount-input::placeholder { color: #333; }

      .ob-income-wrap { margin-bottom: 32px; animation: fadeUp 0.4s ease both 0.1s; }
      .ob-income-label {
        font-size: 11px; font-weight: 500;
        color: #555; letter-spacing: 0.07em;
        text-transform: uppercase; margin-bottom: 8px;
      }
      .ob-income-box {
        display: flex;
        align-items: center;
        gap: 10px;
        background: #161616;
        border: 1px solid #1E1E1E;
        border-radius: 12px;
        padding: 14px 18px;
        transition: border-color 0.25s;
      }
      .ob-income-box:focus-within { border-color: #E8A838; box-shadow: 0 0 0 3px rgba(232,168,56,0.06); }
      .ob-income-symbol { font-size: 18px; color: #E8A838; font-weight: 500; }
      .ob-income-input {
        flex: 1;
        background: transparent;
        border: none; outline: none;
        font-family: 'Outfit', sans-serif;
        font-size: 20px; color: #F5F0E8; font-weight: 300;
      }
      .ob-income-input::placeholder { color: #2A2A2A; }

      .ob-btn-row { display: flex; gap: 12px; align-items: center; }
      .ob-btn-primary {
        flex: 1; padding: 14px;
        background: #E8A838; color: #0A0A0A;
        border: none; border-radius: 10px;
        font-family: 'Outfit', sans-serif;
        font-size: 14px; font-weight: 600;
        cursor: pointer; letter-spacing: 0.03em;
        transition: opacity 0.2s, transform 0.15s;
        animation: pulse 3.5s ease-in-out infinite;
        display: flex; align-items: center; justify-content: center; gap: 8px;
      }
      .ob-btn-primary:hover:not(:disabled) { opacity: 0.88; transform: translateY(-1px); }
      .ob-btn-primary:disabled { opacity: 0.4; cursor: not-allowed; animation: none; }
      .ob-btn-back {
        padding: 14px 20px;
        background: transparent; color: #444;
        border: 1px solid #1E1E1E; border-radius: 10px;
        font-family: 'Outfit', sans-serif; font-size: 14px;
        cursor: pointer; transition: all 0.2s;
      }
      .ob-btn-back:hover { border-color: #2A2A2A; color: #666; }

      .ob-skip { text-align: center; margin-top: 14px; }
      .ob-skip button {
        background: none; border: none;
        color: #333; font-family: 'Outfit', sans-serif;
        font-size: 12px; cursor: pointer;
        transition: color 0.2s;
      }
      .ob-skip button:hover { color: #555; }

      .ob-error {
        background: rgba(220,38,38,0.08);
        border: 1px solid rgba(220,38,38,0.2);
        border-radius: 8px;
        padding: 10px 14px;
        font-size: 13px; color: #F87171;
        margin-bottom: 16px;
        animation: fadeUp 0.3s ease both;
      }

      .ob-budget-warning {
        padding: 12px 16px;
        border-radius: 10px;
        margin-bottom: 16px;
        font-size: 13px;
        transition: all 0.3s ease;
        animation: fadeUp 0.3s ease both;
      }
      .ob-budget-warning.over {
        background: rgba(220,38,38,0.08);
        border: 1px solid rgba(220,38,38,0.2);
        color: #F87171;
      }
      .ob-budget-warning.safe {
        background: rgba(74,222,128,0.08);
        border: 1px solid rgba(74,222,128,0.2);
        color: #4ADE80;
      }

      .spinner-sm {
        width: 16px; height: 16px;
        border: 2px solid rgba(10,10,10,0.2);
        border-top-color: #0A0A0A;
        border-radius: 50%;
        animation: spin 0.7s linear infinite;
        display: inline-block;
      }

      .ob-success {
        text-align: center;
        padding: 20px 0;
        animation: fadeUp 0.5s ease both;
      }
      .ob-success-ring {
        width: 72px; height: 72px;
        border-radius: 50%;
        background: rgba(74,222,128,0.08);
        border: 1px solid rgba(74,222,128,0.2);
        display: flex; align-items: center; justify-content: center;
        margin: 0 auto 24px;
        font-size: 32px;
      }

      @media (max-width: 580px) {
        .ob-card { padding: 36px 24px; }
        .ob-goals { grid-template-columns: 1fr; }
        .ob-title { font-size: 24px; }
      }
    `;
        document.head.appendChild(s);
    }, []);
}

/* ─── Data ─── */
const PRESET_CATEGORIES = [
    { name: "Food & Dining", emoji: "🍛", type: "EXPENSE" },
    { name: "Transport", emoji: "🚗", type: "EXPENSE" },
    { name: "Shopping", emoji: "🛍️", type: "EXPENSE" },
    { name: "Entertainment", emoji: "🎬", type: "EXPENSE" },
    { name: "Health", emoji: "💊", type: "EXPENSE" },
    { name: "Bills & Utilities", emoji: "⚡", type: "EXPENSE" },
    { name: "Rent", emoji: "🏠", type: "EXPENSE" },
    { name: "Education", emoji: "📚", type: "EXPENSE" },
    { name: "Salary", emoji: "💰", type: "INCOME" },
    { name: "Freelance", emoji: "💻", type: "INCOME" },
    { name: "Investment", emoji: "📈", type: "INCOME" },
    { name: "Other", emoji: "💳", type: "EXPENSE" },
];

const GOALS = [
    { key: "save", icon: "🎯", title: "Save money", desc: "Build savings and cut unnecessary spending" },
    { key: "track", icon: "📊", title: "Track spending", desc: "Know exactly where every rupee goes" },
    { key: "budget", icon: "📋", title: "Manage budgets", desc: "Set limits and stay within them" },
    { key: "all", icon: "✨", title: "All of these", desc: "Complete financial control" },
];

/* ══════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════ */
export default function Onboarding({ onComplete }) {
    useStyles();

    const [step, setStep] = useState(1);
    const [goal, setGoal] = useState(null);
    const [income, setIncome] = useState("");
    const [selectedCats, setSelectedCats] = useState([]);
    const [amounts, setAmounts] = useState({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [done, setDone] = useState(false);

    const progress = `${((step - 1) / 4) * 100}%`;
    const toggleCat = (name) =>
        setSelectedCats((p) => p.includes(name) ? p.filter((c) => c !== name) : [...p, name]);

    const expenseCats = selectedCats.filter(
        (n) => PRESET_CATEGORIES.find((c) => c.name === n)?.type === "EXPENSE"
    );

    /* ── Live budget total ── */
    const totalBudget = expenseCats.reduce((s, n) => s + (Number(amounts[n]) || 0), 0);
    const remaining = income && Number(income) > 0 ? Number(income) - totalBudget : null;
    const isOver = remaining !== null && remaining < 0;

    /* ── Final submit ── */
    const handleFinish = async () => {
        setError(""); setLoading(true);
        try {
            /* ── Validate total budget doesn't exceed income ── */
            if (income && Number(income) > 0) {
                if (totalBudget > Number(income)) {
                    setError(
                        `Total budget ₹${totalBudget.toLocaleString("en-IN")} exceeds your monthly income ₹${Number(income).toLocaleString("en-IN")}. Please reduce your budgets.`
                    );
                    setLoading(false);
                    return;
                }
            }

            const userId = getUserId();

            if (!userId) throw new Error("Session expired. Please log in again.");

            const now = new Date();
            const startDate = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0).toISOString().slice(0, 19);
            const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59).toISOString().slice(0, 19);

            /* Step 1 — create categories one by one */
            const createdCats = [];
            for (const name of selectedCats) {
                const preset = PRESET_CATEGORIES.find((c) => c.name === name);
                const cat = await api("/categories", "POST", {
                    categoryName: name,
                    categoryType: preset?.type || "EXPENSE",
                });
                createdCats.push(cat);
            }

            /* Step 2 — create budgets for expense categories with amount > 0 */
            for (const cat of createdCats) {
                const preset = PRESET_CATEGORIES.find((c) => c.name === cat.categoryName);
                const amt = amounts[cat.categoryName];
                if (preset?.type === "EXPENSE" && amt && Number(amt) > 0) {
                    await api("/budgets", "POST", {
                        userId,
                        amount: Number(amt),
                        startDate,
                        endDate,
                        categoryId: cat.categoryId,
                        description: `${cat.categoryName} budget`,
                    });
                }
            }

            setDone(true);
            setTimeout(() => { if (onComplete) onComplete(); }, 2200);
        } catch (e) {
            console.error("Onboarding error:", e);

            setError(
                e.message?.includes("exceed")
                    ? "Your total budget exceeds your income. Reduce it."
                    : e.message || "Something went wrong"
            );
        }
        finally {
            setLoading(false);
        }
    };

    /* ── Success screen ── */
    if (done) {
        return (
            <div className="ob-page">
                <div className="ob-card">
                    <div className="ob-success">
                        <div className="ob-success-ring">✓</div>
                        <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "26px", fontWeight: 400, color: "#F5F0E8", marginBottom: "12px" }}>
                            You're all set!
                        </h2>
                        <p style={{ fontSize: "14px", color: "#555", lineHeight: 1.8 }}>
                            Your categories and budgets have been created.<br />
                            Taking you to your dashboard...
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="ob-page">
            <div className="ob-card">

                {/* Progress bar */}
                <div className="ob-progress-track">
                    <div className="ob-progress-fill" style={{ width: progress }} />
                </div>

                {/* Step dots */}
                <div className="ob-steps">
                    {[1, 2, 3, 4].map((s) => (
                        <div key={s} className={`ob-step-dot ${s === step ? "active" : s < step ? "done" : ""}`} />
                    ))}
                </div>

                {/* ══ STEP 1 — Goal ══ */}
                {step === 1 && (
                    <>
                        <div className="ob-step-label">Step 1 of 4</div>
                        <h1 className="ob-title">What's your main goal?</h1>
                        <p className="ob-subtitle">This helps us personalise your experience.</p>
                        <div className="ob-goals">
                            {GOALS.map((g, i) => (
                                <div
                                    key={g.key}
                                    className={`ob-goal-card ${goal === g.key ? "selected" : ""}`}
                                    style={{ animationDelay: `${i * 0.08}s` }}
                                    onClick={() => setGoal(g.key)}
                                >
                                    <span className="ob-goal-icon">{g.icon}</span>
                                    <div className="ob-goal-title">{g.title}</div>
                                    <div className="ob-goal-desc">{g.desc}</div>
                                </div>
                            ))}
                        </div>
                        <div className="ob-btn-row">
                            <button className="ob-btn-primary" disabled={!goal} onClick={() => setStep(2)}>
                                Continue →
                            </button>
                        </div>
                    </>
                )}

                {/* ══ STEP 2 — Income ══ */}
                {step === 2 && (
                    <>
                        <div className="ob-step-label">Step 2 of 4</div>
                        <h1 className="ob-title">What's your monthly income?</h1>
                        <p className="ob-subtitle">We'll use this to suggest healthy spending limits. You can change this anytime.</p>
                        <div className="ob-income-wrap">
                            <div className="ob-income-label">Monthly income</div>
                            <div className="ob-income-box">
                                <span className="ob-income-symbol">₹</span>
                                <input
                                    className="ob-income-input"
                                    type="number"
                                    placeholder="00,000"
                                    value={income}
                                    onChange={(e) => setIncome(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="ob-btn-row">
                            <button className="ob-btn-back" onClick={() => setStep(1)}>← Back</button>
                            <button className="ob-btn-primary" onClick={() => setStep(3)}>Continue →</button>
                        </div>
                        <div className="ob-skip"><button onClick={() => setStep(3)}>Skip for now</button></div>
                    </>
                )}

                {/* ══ STEP 3 — Categories ══ */}
                {step === 3 && (
                    <>
                        <div className="ob-step-label">Step 3 of 4</div>
                        <h1 className="ob-title">Pick your spending categories</h1>
                        <p className="ob-subtitle">Select all that apply. You can add more later.</p>
                        <div className="ob-cats">
                            {PRESET_CATEGORIES.map((cat, i) => (
                                <button
                                    key={cat.name}
                                    className={`ob-cat-chip ${selectedCats.includes(cat.name) ? "selected" : ""}`}
                                    style={{ animationDelay: `${i * 0.04}s` }}
                                    onClick={() => toggleCat(cat.name)}
                                >
                                    <div className="ob-cat-dot" />
                                    {cat.emoji} {cat.name}
                                </button>
                            ))}
                        </div>
                        {error && <div className="ob-error">{error}</div>}
                        <div className="ob-btn-row">
                            <button className="ob-btn-back" onClick={() => setStep(2)}>← Back</button>
                            <button
                                className="ob-btn-primary"
                                disabled={selectedCats.length === 0}
                                onClick={() => { setError(""); setStep(4); }}
                            >
                                Continue →
                            </button>
                        </div>
                    </>
                )}

                {/* ══ STEP 4 — Budgets ══ */}
                {step === 4 && (
                    <>
                        <div className="ob-step-label">Step 4 of 4</div>
                        <h1 className="ob-title">Set your monthly budgets</h1>
                        <p className="ob-subtitle">
                            Enter how much you want to spend per category this month.
                            {expenseCats.length === 0 && " No expense categories selected — you can skip this step."}
                        </p>

                        {expenseCats.length > 0 && (
                            <div className="ob-budget-list">
                                {expenseCats.map((name, i) => {
                                    const cat = PRESET_CATEGORIES.find((c) => c.name === name);
                                    return (
                                        <div key={name} className="ob-budget-row" style={{ animationDelay: `${i * 0.06}s` }}>
                                            <span className="ob-budget-emoji">{cat?.emoji}</span>
                                            <span className="ob-budget-name">{name}</span>
                                            <div className="ob-amount-wrap">
                                                <span className="ob-amount-symbol">₹</span>
                                                <input
                                                    className="ob-amount-input"
                                                    type="number"
                                                    placeholder="0"
                                                    value={amounts[name] || ""}
                                                    onChange={(e) => setAmounts((p) => ({ ...p, [name]: e.target.value }))}
                                                />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {/* ── Live budget vs income warning ── */}
                        {remaining !== null && totalBudget > 0 && (
                            <div className={`ob-budget-warning ${isOver ? "over" : "safe"}`}>
                                {isOver
                                    ? `⚠ Total budget ₹${totalBudget.toLocaleString("en-IN")} exceeds income by ₹${Math.abs(remaining).toLocaleString("en-IN")} — please reduce`
                                    : `✓ ₹${remaining.toLocaleString("en-IN")} of your income is still unbudgeted`}
                            </div>
                        )}

                        {error && <div className="ob-error">{error}</div>}

                        <div className="ob-btn-row">
                            <button className="ob-btn-back" onClick={() => setStep(3)}>← Back</button>
                            <button
                                className="ob-btn-primary"
                                disabled={loading || isOver}
                                onClick={handleFinish}
                            >
                                {loading ? <span className="spinner-sm" /> : "Finish setup →"}
                            </button>
                        </div>
                        <div className="ob-skip">
                            <button onClick={() => { setAmounts({}); handleFinish(); }}>
                                Skip budgets, go to dashboard
                            </button>
                        </div>
                    </>
                )}

            </div>
        </div>
    );
}
