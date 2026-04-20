import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Success = () => {
  const navigate = useNavigate();
  useEffect(() => {
    document.title = "Success – SecureGuard";
    const t = setTimeout(() => navigate("/reset-password", { replace: true }), 2000);
    return () => clearTimeout(t);
  }, [navigate]);

  return (
    <div className="ok-root">
      <style>{`
        .ok-root { background: linear-gradient(135deg, #1e293b, #0f172a); display:flex; justify-content:center; align-items:center; min-height:100vh; font-family:'Poppins',sans-serif; padding: 20px; }
        .ok-root *, .ok-root *::before, .ok-root *::after { box-sizing: border-box; }
        .ok-root .success-box { background:white; padding: 50px; border-radius: 20px; text-align:center; box-shadow: 0 25px 60px rgba(0,0,0,.2), inset 0 3px 6px rgba(255,255,255,.6); }
        .ok-root .checkmark { width: 80px; height: 80px; border-radius: 50%; background: linear-gradient(135deg, #22c55e, #16a34a); display:flex; justify-content:center; align-items:center; margin: 0 auto 20px; animation: pop .4s ease; }
        .ok-root .checkmark i { color:white; font-size: 32px; }
        @keyframes pop { 0%{transform:scale(0)} 100%{transform:scale(1)} }
        .ok-root h2 { margin-bottom: 10px; color:#1f2937; font-weight:700; }
        .ok-root p { color:#6b7280; }
      `}</style>
      <div className="success-box">
        <div className="checkmark"><i className="fas fa-check" /></div>
        <h2>Verified Successfully</h2>
        <p>Your OTP has been verified</p>
      </div>
    </div>
  );
};

export default Success;
