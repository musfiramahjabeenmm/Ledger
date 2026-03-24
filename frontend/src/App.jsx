import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AuthPage from "./Pages/AuthPage";
import Onboarding from "./Pages/OnBoarding";
import Dashboard from "./Pages/DashBoard";
import Categories from "./Pages/Categories";

function App() {
  const [token, setToken]         = useState(localStorage.getItem("token"));
  const [onboarded, setOnboarded] = useState(null);
  const [checking, setChecking]   = useState(false);

  useEffect(() => {
    if (!token) {
      setOnboarded(null);
      return;
    }
    if (localStorage.getItem("onboarded") === "true") {
      setOnboarded("true");
      return;
    }
    setChecking(true);
    fetch("http://localhost:8080/api/categories", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          localStorage.setItem("onboarded", "true");
          setOnboarded("true");
        } else {
          setOnboarded("false");
        }
      })
      .catch(() => setOnboarded("false"))
      .finally(() => setChecking(false));
  }, [token]);

  const handleAuthSuccess = (data) => {
    localStorage.removeItem("onboarded"); // clear old flag
    localStorage.setItem("token", data.token);
    setOnboarded(null); // force re-check
    setToken(data.token);
  };

  const handleOnboardComplete = () => {
    localStorage.setItem("onboarded", "true");
    setOnboarded("true");
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("onboarded");
    setToken(null);
    setOnboarded(null);
  };

  /* ── Show spinner while checking categories ── */
  if (checking) return (
    <div style={{
      minHeight: "100vh", background: "#0A0A0A",
      display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      <div style={{
        width: "28px", height: "28px",
        border: "2px solid #1A1A1A",
        borderTopColor: "#E8A838",
        borderRadius: "50%",
        animation: "spin 0.8s linear infinite",
      }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  return (
    <BrowserRouter>
      <Routes>

        {/* Auth page */}
        <Route path="/auth" element={
          !token
            ? <AuthPage onAuthSuccess={handleAuthSuccess} />
            : onboarded === "true"
              ? <Navigate to="/dashboard" replace />
              : onboarded === "false"
                ? <Navigate to="/onboarding" replace />
                : null
        }/>

        {/* Onboarding */}
        <Route path="/onboarding" element={
          !token
            ? <Navigate to="/auth" replace />
            : onboarded === "true"
              ? <Navigate to="/dashboard" replace />
              : <Onboarding onComplete={handleOnboardComplete} />
        }/>

        {/* Dashboard */}
        <Route path="/dashboard" element={
          !token
            ? <Navigate to="/auth" replace />
            : onboarded === "false"
              ? <Navigate to="/onboarding" replace />
              : <Dashboard onLogout={handleLogout} />
        }/>

        <Route path="/categories" element={
            !token ? <Navigate to="/auth" replace /> :
            onboarded === "false" ? <Navigate to="/onboarding" replace /> :
            <Categories onLogout={handleLogout} />
          }/>

        {/* Catch all */}
        <Route path="*" element={
          !token
            ? <Navigate to="/auth" replace />
            : onboarded === "true"
              ? <Navigate to="/dashboard" replace />
              : onboarded === "false"
                ? <Navigate to="/onboarding" replace />
                : null
        }/>

          

      </Routes>
    </BrowserRouter>
  );
}

export default App;


