import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const ResetPassword = () => {
  const navigate = useNavigate();
  const [pwd, setPwd] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [busy, setBusy] = useState(false);
  const [strength, setStrength] = useState({ pct: 0, label: "Password strength", color: "#e5e7eb" });

  useEffect(() => {
    document.title = "Reset Password – SecureGuard";
  }, []);

  function evalStrength(value: string) {
    let s = 0;
    if (value.length >= 6) s++;
    if (/[A-Z]/.test(value)) s++;
    if (/[0-9]/.test(value)) s++;
    if (/[!@#$%^&*]/.test(value)) s++;
    if (!value) return { pct: 0, label: "Password strength", color: "#e5e7eb" };
    if (s <= 1) return { pct: 30, label: "Weak Password", color: "#ef4444" };
    if (s <= 3) return { pct: 70, label: "Medium Password", color: "#f59e0b" };
    return { pct: 100, label: "Strong Password", color: "#22c55e" };
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (pwd.length < 6) { toast.error("Password must be at least 6 characters"); return; }
    if (pwd !== confirm) { toast.error("Passwords do not match"); return; }
    setBusy(true);
    const { error } = await supabase.auth.updateUser({ password: pwd });
    setBusy(false);
    if (error) {
      toast.error(error.message || "Could not reset password");
      return;
    }
    await supabase.auth.signOut();
    localStorage.removeItem("sg_reset_email");
    toast.success("Password updated — please log in");
    navigate("/auth", { replace: true });
  }

  return (
    <div className="rp-root">
      <style>{styles}</style>
      <div className="container">
        <h2>Reset Password</h2>
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <input
              type={showPwd ? "text" : "password"}
              placeholder="New Password"
              value={pwd}
              onChange={(e) => { setPwd(e.target.value); setStrength(evalStrength(e.target.value)); }}
              required
            />
            <i className={`fas ${showPwd ? "fa-eye-slash" : "fa-eye"} toggle-icon`} onClick={() => setShowPwd((v) => !v)} />
          </div>
          <div className="strength"><div className="strength-bar" style={{ width: `${strength.pct}%`, background: strength.color }} /></div>
          <div className="strength-text">{strength.label}</div>
          <div className="input-group">
            <input
              type={showConfirm ? "text" : "password"}
              placeholder="Confirm Password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
            />
            <i className={`fas ${showConfirm ? "fa-eye-slash" : "fa-eye"} toggle-icon`} onClick={() => setShowConfirm((v) => !v)} />
          </div>
          <button disabled={busy}>{busy ? "Updating..." : "Update Password"}</button>
        </form>
      </div>
    </div>
  );
};

const styles = `
.rp-root { background: linear-gradient(135deg, #1e293b, #0f172a); display:flex; justify-content:center; align-items:center; min-height:100vh; font-family:'Poppins',sans-serif; padding: 20px; }
.rp-root *, .rp-root *::before, .rp-root *::after { box-sizing: border-box; }
.rp-root .container { background: rgba(255,255,255,.95); width: 420px; max-width:100%; border-radius:20px; padding: 45px 30px; text-align:center; backdrop-filter: blur(10px); box-shadow: 0 25px 60px rgba(0,0,0,.25), inset 0 3px 6px rgba(255,255,255,.6); transition: all .3s ease; }
.rp-root .container:hover { transform: translateY(-5px); box-shadow: 0 0 0 2px rgba(102,126,234,.6), 0 0 25px rgba(118,75,162,.4), 0 25px 60px rgba(0,0,0,.3); }
.rp-root h2 { margin-bottom: 30px; color:#1f2937; font-weight:700; }
.rp-root .input-group { position:relative; width:100%; margin-bottom: 25px; }
.rp-root .input-group input { width:100%; padding: 16px 45px 16px 15px; border-radius:12px; border:none; outline:none; font-size:14px; background:#f1f5f9; box-shadow: inset 4px 4px 10px rgba(0,0,0,.08), inset -4px -4px 10px rgba(255,255,255,.9); transition: all .3s ease; }
.rp-root .input-group input:focus { background:#fff; box-shadow: 0 0 0 2px rgba(118,75,162,.3), 0 8px 20px rgba(118,75,162,.15); }
.rp-root .toggle-icon { position:absolute; right:15px; top:50%; transform: translateY(-50%); cursor:pointer; color:#6b7280; transition: .3s; }
.rp-root .toggle-icon:hover { color:#764ba2; }
.rp-root .strength { height: 8px; border-radius:10px; background:#e5e7eb; overflow:hidden; margin-bottom: 8px; }
.rp-root .strength-bar { height:100%; width:0%; transition: all .4s ease; border-radius:10px; }
.rp-root .strength-text { font-size:13px; margin-bottom: 15px; color:#6b7280; }
.rp-root button { width:100%; padding: 15px; border:none; border-radius:12px; color:white; font-weight:600; cursor:pointer; background: linear-gradient(135deg, #667eea, #764ba2); box-shadow: 0 10px 25px rgba(118,75,162,.35); transition: all .3s ease; }
.rp-root button:hover { transform: translateY(-3px) scale(1.02); box-shadow: 0 15px 30px rgba(118,75,162,.45); }
.rp-root button:disabled { opacity:.7; cursor:not-allowed; }
@media (max-width: 480px) { .rp-root .container { padding: 30px 20px; } }
`;

export default ResetPassword;
