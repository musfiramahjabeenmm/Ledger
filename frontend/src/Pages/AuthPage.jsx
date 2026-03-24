import { useState, useEffect, useCallback } from "react";

const GOOGLE_CLIENT_ID = "268994410626-ib2d087j6ficqikdm9n79uul429hqh3c.apps.googleusercontent.com";
const API_BASE = "http://localhost:8080/api";

/* ─── Inject fonts + keyframes into <head> once ─── */
function useGlobalStyles() {
  useEffect(() => {
    if (document.getElementById("ledger-auth-styles")) return;

    const link = document.createElement("link");
    link.id = "ledger-font-link";
    link.rel = "stylesheet";
    link.href =
      "https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500&family=Outfit:wght@300;400;500;600&display=swap";
    document.head.appendChild(link);

    const style = document.createElement("style");
    style.id = "ledger-auth-styles";
    style.textContent = `
      *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

      @keyframes fadeUp {
        from { opacity: 0; transform: translateY(20px); }
        to   { opacity: 1; transform: translateY(0); }
      }
      @keyframes fadeIn {
        from { opacity: 0; } to { opacity: 1; }
      }
      @keyframes pulseGlow {
        0%, 100% { box-shadow: 0 0 0 0 rgba(232,168,56,0.0); }
        50%       { box-shadow: 0 0 28px 6px rgba(232,168,56,0.2); }
      }
      @keyframes spin {
        to { transform: rotate(360deg); }
      }
      @keyframes slideIn {
        from { opacity: 0; transform: translateX(10px); }
        to   { opacity: 1; transform: translateX(0); }
      }

      .ledger-page {
        min-height: 100vh;
        background: #0F0F0F;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 24px;
        font-family: 'Outfit', sans-serif;
      }

      .ledger-card {
        display: flex;
        width: 100%;
        max-width: 980px;
        min-height: 600px;
        border-radius: 20px;
        overflow: hidden;
        border: 1px solid #1E1E1E;
        animation: fadeIn 0.5s ease both;
      }

      .ledger-left {
        width: 42%;
        background: #141414;
        padding: 52px 44px;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        border-right: 1px solid #1E1E1E;
      }

      .ledger-right {
        flex: 1;
        background: #0F0F0F;
        padding: 52px 48px;
        display: flex;
        flex-direction: column;
        justify-content: center;
        overflow-y: auto;
      }

      .auth-panel {
        display: flex;
        flex-direction: column;
        gap: 14px;
        animation: slideIn 0.35s ease both;
      }

      .auth-field {
        display: flex;
        flex-direction: column;
        gap: 7px;
      }

      .auth-label {
        font-size: 11px;
        font-weight: 500;
        color: #666;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        font-family: 'Outfit', sans-serif;
      }

      .auth-input {
        width: 100%;
        padding: 13px 16px;
        background: #1A1A1A;
        border: 1px solid #2A2A2A;
        border-radius: 10px;
        color: #F5F0E8;
        font-family: 'Outfit', sans-serif;
        font-size: 14px;
        outline: none;
        transition: border-color 0.25s, background 0.25s, box-shadow 0.25s;
      }
      .auth-input::placeholder { color: #444; }
      .auth-input:focus {
        border-color: #E8A838;
        background: #1F1E1B;
        box-shadow: 0 0 0 3px rgba(232,168,56,0.08);
      }

      .auth-btn-primary {
        width: 100%;
        padding: 14px;
        background: #E8A838;
        color: #0F0F0F;
        border: none;
        border-radius: 10px;
        font-family: 'Outfit', sans-serif;
        font-size: 14px;
        font-weight: 600;
        cursor: pointer;
        letter-spacing: 0.03em;
        transition: opacity 0.2s, transform 0.15s;
        animation: pulseGlow 3.5s ease-in-out infinite;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
      }
      .auth-btn-primary:hover:not(:disabled) { opacity: 0.88; transform: translateY(-1px); }
      .auth-btn-primary:active:not(:disabled) { transform: translateY(0); }
      .auth-btn-primary:disabled { opacity: 0.4; cursor: not-allowed; animation: none; }

      .auth-btn-google {
        width: 100%;
        padding: 13px;
        background: #1A1A1A;
        color: #F5F0E8;
        border: 1px solid #2A2A2A;
        border-radius: 10px;
        font-family: 'Outfit', sans-serif;
        font-size: 14px;
        font-weight: 500;
        cursor: pointer;
        transition: background 0.2s, border-color 0.2s, transform 0.15s;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 10px;
      }
      .auth-btn-google:hover:not(:disabled) {
        background: #222;
        border-color: #3A3A3A;
        transform: translateY(-1px);
      }
      .auth-btn-google:active:not(:disabled) { transform: translateY(0); }
      .auth-btn-google:disabled { opacity: 0.4; cursor: not-allowed; }

      .tab-row {
        display: flex;
        background: #161616;
        border-radius: 10px;
        padding: 4px;
        margin-bottom: 32px;
        border: 1px solid #1E1E1E;
        animation: fadeUp 0.4s ease both;
      }

      .tab-btn {
        flex: 1;
        padding: 9px 0;
        background: transparent;
        border: none;
        border-radius: 8px;
        font-family: 'Outfit', sans-serif;
        font-size: 13px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.25s ease;
        letter-spacing: 0.02em;
      }
      .tab-btn.active   { background: #E8A838; color: #0F0F0F; }
      .tab-btn.inactive { color: #555; }
      .tab-btn.inactive:hover { color: #888; }

      .divider-row {
        display: flex;
        align-items: center;
        gap: 12px;
        margin: 2px 0;
      }
      .divider-line { flex: 1; height: 1px; background: #1E1E1E; }
      .divider-text { font-size: 11px; color: #444; letter-spacing: 0.05em; }

      .alert-box {
        border-radius: 9px;
        padding: 11px 14px;
        font-size: 13px;
        margin-bottom: 16px;
        animation: fadeUp 0.3s ease both;
        line-height: 1.5;
      }
      .alert-error   { background: rgba(220,38,38,0.08);  border: 1px solid rgba(220,38,38,0.2);  color: #F87171; }
      .alert-success { background: rgba(34,197,94,0.08);  border: 1px solid rgba(34,197,94,0.2);  color: #4ADE80; }

      .spinner {
        width: 16px; height: 16px;
        border: 2px solid rgba(15,15,15,0.25);
        border-top-color: #0F0F0F;
        border-radius: 50%;
        animation: spin 0.7s linear infinite;
        display: inline-block;
        flex-shrink: 0;
      }
      .spinner-light {
        width: 16px; height: 16px;
        border: 2px solid rgba(245,240,232,0.15);
        border-top-color: #F5F0E8;
        border-radius: 50%;
        animation: spin 0.7s linear infinite;
        display: inline-block;
        flex-shrink: 0;
      }

      .switch-text {
        text-align: center;
        font-size: 13px;
        color: #444;
        margin-top: 4px;
      }
      .switch-link {
        background: none;
        border: none;
        color: #E8A838;
        font-family: 'Outfit', sans-serif;
        font-size: 13px;
        font-weight: 500;
        cursor: pointer;
        padding: 0;
      }
      .switch-link:hover { text-decoration: underline; }

      .left-feature {
        display: flex;
        align-items: center;
        gap: 12px;
      }
      .feature-dot-wrap {
        width: 22px; height: 22px;
        border-radius: 50%;
        background: rgba(232,168,56,0.1);
        border: 1px solid rgba(232,168,56,0.22);
        display: flex; align-items: center; justify-content: center;
        flex-shrink: 0;
      }
      .feature-dot { width: 6px; height: 6px; border-radius: 50%; background: #E8A838; }

      .inline-row { display: flex; gap: 12px; }
      .inline-row .auth-field { flex: 1; }

      @media (max-width: 680px) {
        .ledger-left { display: none; }
        .ledger-card { max-width: 440px; }
        .ledger-right { padding: 40px 28px; }
        .inline-row { flex-direction: column; }
      }
    `;
    document.head.appendChild(style);
  }, []);
}

/* ─── Google SVG icon ─── */
const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
    <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
    <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
    <path d="M3.964 10.707A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.039l3.007-2.332z" fill="#FBBC05"/>
    <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.961L3.964 6.293C4.672 4.166 6.656 3.58 9 3.58z" fill="#EA4335"/>
  </svg>
);

/* ─── Reusable input field ─── */
function Field({ label, name, type = "text", placeholder, value, onChange }) {
  return (
    <div className="auth-field">
      <label className="auth-label">{label}</label>
      <input
        className="auth-input"
        type={type}
        name={name}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        autoComplete={type === "password" ? "new-password" : "off"}
      />
    </div>
  );
}

/* ══════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════ */
export default function AuthPage({ onAuthSuccess }) {
  useGlobalStyles();

  const [tab, setTab]           = useState("login");
  const [loading, setLoading]   = useState(false);
  const [gLoading, setGLoading] = useState(false);
  const [error, setError]       = useState("");
  const [success, setSuccess]   = useState("");

  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [regForm, setRegForm]     = useState({
    name: "", email: "", phone: "", password: "", confirmPassword: "",
  });

  const updateLogin = (e) => setLoginForm((p) => ({ ...p, [e.target.name]: e.target.value }));
  const updateReg   = (e) => setRegForm((p)   => ({ ...p, [e.target.name]: e.target.value }));
  const switchTab   = (t) => { setTab(t); setError(""); setSuccess(""); };

  /* ── Load Google Identity script ── */
  useEffect(() => {
    if (document.getElementById("google-gsi-script")) return;
    const script = document.createElement("script");
    script.id    = "google-gsi-script";
    script.src   = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);
  }, []);

  /* ── Google callback ── */
  const handleGoogleResponse = useCallback(async (response) => {
    setError(""); setGLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/google`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: response.credential }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Google sign-in failed.");
      localStorage.setItem("token", data.token);
      if (onAuthSuccess) onAuthSuccess(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setGLoading(false);
    }
  }, [onAuthSuccess]);

  /* ── Trigger Google popup ── */
  const triggerGoogle = () => {
    if (!window.google) return setError("Google Sign-In is loading. Please try again.");
    window.google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: handleGoogleResponse,
    });
    window.google.accounts.id.prompt();
  };

  /* ── Login ── */
  const handleLogin = async (e) => {
    e.preventDefault();
    if (!loginForm.email || !loginForm.password) return setError("Please fill in all fields.");
    setError(""); setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(loginForm),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Invalid email or password.");
      localStorage.setItem("token", data.token);
      if (onAuthSuccess) onAuthSuccess(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  /* ── Register ── */
   const handleRegister = async (e) => {
    e.preventDefault();
    const { name, email, phone, password, confirmPassword } = regForm;
    if (!name || !email || !phone || !password || !confirmPassword) return setError("Please fill in all fields.");
    
    // ── Phone validation ──
    const phoneRegex = /^[6-9][0-9]{9}$/;
    if (!phoneRegex.test(phone)) return setError("Enter a valid 10-digit Indian mobile number (e.g. 9876543210).");
    
    if (password !== confirmPassword) return setError("Passwords do not match.");
    if (password.length < 6) return setError("Password must be at least 6 characters.");
    setError(""); setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phone, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Registration failed.");
      setSuccess("Account created! Redirecting to sign in...");
      setRegForm({ name: "", email: "", phone: "", password: "", confirmPassword: "" });
      setTimeout(() => switchTab("login"), 1800);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const features = [
    "Track every rupee effortlessly",
    "Smart budget alerts before you overspend",
    "Double-entry ledger for full accuracy",
    "Beautiful insights, zero complexity",
  ];

  return (
    <div className="ledger-page">
      <div className="ledger-card">

        {/* ══ LEFT PANEL ══ */}
        <div className="ledger-left">
          <div style={{ animation: "fadeUp 0.4s ease both" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "52px" }}>
              <div style={{
                width: "34px", height: "34px", borderRadius: "9px",
                background: "#E8A838",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M8 2L13 5V11L8 14L3 11V5L8 2Z" fill="#0F0F0F"/>
                </svg>
              </div>
              <span style={{ fontSize: "13px", fontWeight: 600, color: "#F5F0E8", letterSpacing: "0.07em" }}>
                LEDGER
              </span>
            </div>

            <h1 style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: "36px", fontWeight: 400,
              color: "#F5F0E8", lineHeight: 1.2, marginBottom: "14px",
            }}>
              Your money,<br />
              <span style={{ color: "#E8A838" }}>finally clear.</span>
            </h1>
            <p style={{ fontSize: "13.5px", color: "#555", lineHeight: 1.8, maxWidth: "260px" }}>
              A smart expense tracker built for real financial clarity — not just numbers on a screen.
            </p>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
            {features.map((f, i) => (
              <div key={i} className="left-feature" style={{ animation: `fadeUp 0.5s ease ${0.15 + i * 0.1}s both` }}>
                <div className="feature-dot-wrap"><div className="feature-dot" /></div>
                <span style={{ fontSize: "13px", color: "#666", lineHeight: 1.5 }}>{f}</span>
              </div>
            ))}
          </div>

          <div style={{ fontSize: "11px", color: "#2A2A2A", animation: "fadeIn 1s ease both 0.8s" }}>
            Secured with JWT · Spring Boot · MySQL
          </div>
        </div>

        {/* ══ RIGHT PANEL ══ */}
        <div className="ledger-right">

          <div className="tab-row">
            <button className={`tab-btn ${tab === "login" ? "active" : "inactive"}`} onClick={() => switchTab("login")}>Sign in</button>
            <button className={`tab-btn ${tab === "register" ? "active" : "inactive"}`} onClick={() => switchTab("register")}>Create account</button>
          </div>

          <div style={{ marginBottom: "24px", animation: "fadeUp 0.4s ease both 0.05s" }}>
            <h2 style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: "24px", fontWeight: 400,
              color: "#F5F0E8", marginBottom: "6px",
            }}>
              {tab === "login" ? "Welcome back" : "Start tracking"}
            </h2>
            <p style={{ fontSize: "13px", color: "#444" }}>
              {tab === "login" ? "Sign in to your Ledger account" : "Create your free account in seconds"}
            </p>
          </div>

          {error   && <div className="alert-box alert-error">{error}</div>}
          {success && <div className="alert-box alert-success">{success}</div>}

          <div style={{ marginBottom: "16px", animation: "fadeUp 0.4s ease both 0.1s" }}>
            <button className="auth-btn-google" onClick={triggerGoogle} disabled={gLoading || loading}>
              {gLoading ? <span className="spinner-light" /> : <GoogleIcon />}
              <span>{tab === "login" ? "Sign in with Google" : "Sign up with Google"}</span>
            </button>
          </div>

          <div className="divider-row" style={{ marginBottom: "16px", animation: "fadeUp 0.4s ease both 0.12s" }}>
            <div className="divider-line" />
            <span className="divider-text">OR</span>
            <div className="divider-line" />
          </div>

          {tab === "login" && (
            <form className="auth-panel" onSubmit={handleLogin}>
              <Field label="Email address" name="email" type="email" placeholder="you@example.com" value={loginForm.email} onChange={updateLogin} />
              <Field label="Password" name="password" type="password" placeholder="••••••••" value={loginForm.password} onChange={updateLogin} />
              <div style={{ marginTop: "6px" }}>
                <button className="auth-btn-primary" type="submit" disabled={loading || gLoading}>
                  {loading ? <span className="spinner" /> : "Sign in to Ledger"}
                </button>
              </div>
              <p className="switch-text">
                No account?{" "}
                <button type="button" className="switch-link" onClick={() => switchTab("register")}>Create one free</button>
              </p>
            </form>
          )}

          {tab === "register" && (
            <form className="auth-panel" onSubmit={handleRegister}>
              <Field label="Full name" name="name" placeholder="Arjun Kumar" value={regForm.name} onChange={updateReg} />
              <div className="inline-row">
                <Field label="Email" name="email" type="email" placeholder="you@example.com" value={regForm.email} onChange={updateReg} />
                <Field label="Phone" name="phone" type="tel" placeholder="+91 98765 43210" value={regForm.phone} onChange={updateReg} />
              </div>
              <div className="inline-row">
                <Field label="Password" name="password" type="password" placeholder="Min. 6 chars" value={regForm.password} onChange={updateReg} />
                <Field label="Confirm password" name="confirmPassword" type="password" placeholder="Repeat password" value={regForm.confirmPassword} onChange={updateReg} />
              </div>
              <div style={{ marginTop: "6px" }}>
                <button className="auth-btn-primary" type="submit" disabled={loading || gLoading}>
                  {loading ? <span className="spinner" /> : "Create my account"}
                </button>
              </div>
              <p className="switch-text">
                Already have an account?{" "}
                <button type="button" className="switch-link" onClick={() => switchTab("login")}>Sign in</button>
              </p>
            </form>
          )}

        </div>
      </div>
    </div>
  );
}
