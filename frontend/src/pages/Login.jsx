import { useState } from "react";
import { login, register } from "../services/auth";

export default function LoginPage({ onAuth }) {
  const [mode,    setMode]    = useState("login");
  const [form,    setForm]    = useState({ username: "", password: "", email: "" });
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);
  const [success, setSuccess] = useState(null);

  const handle = async () => {
    if (!form.username || !form.password) { setError("Please fill all required fields."); return; }
    setLoading(true); setError(null); setSuccess(null);
    try {
      if (mode === "login") {
        await login(form.username, form.password);
        onAuth();
      } else {
        await register(form.username, form.password, form.email);
        setSuccess("Account created! Sign in now.");
        setMode("login");
        setForm({ username: form.username, password: "", email: "" });
      }
    } catch (e) {
      setError(
        e.response?.data?.error ||
        e.response?.data?.detail ||
        e.response?.data?.username?.[0] ||
        "Something went wrong. Try again."
      );
    } finally { setLoading(false); }
  };

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      background: "#050810",
      fontFamily: "Outfit, sans-serif",
      overflow: "hidden",
      position: "relative",
    }}>
      {/* Animated orbs */}
      <div style={{ position:"fixed", top:-200, left:-100, width:600, height:600, borderRadius:"50%", background:"radial-gradient(circle, rgba(139,92,246,0.2) 0%, transparent 70%)", filter:"blur(80px)", animation:"orbFloat 25s ease-in-out infinite", pointerEvents:"none" }} />
      <div style={{ position:"fixed", bottom:-150, right:-100, width:500, height:500, borderRadius:"50%", background:"radial-gradient(circle, rgba(34,211,238,0.12) 0%, transparent 70%)", filter:"blur(80px)", animation:"orbFloat 30s ease-in-out infinite reverse", pointerEvents:"none" }} />

      {/* Grid */}
      <div style={{ position:"fixed", inset:0, backgroundImage:"linear-gradient(rgba(139,92,246,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(139,92,246,0.04) 1px, transparent 1px)", backgroundSize:"64px 64px", pointerEvents:"none" }} />

      {/* Left panel — branding */}
      <div className="login-left" style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: "60px 80px",
        position: "relative",
        zIndex: 1,
      }}>
        {/* Logo */}
        <div style={{ marginBottom: 60 }}>
          <h1 style={{ fontFamily:"Outfit,sans-serif", fontSize:32, fontWeight:800, letterSpacing:"-0.02em", marginBottom:8 }}>
            <span style={{ background:"linear-gradient(135deg,#c4b5fd,#8b5cf6)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>Penny</span>
            <span style={{ color:"#f0f4ff" }}>Track</span>
          </h1>
          <p style={{ fontSize:12, color:"#334155", fontWeight:700, letterSpacing:"0.1em", textTransform:"uppercase" }}>Smart Finance</p>
        </div>

        {/* Headline */}
        <h2 style={{ fontFamily:"Outfit,sans-serif", fontSize:52, fontWeight:800, lineHeight:1.1, letterSpacing:"-0.03em", marginBottom:24, maxWidth:480 }}>
          <span style={{ color:"#f0f4ff" }}>Track every</span><br />
          <span style={{ background:"linear-gradient(135deg,#a78bfa,#34d399)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>penny</span>
          <span style={{ color:"#f0f4ff" }}>, grow</span><br />
          <span style={{ color:"#f0f4ff" }}>every</span>{" "}
          <span style={{ background:"linear-gradient(135deg,#fbbf24,#fb7185)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>goal.</span>
        </h2>

        <p style={{ fontSize:16, color:"#475569", lineHeight:1.7, maxWidth:420 }}>
          AI-powered insights. Beautiful dashboards. Your spending, finally under control.
        </p>

        {/* Feature pills */}
        <div style={{ display:"flex", gap:10, marginTop:40, flexWrap:"wrap" }}>
          {["📊 Smart Dashboard", "🤖 AI Insights", "📅 Spending Calendar", "🔒 Secure & Private"].map((f) => (
            <div key={f} style={{ padding:"8px 16px", borderRadius:20, background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)", fontSize:13, color:"#64748b", fontWeight:600 }}>
              {f}
            </div>
          ))}
        </div>
      </div>

      {/* Right panel — form */}
      <div className="login-right" style={{
        width: 520,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 60px 40px 40px",
        position: "relative",
        zIndex: 1,
      }}>
        <div style={{
          width: "100%",
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 24,
          padding: "40px 36px",
          backdropFilter: "blur(32px)",
          boxShadow: "0 40px 120px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.08)",
          animation: "fadeUp 0.5s cubic-bezier(0.4,0,0.2,1) both",
          position: "relative",
          overflow: "hidden",
        }}>
          {/* Top shimmer */}
          <div style={{ position:"absolute", top:0, left:0, right:0, height:1, background:"linear-gradient(90deg,transparent,rgba(255,255,255,0.15),transparent)" }} />

          <h3 style={{ fontFamily:"Outfit,sans-serif", fontSize:24, fontWeight:800, marginBottom:6, color:"#f0f4ff" }}>
            {mode === "login" ? "Welcome back" : "Create account"}
          </h3>
          <p style={{ fontSize:13, color:"#475569", marginBottom:28 }}>
            {mode === "login" ? "Sign in to your PennyTrack account" : "Start tracking smarter today"}
          </p>

          {/* Mode toggle */}
          <div style={{ display:"flex", background:"rgba(255,255,255,0.04)", borderRadius:12, padding:4, marginBottom:24, border:"1px solid rgba(255,255,255,0.06)" }}>
            {["login","register"].map((m) => (
              <button key={m} onClick={() => { setMode(m); setError(null); setSuccess(null); }} style={{
                flex:1, padding:"10px 0", borderRadius:9, border:"none",
                cursor:"pointer", fontFamily:"Outfit,sans-serif",
                fontSize:14, fontWeight:700, transition:"all 0.2s",
                background: mode===m ? "rgba(139,92,246,0.2)" : "transparent",
                color: mode===m ? "#c4b5fd" : "#334155",
                boxShadow: mode===m ? "0 0 0 1px rgba(139,92,246,0.3),0 0 12px rgba(139,92,246,0.1)" : "none",
              }}>
                {m === "login" ? "Sign In" : "Register"}
              </button>
            ))}
          </div>

          {/* Alerts */}
          {success && (
            <div style={{ padding:"12px 16px", borderRadius:11, background:"rgba(52,211,153,0.08)", border:"1px solid rgba(52,211,153,0.2)", color:"#34d399", fontSize:13, fontWeight:600, marginBottom:18 }}>
              ✅ {success}
            </div>
          )}
          {error && (
            <div style={{ padding:"12px 16px", borderRadius:11, background:"rgba(251,113,133,0.08)", border:"1px solid rgba(251,113,133,0.2)", color:"#fb7185", fontSize:13, fontWeight:600, marginBottom:18 }}>
              ⚠️ {error}
            </div>
          )}

          {/* Fields */}
          <label style={lbl}>Username</label>
          <input style={inp} placeholder="your_username" value={form.username} autoFocus
            onChange={(e)=>setForm({...form,username:e.target.value})}
            onKeyDown={(e)=>e.key==="Enter"&&handle()} />

          {mode==="register" && (
            <>
              <label style={lbl}>Email <span style={{color:"#1e293b"}}>(optional)</span></label>
              <input style={inp} type="email" placeholder="you@example.com" value={form.email}
                onChange={(e)=>setForm({...form,email:e.target.value})}
                onKeyDown={(e)=>e.key==="Enter"&&handle()} />
            </>
          )}

          <label style={lbl}>Password</label>
          <input style={inp} type="password" placeholder="••••••••" value={form.password}
            onChange={(e)=>setForm({...form,password:e.target.value})}
            onKeyDown={(e)=>e.key==="Enter"&&handle()} />

          {/* Submit */}
          <button onClick={handle} disabled={loading} style={{
            width:"100%", padding:"15px", marginTop:8,
            background: loading ? "rgba(139,92,246,0.4)" : "linear-gradient(135deg,#8b5cf6,#6d28d9)",
            color:"white", border:"none", borderRadius:13,
            fontFamily:"Outfit,sans-serif", fontSize:15, fontWeight:700,
            cursor: loading ? "not-allowed" : "pointer",
            transition:"all 0.25s",
            boxShadow: loading ? "none" : "0 4px 20px rgba(139,92,246,0.35)",
            position:"relative", overflow:"hidden",
          }}>
            {loading ? "Please wait…" : mode==="login" ? "Sign In →" : "Create Account →"}
          </button>

          <p style={{ textAlign:"center", marginTop:20, fontSize:13, color:"#334155" }}>
            {mode==="login" ? "No account? " : "Have an account? "}
            <span onClick={()=>{setMode(mode==="login"?"register":"login");setError(null);}}
              style={{ color:"#a78bfa", fontWeight:700, cursor:"pointer" }}>
              {mode==="login" ? "Sign up free" : "Sign in"}
            </span>
          </p>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Outfit:wght@700;800&display=swap');
        @keyframes orbFloat { 0%,100%{transform:translate(0,0) scale(1)} 33%{transform:translate(40px,-40px) scale(1.08)} 66%{transform:translate(-30px,30px) scale(0.94)} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
        input::placeholder { color: #1e293b; }
        input:focus { border-color: rgba(139,92,246,0.6) !important; background: rgba(139,92,246,0.06) !important; box-shadow: 0 0 0 3px rgba(139,92,246,0.12) !important; outline: none; }
      `}</style>
    </div>
  );
}

const lbl = { fontSize:11, fontWeight:700, color:"#334155", textTransform:"uppercase", letterSpacing:"0.09em", display:"block", marginBottom:8 };
const inp = { width:"100%", padding:"13px 16px", background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:12, color:"#f0f4ff", fontFamily:"Outfit,sans-serif", fontSize:15, fontWeight:500, outline:"none", marginBottom:16, appearance:"none", transition:"all 0.2s", display:"block" };