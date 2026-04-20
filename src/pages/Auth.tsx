import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().trim().email("Invalid email").max(255),
  password: z.string().min(1, "Password required").max(72),
});

const registerSchema = z.object({
  name: z.string().trim().min(1, "Name required").max(100),
  email: z.string().trim().email("Invalid email").max(255),
  password: z.string().min(6, "At least 6 characters").max(72),
});

const AuthPage = () => {
  const navigate = useNavigate();
  const [signUpMode, setSignUpMode] = useState(false);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showLoginPwd, setShowLoginPwd] = useState(false);
  const [remember, setRemember] = useState(false);

  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [showRegPwd, setShowRegPwd] = useState(false);
  const [strength, setStrength] = useState({ pct: 0, label: "", color: "" });

  const [busy, setBusy] = useState(false);

  useEffect(() => {
    document.title = signUpMode ? "Register – SecureGuard" : "Login – SecureGuard";
  }, [signUpMode]);

  // Pre-fill remembered email
  useEffect(() => {
    const saved = localStorage.getItem("sg_remember_email");
    if (saved) {
      setLoginEmail(saved);
      setRemember(true);
    }
  }, []);

  // Check existing session
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate("/dashboard", { replace: true });
    });
  }, [navigate]);

  function evalStrength(value: string) {
    let s = 0;
    if (value.length >= 6) s++;
    if (/[A-Z]/.test(value)) s++;
    if (/[0-9]/.test(value)) s++;
    if (/[!@#$%^&*]/.test(value)) s++;
    if (s <= 1) return { pct: 30, label: "Weak Password", color: "#ef4444" };
    if (s <= 3) return { pct: 70, label: "Medium Password", color: "#f59e0b" };
    return { pct: 100, label: "Strong Password", color: "#22c55e" };
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    const parsed = loginSchema.safeParse({ email: loginEmail, password: loginPassword });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: parsed.data.email,
      password: parsed.data.password,
    });
    setBusy(false);
    if (error) {
      toast.error(error.message || "Invalid email or password");
      return;
    }
    if (remember) localStorage.setItem("sg_remember_email", parsed.data.email);
    else localStorage.removeItem("sg_remember_email");
    toast.success("Welcome back!");
    navigate("/dashboard", { replace: true });
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    const parsed = registerSchema.safeParse({ name: regName, email: regEmail, password: regPassword });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    setBusy(true);
    const { error } = await supabase.auth.signUp({
      email: parsed.data.email,
      password: parsed.data.password,
      options: {
        emailRedirectTo: `${window.location.origin}/dashboard`,
        data: { display_name: parsed.data.name, name: parsed.data.name },
      },
    });
    setBusy(false);
    if (error) {
      toast.error(error.message || "Could not register");
      return;
    }
    toast.success("Account created — please log in");
    setSignUpMode(false);
    setLoginEmail(parsed.data.email);
    setLoginPassword("");
  }

  return (
    <div className="auth-root">
      <style>{authStyles}</style>
      <div className={`container ${signUpMode ? "sign-up-mode" : ""}`}>
        <div className="welcome-panel">
          <div className="welcome-content sign-in-text">
            <h2>Hello, Welcome!</h2>
            <p>Don't have an account?</p>
            <button className="toggle-btn" onClick={() => setSignUpMode(true)}>Register</button>
          </div>
          <div className="welcome-content sign-up-text">
            <h2>Welcome Back!</h2>
            <p>Already have an account?</p>
            <button className="toggle-btn" onClick={() => setSignUpMode(false)}>Login</button>
          </div>
        </div>

        <div className="form-panel">
          {/* LOGIN */}
          <div className="form-content sign-in-form">
            <h2>Login</h2>
            <form onSubmit={handleLogin}>
              <div className="input-group">
                <input type="text" placeholder="Email ID" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} required />
                <i className="fas fa-envelope icon" />
              </div>
              <div className="input-group">
                <input type={showLoginPwd ? "text" : "password"} placeholder="Password" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} required />
                <i className="fas fa-lock icon" />
                <i
                  className={`fas ${showLoginPwd ? "fa-eye-slash" : "fa-eye"} toggle-password`}
                  onMouseDown={(e) => { e.preventDefault(); setShowLoginPwd(true); }}
                  onMouseUp={() => setShowLoginPwd(false)}
                  onMouseLeave={() => setShowLoginPwd(false)}
                  onTouchStart={(e) => { e.preventDefault(); setShowLoginPwd(true); }}
                  onTouchEnd={() => setShowLoginPwd(false)}
                />
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                <input type="checkbox" id="rememberMe" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
                <label htmlFor="rememberMe" style={{ fontSize: 14 }}>Remember Me</label>
              </div>
              <Link to="/forgot-password" className="forgot-password">Forget Password?</Link>
              <button type="submit" className="submit-btn login-btn" disabled={busy}>{busy ? "Signing in..." : "Login"}</button>
            </form>
            <div className="social-login-section">
              <p>or login with social platforms</p>
              <div className="social-icons">
                <a href="https://accounts.google.com" target="_blank" rel="noreferrer"><i className="fab fa-google" /></a>
                <a href="https://facebook.com" target="_blank" rel="noreferrer"><i className="fab fa-facebook" /></a>
                <a href="https://github.com" target="_blank" rel="noreferrer"><i className="fab fa-github" /></a>
                <a href="https://linkedin.com" target="_blank" rel="noreferrer"><i className="fab fa-linkedin-in" /></a>
              </div>
            </div>
          </div>

          {/* REGISTER */}
          <div className="form-content sign-up-form">
            <h2>Register</h2>
            <form onSubmit={handleRegister}>
              <div className="input-group">
                <input type="text" placeholder="Full Name" value={regName} onChange={(e) => setRegName(e.target.value)} required />
                <i className="fas fa-user icon" />
              </div>
              <div className="input-group">
                <input type="email" placeholder="Email ID" value={regEmail} onChange={(e) => setRegEmail(e.target.value)} required />
                <i className="fas fa-envelope icon" />
              </div>
              <div className="input-group">
                <input
                  type={showRegPwd ? "text" : "password"}
                  placeholder="Password"
                  value={regPassword}
                  onChange={(e) => { setRegPassword(e.target.value); setStrength(evalStrength(e.target.value)); }}
                  required
                />
                <i className="fas fa-lock icon" />
                <i
                  className={`fas ${showRegPwd ? "fa-eye-slash" : "fa-eye"} toggle-password`}
                  onMouseDown={(e) => { e.preventDefault(); setShowRegPwd(true); }}
                  onMouseUp={() => setShowRegPwd(false)}
                  onMouseLeave={() => setShowRegPwd(false)}
                  onTouchStart={(e) => { e.preventDefault(); setShowRegPwd(true); }}
                  onTouchEnd={() => setShowRegPwd(false)}
                />
              </div>
              <div className="strength">
                <div id="strengthBar" style={{ width: `${strength.pct}%`, background: strength.color }} />
              </div>
              <p style={{ fontSize: 13 }}>{strength.label}</p>
              <button type="submit" className="submit-btn login-btn" style={{ marginTop: 15 }} disabled={busy}>{busy ? "Creating..." : "Sign Up"}</button>
            </form>
            <div className="social-login-section">
              <p>or register with social platforms</p>
              <div className="social-icons">
                <a href="https://accounts.google.com" target="_blank" rel="noreferrer"><i className="fab fa-google" /></a>
                <a href="https://facebook.com" target="_blank" rel="noreferrer"><i className="fab fa-facebook" /></a>
                <a href="https://github.com" target="_blank" rel="noreferrer"><i className="fab fa-github" /></a>
                <a href="https://linkedin.com" target="_blank" rel="noreferrer"><i className="fab fa-linkedin-in" /></a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const authStyles = `
.auth-root { background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%); display: flex; justify-content: center; align-items: center; min-height: 100vh; perspective: 1000px; overflow-x: hidden; padding: 20px; font-family: 'Poppins', sans-serif; }
.auth-root *, .auth-root *::before, .auth-root *::after { box-sizing: border-box; }
.auth-root .container { background: white; width: 900px; height: 600px; border-radius: 20px; position: relative; overflow: hidden; transform-style: preserve-3d; transition: box-shadow .3s ease; box-shadow: 0 20px 50px rgba(0,0,0,.15), 0 10px 15px rgba(0,0,0,.1), inset 0 4px 6px rgba(255,255,255,.5), inset 0 -1px 2px rgba(0,0,0,.05); }
.auth-root .container:hover { box-shadow: 0 0 0 3px rgba(102,126,234,.6), 0 0 15px rgba(118,75,162,.4), 0 20px 50px rgba(0,0,0,.15), 0 10px 15px rgba(0,0,0,.1); }
.auth-root .welcome-panel { background: linear-gradient(135deg, #667eea 50%, #764ba2 100%); position: absolute; top:0; left:0; width: 45%; height: 100%; display:flex; flex-direction:column; justify-content:center; align-items:center; color:white; border-radius: 20px 220px 220px 20px; z-index: 10; transition: all .7s cubic-bezier(0.68, -0.55, 0.265, 1.55); box-shadow: 10px 0 20px rgba(0,0,0,.15), inset 5px 5px 25px rgba(255,255,255,.25), inset -5px -5px 15px rgba(0,0,0,.2); }
.auth-root .welcome-panel::before { content:''; position:absolute; top:-50%; left:-50%; width:200%; height:200%; background: radial-gradient(ellipse at top left, rgba(255,255,255,.15), transparent 45%); pointer-events:none; transition: all .7s ease; }
.auth-root .container.sign-up-mode .welcome-panel { left: 55%; border-radius: 220px 20px 20px 220px; box-shadow: -10px 0 20px rgba(0,0,0,.15), inset 5px 5px 25px rgba(255,255,255,.25), inset -5px -5px 15px rgba(0,0,0,.2); }
.auth-root .container.sign-up-mode .welcome-panel::before { background: radial-gradient(ellipse at top right, rgba(255,255,255,.15), transparent 45%); }
.auth-root .welcome-content { position: absolute; text-align: center; width: 100%; padding: 0 30px; transition: all .5s ease; opacity:1; visibility:visible; transform: translateX(0); }
.auth-root .sign-up-text { opacity:0; visibility:hidden; transform: translateX(50px); }
.auth-root .container.sign-up-mode .sign-in-text { opacity:0; visibility:hidden; transform: translateX(-50px); }
.auth-root .container.sign-up-mode .sign-up-text { opacity:1; visibility:visible; transform: translateX(0); }
.auth-root .welcome-content h2 { font-size: 32px; font-weight:700; margin-bottom: 8px; text-shadow: 0 4px 10px rgba(0,0,0,.3); }
.auth-root .welcome-content p { font-size: 14px; margin-bottom: 25px; font-weight:400; text-shadow: 0 2px 5px rgba(0,0,0,.2); }
.auth-root .toggle-btn { background: rgba(255,255,255,.1); border: 1.5px solid rgba(255,255,255,.4); color:white; padding: 10px 40px; border-radius: 12px; font-size: 15px; font-weight:600; cursor: pointer; backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px); transition: all .3s cubic-bezier(0.175, 0.885, 0.32, 1.275); box-shadow: 0 8px 15px rgba(0,0,0,.2), inset 0 2px 2px rgba(255,255,255,.5), inset 0 -2px 2px rgba(0,0,0,.1); }
.auth-root .toggle-btn:hover { background:white; color:#764ba2; transform: translateY(-4px); box-shadow: 0 12px 20px rgba(0,0,0,.3), inset 0 2px 2px rgba(255,255,255,1); }
.auth-root .toggle-btn:active { transform: translateY(2px); }
.auth-root .form-panel { position: absolute; top:0; right:0; width: 55%; height: 100%; transition: all .7s cubic-bezier(0.68, -0.55, 0.265, 1.55); z-index: 1; }
.auth-root .container.sign-up-mode .form-panel { right: 45%; }
.auth-root .form-content { position: absolute; top:0; left:0; width: 100%; height: 100%; display:flex; flex-direction:column; justify-content:center; align-items:center; padding: 0 60px; transition: all .5s ease-in-out; }
.auth-root .sign-up-form { opacity:0; visibility:hidden; transform: translateX(50px); }
.auth-root .container.sign-up-mode .sign-in-form { opacity:0; visibility:hidden; transform: translateX(-50px); }
.auth-root .container.sign-up-mode .sign-up-form { opacity:1; visibility:visible; transform: translateX(0); }
.auth-root .form-content h2 { font-size: 32px; font-weight:700; color:#2b314b; margin-bottom: 30px; }
.auth-root form { width: 100%; max-width: 320px; display:flex; flex-direction:column; }
.auth-root .input-group { position: relative; margin-bottom: 25px; }
.auth-root .input-group input { width:100%; padding: 15px 45px 15px 20px; background:#f0f3f6; border:none; border-radius:12px; font-size:14px; color:#333; font-weight:500; outline:none; transition: all .3s ease; box-shadow: inset 4px 4px 8px rgba(166,180,200,.5), inset -4px -4px 8px rgba(255,255,255,.9); }
.auth-root .input-group input::placeholder { color:#9ca3af; font-weight:400; }
.auth-root .input-group input:focus { background:#fff; box-shadow: 0 5px 15px rgba(118,75,162,.15), 0 0 0 2px #764ba2; }
.auth-root .input-group .icon { position:absolute; right:18px; top:50%; transform: translateY(-50%); color:#6b7280; font-size:16px; transition: color .3s; }
.auth-root .input-group input:focus ~ .icon { color:#764ba2; }
.auth-root .toggle-password { position:absolute; right:40px; top:50%; transform: translateY(-50%); cursor:pointer; color:#888; }
.auth-root .forgot-password { text-align:right; color:#6b7280; font-size:13px; text-decoration:none; margin-bottom: 15px; margin-top: -5px; font-weight:500; transition: color .3s; }
.auth-root .forgot-password:hover { color:#764ba2; text-shadow: 0 0 8px rgba(118,75,162,.3); }
.auth-root .submit-btn { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color:white; border:none; padding: 15px; border-radius: 12px; font-size: 16px; font-weight:600; cursor:pointer; transition: all .3s cubic-bezier(0.175, 0.885, 0.32, 1.275); box-shadow: 0 10px 20px rgba(118,75,162,.3), inset 0 2px 0 rgba(255,255,255,.4), inset 0 -3px 0 rgba(0,0,0,.15); }
.auth-root .submit-btn:hover { transform: translateY(-4px); box-shadow: 0 15px 25px rgba(118,75,162,.4); }
.auth-root .submit-btn:active { transform: translateY(2px); }
.auth-root .submit-btn:disabled { opacity:.7; cursor:not-allowed; }
.auth-root .social-login-section { margin-top: 25px; text-align:center; width: 100%; }
.auth-root .social-login-section p { color:#6b7280; font-size:13px; margin-bottom: 15px; }
.auth-root .social-icons { display:flex; justify-content:center; gap: 15px; }
.auth-root .social-icons a { width:42px; height:42px; background:#fff; border-radius:12px; display:flex; align-items:center; justify-content:center; font-size:16px; color:#333; text-decoration:none; transition: all .3s cubic-bezier(0.175, 0.885, 0.32, 1.275); box-shadow: 0 6px 12px rgba(0,0,0,.08), inset 0 2px 0 rgba(255,255,255,.9), inset 0 -2px 0 rgba(0,0,0,.05); }
.auth-root .social-icons a:hover { transform: translateY(-5px) scale(1.05); color:#764ba2; }
.auth-root .strength { height:6px; background:#eee; border-radius:10px; margin-top:8px; overflow:hidden; }
.auth-root #strengthBar { height:100%; width:0%; border-radius:10px; transition: .3s; }
@media (max-width: 768px) {
  .auth-root .container { width: 100%; max-width: 420px; height: 750px; }
  .auth-root .welcome-panel { width:100%; height:250px; top:0; left:0; border-radius: 20px 20px 80px 80px; }
  .auth-root .container.sign-up-mode .welcome-panel { top: calc(100% - 250px); left:0; border-radius: 80px 80px 20px 20px; }
  .auth-root .welcome-panel h2 { font-size: 28px; }
  .auth-root .form-panel { width:100%; height: calc(100% - 250px); top: 250px; left:0; right:auto; }
  .auth-root .container.sign-up-mode .form-panel { top:0; right:0; left:0; }
  .auth-root .form-content { padding: 40px 25px; }
  .auth-root form { max-width: 100%; }
}
`;

export default AuthPage;
