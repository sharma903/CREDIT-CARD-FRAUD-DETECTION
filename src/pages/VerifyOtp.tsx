import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const VerifyOtp = () => {
  const navigate = useNavigate();
  const [digits, setDigits] = useState<string[]>(["", "", "", "", "", ""]);
  const [time, setTime] = useState(60);
  const [busy, setBusy] = useState(false);
  const inputs = useRef<(HTMLInputElement | null)[]>([]);
  const email = typeof window !== "undefined" ? localStorage.getItem("sg_reset_email") || "" : "";

  useEffect(() => {
    document.title = "Verify OTP – SecureGuard";
    if (!email) {
      toast.error("Session expired. Please try again.");
      navigate("/forgot-password", { replace: true });
    }
  }, [email, navigate]);

  useEffect(() => {
    if (time <= 0) return;
    const t = setInterval(() => setTime((s) => s - 1), 1000);
    return () => clearInterval(t);
  }, [time]);

  function handleChange(i: number, v: string) {
    const c = v.replace(/\D/g, "").slice(0, 1);
    const next = [...digits];
    next[i] = c;
    setDigits(next);
    if (c && i < 5) inputs.current[i + 1]?.focus();
  }

  function handleKey(i: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace" && !digits[i] && i > 0) inputs.current[i - 1]?.focus();
  }

  async function handleResend() {
    if (!email) return;
    const { error } = await supabase.auth.signInWithOtp({ email, options: { shouldCreateUser: false } });
    if (error) toast.error(error.message);
    else {
      toast.success("OTP resent");
      setTime(60);
    }
  }

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    const otp = digits.join("");
    if (otp.length !== 6) {
      toast.error("Please enter complete 6-digit OTP");
      return;
    }
    setBusy(true);
    const { error } = await supabase.auth.verifyOtp({ email, token: otp, type: "email" });
    setBusy(false);
    if (error) {
      toast.error(error.message || "Invalid OTP");
      return;
    }
    navigate("/success");
  }

  return (
    <div className="otp-root">
      <style>{styles}</style>
      <div className="container">
        <h2>Verify OTP</h2>
        <p>Enter the 6-digit code sent to {email || "your email"}</p>
        <form onSubmit={handleVerify}>
          <div className="otp-box">
            {digits.map((d, i) => (
              <input
                key={i}
                ref={(el) => (inputs.current[i] = el)}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={d}
                onChange={(e) => handleChange(i, e.target.value)}
                onKeyDown={(e) => handleKey(i, e)}
              />
            ))}
          </div>
          <button type="submit" className="verify-btn" disabled={busy}>{busy ? "Verifying..." : "Verify OTP"}</button>
          {time > 0 ? (
            <p className="timer">Resend OTP in <span>{time}</span>s</p>
          ) : (
            <button type="button" className="verify-btn resend" onClick={handleResend}>Resend OTP</button>
          )}
          <Link to="/forgot-password" className="back-link">Back</Link>
        </form>
      </div>
    </div>
  );
};

const styles = `
.otp-root { background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%); display:flex; justify-content:center; align-items:center; min-height:100vh; font-family:'Poppins',sans-serif; padding: 20px; }
.otp-root *, .otp-root *::before, .otp-root *::after { box-sizing: border-box; }
.otp-root .container { background:white; width: 420px; max-width:100%; border-radius:20px; padding: 40px 30px; text-align:center; box-shadow: 0 25px 60px rgba(0,0,0,.2), 0 10px 20px rgba(0,0,0,.1), inset 0 3px 6px rgba(255,255,255,.6); transition: .3s; }
.otp-root .container:hover { box-shadow: 0 0 0 3px rgba(102,126,234,.6), 0 0 20px rgba(118,75,162,.25), 0 25px 60px rgba(0,0,0,.2); }
.otp-root h2 { margin-bottom: 10px; color:#1f2937; font-weight:700; }
.otp-root p { font-size: 14px; color:#6b7280; margin-bottom: 25px; }
.otp-root .otp-box { display:flex; justify-content:center; gap: 12px; margin-bottom: 25px; }
.otp-root .otp-box input { width: 50px; height: 55px; text-align:center; font-size: 20px; border-radius: 12px; border:none; outline:none; background:#f8fafc; box-shadow: inset 4px 4px 8px rgba(0,0,0,.08), inset -4px -4px 8px rgba(255,255,255,.9); transition: .3s ease; font-family: 'Poppins', sans-serif; }
.otp-root .otp-box input:focus { background:#fff; box-shadow: inset 2px 2px 5px rgba(0,0,0,.1), inset -2px -2px 5px rgba(255,255,255,1), 0 0 0 3px rgba(118,75,162,.2); }
.otp-root .verify-btn { width:100%; padding: 15px; border:none; border-radius:12px; color:white; font-size:16px; font-weight:600; cursor:pointer; background: linear-gradient(135deg, #667eea, #764ba2); box-shadow: 0 10px 25px rgba(118,75,162,.35), inset 0 2px 0 rgba(255,255,255,.4), inset 0 -3px 0 rgba(0,0,0,.15); transition: .3s; }
.otp-root .verify-btn:hover { transform: translateY(-3px); }
.otp-root .verify-btn:disabled { opacity:.7; cursor:not-allowed; }
.otp-root .resend { margin-top: 10px; }
.otp-root .timer { margin-top:15px; font-size:14px; color:#6b7280; }
.otp-root .back-link { display:block; margin-top: 15px; font-size:14px; color:#4b5563; text-decoration:none; }
.otp-root .back-link:hover { color:#764ba2; }
@media (max-width: 480px) { .otp-root .otp-box input { width: 40px; height: 48px; font-size: 18px; } }
`;

export default VerifyOtp;
