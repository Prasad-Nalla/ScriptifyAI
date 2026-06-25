/* ══════════════════════════════════════════════════
   AuthPanel.jsx — Login / Register Slide-in Panel
   Scriptify AI by Prasad Nalla
   ══════════════════════════════════════════════════ */

import { useState, useRef } from "react";

export default function AuthPanel({ isOpen, onClose, theme, onLogin }) {

  const [mode,            setMode]            = useState("login");
  const [fullName,        setFullName]        = useState("");
  const [email,           setEmail]           = useState("");
  const [password,        setPassword]        = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [photoPreview,    setPhotoPreview]    = useState(null);
  const [photoFile,       setPhotoFile]       = useState(null);
  const [showPassword,    setShowPassword]    = useState(false);
  const [loading,         setLoading]         = useState(false);
  const [error,           setError]           = useState("");
  const [success,         setSuccess]         = useState("");
  const photoRef = useRef(null);

  const clearForm = () => {
    setFullName(""); setEmail(""); setPassword("");
    setConfirmPassword(""); setPhotoPreview(null); setPhotoFile(null);
    setError(""); setSuccess("");
  };

  const switchMode = (m) => { setMode(m); clearForm(); };

  const handlePhoto = (e) => {
    const f = e.target.files[0];
    if (f) {
      setPhotoPreview(URL.createObjectURL(f));
      setPhotoFile(f);
    }
  };

  const handleSubmit = async () => {
    setError(""); setSuccess("");

    if (!email || !password) return setError("Email and password are required.");
    if (mode === "register") {
      if (!fullName)                    return setError("Full name is required.");
      if (password.length < 6)          return setError("Password must be at least 6 characters.");
      if (password !== confirmPassword) return setError("Passwords do not match.");
    }

    setLoading(true);

    try {
      const endpoint = mode === "register"
        ? "http://localhost:5000/api/auth/register"
        : "http://localhost:5000/api/auth/login";

      const body = mode === "register"
        ? { fullName, email, password }
        : { email, password };

      const res  = await fetch(endpoint, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(body),
      });

      const data = await res.json();
      setLoading(false);

      if (!res.ok) return setError(data.message || "Something went wrong.");

      const userData = {
        fullName: data.fullName,
        email: data.email,
        avatar: data.avatar || "",
      };

      if (mode === "login" && !userData.avatar) {
        try {
          const profileRes = await fetch("http://localhost:5000/api/auth/profile", {
            headers: { Authorization: `Bearer ${data.token}` },
          });
          if (profileRes.ok) {
            const profileData = await profileRes.json();
            if (profileData.avatar) {
              userData.avatar = profileData.avatar;
            }
          }
        } catch (profileErr) {
          // ignore and continue
        }
      }

      if (mode === "register" && photoFile) {
        try {
          const pf = new FormData();
          pf.append("avatar", photoFile);
          const avatarRes = await fetch("http://localhost:5000/api/user/avatar", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${data.token}`,
            },
            body: pf,
          });
          if (avatarRes.ok) {
            const avatarData = await avatarRes.json();
            userData.avatar = avatarData.avatar;
            setPhotoPreview(avatarData.avatar);
          }
        } catch (uploadErr) {
          // fallback, continue without avatar.
        }
      }

      localStorage.setItem("scriptify_token", data.token);
      localStorage.setItem("scriptify_user", JSON.stringify(userData));

      setSuccess(data.message);
      onLogin({
        fullName: userData.fullName,
        email: userData.email,
        photoPreview: userData.avatar || photoPreview,
      });
      setTimeout(() => { onClose(); clearForm(); }, 1200);

    } catch (err) {
      setLoading(false);
      setError("Cannot connect to server. Make sure backend is running on port 5000.");
    }
  };

  return (
    <>
      <div
        className={`auth-overlay ${isOpen ? "auth-overlay-open" : ""}`}
        onClick={onClose}
      />

      <div className={`auth-panel ${isOpen ? "auth-panel-open" : ""} ${theme}`}>

        <button className="auth-close" onClick={onClose}>✕</button>

        <div className="auth-logo">
          <div className="auth-logo-icon">✍️</div>
          <div>
            <div className="auth-logo-name">Scriptify <span className="shimmer-text">AI</span></div>
            <div className="auth-logo-by">by Prasad Nalla</div>
          </div>
        </div>

        <div className="auth-tabs">
          <button className={`auth-tab ${mode === "login" ? "active" : ""}`} onClick={() => switchMode("login")}>Login</button>
          <button className={`auth-tab ${mode === "register" ? "active" : ""}`} onClick={() => switchMode("register")}>Register</button>
        </div>

        <div className="auth-heading">
          {mode === "login" ? "Welcome back 👋" : "Create account ✨"}
        </div>
        <div className="auth-subheading">
          {mode === "login"
            ? "Sign in to save your handwriting documents"
            : "Join Scriptify AI and start converting text to handwriting"}
        </div>

        {mode === "register" && (
          <div className="auth-photo-row">
            <div className="auth-photo-circle" onClick={() => photoRef.current?.click()}>
              {photoPreview
                ? <img src={photoPreview} alt="preview" className="auth-photo-img" />
                : <span className="auth-photo-placeholder">📷</span>
              }
              <div className="auth-photo-overlay">Change</div>
            </div>
            <div className="auth-photo-info">
              <div className="auth-photo-label">Handwriting Sample</div>
              <div className="auth-photo-hint">Upload your A–Z, a–z, 0–9 handwriting sample • JPG, PNG</div>
            </div>
            <input ref={photoRef} type="file" accept="image/*" style={{display:"none"}} onChange={handlePhoto} />
          </div>
        )}

        {mode === "register" && (
          <div className="auth-field">
            <label className="auth-label">Full Name</label>
            <div className="auth-input-wrap">
              <span className="auth-input-icon">👤</span>
              <input className="auth-input" type="text" placeholder="Prasad Nalla" value={fullName} onChange={e => setFullName(e.target.value)} />
            </div>
          </div>
        )}

        <div className="auth-field">
          <label className="auth-label">Email</label>
          <div className="auth-input-wrap">
            <span className="auth-input-icon">📧</span>
            <input className="auth-input" type="email" placeholder="prasad@gmail.com" value={email} onChange={e => setEmail(e.target.value)} />
          </div>
        </div>

        <div className="auth-field">
          <label className="auth-label">Password</label>
          <div className="auth-input-wrap">
            <span className="auth-input-icon">🔒</span>
            <input className="auth-input" type={showPassword ? "text" : "password"} placeholder="Min 6 characters" value={password} onChange={e => setPassword(e.target.value)} />
            <button className="auth-eye" onClick={() => setShowPassword(p => !p)} type="button">
              {showPassword ? "🙈" : "👁️"}
            </button>
          </div>
        </div>

        {mode === "register" && (
          <div className="auth-field">
            <label className="auth-label">Confirm Password</label>
            <div className="auth-input-wrap">
              <span className="auth-input-icon">🔐</span>
              <input className="auth-input" type={showPassword ? "text" : "password"} placeholder="Repeat password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />
            </div>
          </div>
        )}

        {mode === "login" && (
          <div className="auth-forgot">
            <button className="auth-forgot-btn">Forgot password?</button>
          </div>
        )}

        {error   && <div className="auth-error">❌ {error}</div>}
        {success && <div className="auth-success">✅ {success}</div>}

        <button className="glow-btn glow-btn-full auth-submit" onClick={handleSubmit} disabled={loading}>
          {loading
            ? <span className="auth-loading">⟳ {mode === "login" ? "Signing in..." : "Creating account..."}</span>
            : mode === "login" ? "Sign In →" : "Create Account →"
          }
        </button>

        <div className="auth-divider"><span>or continue with</span></div>

        <button className="auth-google-btn">
          <img src="https://www.google.com/favicon.ico" alt="Google" width={16} height={16} />
          Continue with Google
        </button>

        <div className="auth-switch">
          {mode === "login"
            ? <>Don't have an account?{" "}<button className="auth-switch-btn" onClick={() => switchMode("register")}>Register here</button></>
            : <>Already have an account?{" "}<button className="auth-switch-btn" onClick={() => switchMode("login")}>Sign in</button></>
          }
        </div>

      </div>
    </>
  );
}