import { useEffect, useState, useCallback } from "react";
import "./App.css";

import { getToken, getUser, logout } from "./services/auth";
import { getExpenses }               from "./services/api";
import LoginPage                     from "./pages/Login";
import Toast                         from "./components/Toast";
import ProfileModal, { AVATARS }     from "./components/ProfileModal";
import Dashboard                     from "./pages/Dashboard";
import ExpenseList                   from "./pages/ExpenseList";
import AddExpense                    from "./pages/AddExpense";
import AIInsights                    from "./pages/AIInsights";
import Settings                      from "./pages/Settings";

const safeN = (v) => (isNaN(parseFloat(v)) ? 0 : parseFloat(v));
const fmt   = (v) => new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(safeN(v));

const NAV  = [
  { key: "dashboard", icon: "📊", label: "Dashboard"   },
  { key: "expenses",  icon: "📋", label: "Expenses"    },
  { key: "add",       icon: "➕", label: "Add Expense"  },
  { key: "ai",        icon: "🤖", label: "AI Insights"  },
];
const NAV2 = [
  { key: "settings",  icon: "⚙️", label: "Settings"    },
];

export default function App() {
  const [authed,       setAuthed]       = useState(!!getToken());
  const [user,         setUser]         = useState(getUser());
  const [expenses,     setExpenses]     = useState([]);
  const [tab,          setTab]          = useState("dashboard");
  const [budget,       setBudget]       = useState("");
  const [apiKey,       setApiKey]       = useState("");
  const [notification, setNotification] = useState(null);
  const [showProfile,  setShowProfile]  = useState(false);
  const [avatarId,     setAvatarId]     = useState(1);
  const [sidebarOpen,  setSidebarOpen]  = useState(false);

  // Load prefs per user — also migrates old keys if they exist
  useEffect(() => {
    if (!user) return;
    const b = localStorage.getItem(`pt_budget_${user.id}`) || localStorage.getItem("pt_budget");
    const k = localStorage.getItem(`pt_apikey_${user.id}`) || localStorage.getItem("pt_apikey");
    const a = localStorage.getItem(`pt_avatar_${user.id}`);
    if (b) setBudget(b);
    if (k) setApiKey(k);
    if (a) setAvatarId(parseInt(a));
    // Migrate old keys to new per-user format
    if (b) localStorage.setItem(`pt_budget_${user.id}`, b);
    if (k) localStorage.setItem(`pt_apikey_${user.id}`, k);
  }, [user]);

  useEffect(() => { if (user) localStorage.setItem(`pt_budget_${user.id}`, budget); }, [budget, user]);
  useEffect(() => { if (user) localStorage.setItem(`pt_apikey_${user.id}`, apiKey);  }, [apiKey,  user]);

  const handleAvatarChange = (id) => {
    setAvatarId(id);
    if (user) localStorage.setItem(`pt_avatar_${user.id}`, id);
  };

  const fetchExpenses = useCallback(async () => {
    if (!authed) return;
    try {
      const res = await getExpenses();
      setExpenses(res.data);
    } catch (e) {
      if (e.response?.status === 401) handleLogout();
      else toast("❌ Cannot connect to backend");
    }
  }, [authed]);

  useEffect(() => { fetchExpenses(); }, [fetchExpenses]);

  const handleAuth = () => {
    setAuthed(true);
    setUser(getUser());
    setTab("dashboard");
  };

  const handleLogout = () => {
    logout();
    setAuthed(false);
    setUser(null);
    setExpenses([]);
    setBudget("");
    setApiKey("");
    setShowProfile(false);
  };

  const toast = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 2800);
  };

  const navigate = (key) => { setTab(key); setSidebarOpen(false); };
  const exportCSV = () => {
    const rows = [["ID","Amount","Category","Date"], ...expenses.map((e)=>[e.id,e.amount,e.category,e.date])];
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([rows.map((r)=>r.join(",")).join("\n")], { type:"text/csv" }));
    a.download = "expenses.csv"; a.click();
    toast("📥 CSV exported");
  };

  if (!authed) return <LoginPage onAuth={handleAuth} />;

  const allTotal  = expenses.reduce((s,e) => s + safeN(e.amount), 0);
  const budgetNum = safeN(budget);
  const budgetPct = budgetNum ? Math.min((allTotal / budgetNum) * 100, 100) : 0;
  const avatar    = AVATARS.find((a) => a.id === avatarId) || AVATARS[0];

  const PAGE = {
    dashboard: { title:"Dashboard",    sub:`${expenses.length} transactions tracked` },
    expenses:  { title:"All Expenses", sub:"Manage and filter your spending" },
    add:       { title:"Add Expense",  sub:"Log a new transaction" },
    ai:        { title:"AI Insights",  sub:"Powered by Groq · Free AI spending analysis" },
    settings:  { title:"Settings",     sub:"Preferences and API keys" },
  };

  return (
    <div className="layout">
      <div className="bg-mesh" />
      <Toast message={notification} />

      {sidebarOpen && <div className="mobile-overlay" onClick={() => setSidebarOpen(false)} />}

      {/* Mobile header */}
      <div className="mobile-header">
        <h1 style={{ fontSize:20, fontWeight:900 }}>
          <span style={{ background:"linear-gradient(135deg,#c4b5fd,#8b5cf6)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>Penny</span>
          <span style={{ color:"#eef2ff" }}>Track</span>
        </h1>
        <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{ background:"none", border:"none", cursor:"pointer", display:"flex", flexDirection:"column", gap:5, padding:4 }}>
          <span style={{ display:"block", width:22, height:2, background:"#8892b0", borderRadius:2 }} />
          <span style={{ display:"block", width:22, height:2, background:"#8892b0", borderRadius:2 }} />
          <span style={{ display:"block", width:22, height:2, background:"#8892b0", borderRadius:2 }} />
        </button>
      </div>

      {/* Profile Modal */}
      {showProfile && (
        <ProfileModal
          user={user}
          expenses={expenses}
          onClose={() => setShowProfile(false)}
          onLogout={handleLogout}
          onAvatarChange={handleAvatarChange}
          currentAvatarId={avatarId}
        />
      )}

      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="logo-wrap">
          <h1><span className="violet-text">Penny</span>Track</h1>
          <p>Smart Finance</p>
        </div>

        <span className="nav-group-label">Main</span>
        {NAV.map((n) => (
          <button key={n.key} className={`nav-btn ${tab===n.key?"active":""}`} onClick={()=>navigate(n.key)}>
            <span className="ni">{n.icon}</span>
            {n.label}
            {n.key==="ai" && (
              <span style={{ marginLeft:"auto", fontSize:9, background:"rgba(139,92,246,0.3)", color:"#c4b5fd", padding:"2px 7px", borderRadius:10, fontWeight:700 }}>NEW</span>
            )}
          </button>
        ))}

        <span className="nav-group-label" style={{ marginTop:12 }}>Config</span>
        {NAV2.map((n) => (
          <button key={n.key} className={`nav-btn ${tab===n.key?"active":""}`} onClick={()=>navigate(n.key)}>
            <span className="ni">{n.icon}</span>{n.label}
          </button>
        ))}

        {/* Sidebar footer */}
        <div className="sidebar-footer">

          {/* Budget mini */}
          <p style={{ fontSize:13, color:"var(--text2)", marginBottom:6 }}>Total: <span style={{ color:"var(--text1)", fontWeight:700 }}>₹{fmt(allTotal)}</span> · {expenses.length} tx</p>


          {budgetNum > 0 && (
            <>
              <p style={{ fontSize:13, color:"var(--text2)", marginBottom:0, marginTop:4 }}>
                Budget: <span style={{ fontWeight:700, color: budgetPct>85?"var(--rose)":budgetPct>65?"var(--amber)":"var(--emerald)" }}>{budgetPct.toFixed(0)}% used</span>
              </p>
              <div style={{ height:4, borderRadius:2, background:"rgba(255,255,255,0.07)", overflow:"hidden", marginTop:6 }}>
                <div style={{ height:"100%", borderRadius:2, width:`${budgetPct}%`, background:budgetPct>85?"var(--rose)":budgetPct>65?"var(--amber)":"var(--emerald)", transition:"width 0.8s ease" }} />
              </div>
            </>
          )}

          {/* Export CSV */}
          <button onClick={exportCSV} style={{
            marginTop: 14, width:"100%", padding:"10px 14px", borderRadius:10,
            background:"rgba(255,255,255,0.04)", border:"1px solid var(--border)",
            color:"var(--text2)", cursor:"pointer", fontFamily:"Outfit,sans-serif",
            fontSize:13, fontWeight:600, transition:"all 0.2s",
            }}
            onMouseEnter={(e)=>e.currentTarget.style.color="var(--text2)"}
            onMouseLeave={(e)=>e.currentTarget.style.color="var(--text2)"}
          >
            📥 Export CSV
          </button>

          {/* Profile button — replaces sign out */}
          <button
            onClick={() => setShowProfile(true)}
            style={{
              marginTop: 8, width:"100%", padding:"10px 14px", borderRadius:10,
              background:"rgba(139,92,246,0.08)", border:"1px solid rgba(139,92,246,0.2)",
              cursor:"pointer", fontFamily:"Outfit,sans-serif", transition:"all 0.2s",
              display:"flex", alignItems:"center", gap:10,
            }}
            onMouseEnter={(e)=>e.currentTarget.style.background="rgba(139,92,246,0.15)"}
            onMouseLeave={(e)=>e.currentTarget.style.background="rgba(139,92,246,0.08)"}
          >
            {/* Avatar */}
            <div style={{ width:30, height:30, borderRadius:"50%", background:avatar.bg, display:"flex", alignItems:"center", justifyContent:"center", fontSize:14, flexShrink:0 }}>
              {avatar.emoji}
            </div>
            <div style={{ flex:1, minWidth:0, textAlign:"left" }}>
              <p style={{ fontSize:13, fontWeight:700, color:"#c4b5fd", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{user?.username}</p>
              <p style={{ fontSize:10, color:"var(--text3)" }}>View profile</p>
            </div>
            <span style={{ fontSize:11, color:"var(--text3)" }}>›</span>
          </button>

        </div>
      </aside>

      {/* Main */}
      <main className="main">
        <div className="page-header">
          <h2>{PAGE[tab]?.title}</h2>
          <p>{PAGE[tab]?.sub}</p>
        </div>

        {tab==="dashboard" && <Dashboard   expenses={expenses} budget={budget} />}
        {tab==="expenses"  && <ExpenseList expenses={expenses} onRefresh={fetchExpenses} onToast={toast} />}
        {tab==="add"       && <AddExpense  onRefresh={fetchExpenses} onToast={toast} onDone={()=>setTab("expenses")} />}
        {tab==="ai"        && <AIInsights  expenses={expenses} apiKey={apiKey} />}
        {tab==="settings"  && <Settings    expenses={expenses} budget={budget} setBudget={setBudget} apiKey={apiKey} setApiKey={setApiKey} />}
      </main>

      <nav className="mobile-nav">
        {[...NAV, ...NAV2].map((n) => (
          <button key={n.key} onClick={() => navigate(n.key)} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:3, background:"none", border:"none", cursor:"pointer", padding:"6px 0", color: tab===n.key ? "#c4b5fd" : "var(--text3)", fontFamily:"Outfit,sans-serif", transition:"color 0.2s" }}>
            <span style={{ fontSize:18 }}>{n.icon}</span>
            <span style={{ fontSize:9, fontWeight:600 }}>{n.label.split(" ")[0]}</span>
          </button>
        ))}
      </nav>

      {tab !== "add" && <button className="fab" onClick={()=>setTab("add")}>+</button>}
    </div>
  );
}