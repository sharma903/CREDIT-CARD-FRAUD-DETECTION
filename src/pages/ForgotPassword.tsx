import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { z } from "zod";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    document.title = "Forgot Password – SecureGuard";
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = z.string().trim().email().max(255).safeParse(email);
    if (!parsed.success) {
      toast.error("Please enter a valid email");
      return;
    }
    setBusy(true);
    const { error } = await supabase.auth.signInWithOtp({
      email: parsed.data,
      options: { shouldCreateUser: false },
    });
    setBusy(false);
    if (error) {
      toast.error(error.message || "Could not send OTP");
      return;
    }
    localStorage.setItem("sg_reset_email", parsed.data);
    toast.success("OTP sent — check your email");
    navigate("/verify-otp");
  }

  return (
    <div className="fp-root">
      <style>{styles}</style>
      <div className="container">
        <div className="form-panel">
          <div className="form-content">
            <h2>Forget Password</h2>
            <form onSubmit={handleSubmit}>
              <div className="input-group">
                <input type="email" placeholder="Enter your email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                <i className="fas fa-envelope icon" />
              </div>
              <button type="submit" className="submit-btn" disabled={busy}>{busy ? "Sending..." : "Send OTP"}</button>
              <Link to="/auth" className="forgot-password" style={{ textAlign: "center", display: "block", marginTop: 15 }}>
                Back to Login
              </Link>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = `
.fp-root { background: linear-gradient(135deg, #1e293b, #0f172a); display:flex; justify-content:center; align-items:center; min-height:100vh; font-family: 'Poppins', sans-serif; padding: 20px; }
.fp-root *, .fp-root *::before, .fp-root *::after { box-sizing: border-box; }
.fp-root .container { background: rgba(255,255,255,.95); width: 420px; max-width: 100%; border-radius: 20px; padding: 45px 30px; backdrop-filter: blur(10px); box-shadow: 0 25px 60px rgba(0,0,0,.25), inset 0 3px 6px rgba(255,255,255,.6); transition: all .3s ease; }
.fp-root .container:hover { transform: translateY(-5px); box-shadow: 0 0 0 2px rgba(102,126,234,.6), 0 0 25px rgba(118,75,162,.4), 0 25px 60px rgba(0,0,0,.3); }
.fp-root .form-content { width:100%; text-align:center; }
.fp-root .form-content h2 { margin-bottom: 25px; font-size: 28px; font-weight:600; color:#1f2937; }
.fp-root form { width: 100%; display:flex; flex-direction:column; }
.fp-root .input-group { position: relative; margin-bottom: 25px; width:100%; }
.fp-root .input-group input { width:100%; padding: 16px 45px 16px 15px; border-radius: 12px; border:none; outline:none; font-size: 14px; background:#f1f5f9; box-shadow: inset 4px 4px 10px rgba(0,0,0,.08), inset -4px -4px 10px rgba(255,255,255,.9); transition: all .3s ease; }
.fp-root .input-group input:focus { background:#fff; box-shadow: 0 0 0 2px rgba(118,75,162,.3), 0 8px 20px rgba(118,75,162,.15); }
.fp-root .input-group .icon { position:absolute; right: 15px; top: 50%; transform: translateY(-50%); color:#6b7280; }
.fp-root .submit-btn { width:100%; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color:white; border:none; padding: 15px; border-radius: 12px; font-size:18px; font-weight:600; cursor:pointer; transition: all .3s ease; box-shadow: 0 10px 25px rgba(118,75,162,.35); }
.fp-root .submit-btn:hover { transform: translateY(-4px) scale(1.02); box-shadow: 0 18px 35px rgba(118,75,162,.45); }
.fp-root .submit-btn:disabled { opacity:.7; cursor:not-allowed; }
.fp-root .forgot-password { color:#4b5563; font-size:15px; text-decoration:none; font-weight:bold; transition: .2s; }
.fp-root .forgot-password:hover { color:#764ba2; }
@media (max-width: 480px) { .fp-root .container { padding: 30px 20px; } }
`;

export default ForgotPassword;
