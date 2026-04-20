import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import logo from "/logo.png";

const Landing = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  const isHovering = useRef(false);

  useEffect(() => {
    document.title = "SecureGuard – Next-Gen Fraud Detection";
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const container = triggerRef.current;
    const card = cardRef.current;
    const glow = glowRef.current;
    if (!container || !card || !glow) return;

    const onMove = (e: MouseEvent) => {
      isHovering.current = true;
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const cx = rect.width / 2;
      const cy = rect.height / 2;
      const rotateX = (y - cy) / 10;
      const rotateY = (cx - x) / 10;
      card.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.05)`;
      glow.style.setProperty("--x", `${(x / rect.width) * 100}%`);
      glow.style.setProperty("--y", `${(y / rect.height) * 100}%`);
    };
    const onLeave = () => {
      isHovering.current = false;
      card.style.transform = `rotateX(0deg) rotateY(0deg) scale(1)`;
    };
    container.addEventListener("mousemove", onMove);
    container.addEventListener("mouseleave", onLeave);
    return () => {
      container.removeEventListener("mousemove", onMove);
      container.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  return (
    <div className="font-sans antialiased text-[#F8FAFC] bg-[#0B1120] min-h-screen overflow-x-hidden">
      <style>{`
        .lp-glass { background: rgba(30,41,59,0.7); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); border: 1px solid rgba(255,255,255,0.1); }
        .lp-hero-grad { background: radial-gradient(circle at 50% 50%, rgba(37,99,235,0.15) 0%, rgba(11,17,32,0) 70%); }
        .lp-card-inner { background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%); border: 1px solid rgba(255,255,255,0.1); box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5); transform: translateZ(30px); }
        .lp-card-glow { position:absolute; inset:0; background: radial-gradient(circle at var(--x) var(--y), rgba(56,189,248,0.2) 0%, transparent 60%); pointer-events:none; border-radius:inherit; }
        .lp-highlight { background: linear-gradient(90deg, #38BDF8, #00F0FF); background-clip: text; -webkit-text-fill-color: transparent; font-weight: 800; }
        .lp-nav-link { position: relative; }
        .lp-nav-link::after { content:''; position:absolute; width:0; height:2px; bottom:-4px; left:0; background:#38BDF8; transition: width .3s ease; }
        .lp-nav-link:hover::after { width: 100%; }
        .lp-display { font-family: 'Poppins', sans-serif; }
        .lp-perspective { perspective: 1000px; }
        .lp-card-3d { transition: transform 0.1s ease-out; transform-style: preserve-3d; will-change: transform; }
      `}</style>

      <header className={`fixed top-0 w-full z-[100] transition-all duration-500 lp-glass border-b border-white/5 ${scrolled ? "py-2" : "py-4"}`}>
        <nav className="container mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-2 group cursor-pointer">
            <img src={logo} alt="SecureGuard" className="w-10 h-10 rounded-lg group-hover:rotate-12 transition-transform" />
            <span className="lp-display font-bold text-2xl tracking-tight">Secure<span className="text-[#38BDF8]">Guard</span></span>
          </div>
          <div className="hidden md:flex items-center gap-10 font-medium text-sm uppercase tracking-widest text-[#94A3B8]">
            <a href="#home" className="lp-nav-link text-[#F8FAFC]">Home</a>
            <a href="#protocol" className="lp-nav-link hover:text-[#F8FAFC] transition-colors">Protocol</a>
            <a href="#monitoring" className="lp-nav-link hover:text-[#F8FAFC] transition-colors">Live Analytics</a>
            <a href="#contact" className="lp-nav-link hover:text-[#F8FAFC] transition-colors">Contact</a>
            <Link to="/auth" className="px-5 py-2 bg-[#2563EB] text-white rounded-full hover:bg-blue-600 transition-all transform hover:-translate-y-0.5">Sign in</Link>
          </div>
          <button className="md:hidden text-2xl" onClick={() => setMenuOpen(!menuOpen)} aria-label="Menu">
            <i className="fa-solid fa-bars" />
          </button>
        </nav>
      </header>

      {menuOpen && (
        <div className="fixed inset-0 z-[110] bg-[#0B1120]/95 backdrop-blur-xl flex flex-col items-center justify-center gap-8 text-2xl lp-display">
          <button className="absolute top-6 right-6 text-3xl" onClick={() => setMenuOpen(false)} aria-label="Close menu"><i className="fa-solid fa-xmark" /></button>
          <a href="#home" onClick={() => setMenuOpen(false)}>Home</a>
          <a href="#protocol" onClick={() => setMenuOpen(false)}>Protocol</a>
          <a href="#monitoring" onClick={() => setMenuOpen(false)}>Analytics</a>
          <a href="#contact" onClick={() => setMenuOpen(false)} className="text-[#38BDF8]">Contact</a>
          <Link to="/auth" onClick={() => setMenuOpen(false)} className="px-6 py-3 bg-[#2563EB] rounded-full text-base">Sign in</Link>
        </div>
      )}

      <main>
        <section id="home" className="relative min-h-screen flex flex-col items-center justify-center pt-20 overflow-hidden">
          <div className="absolute inset-0 lp-hero-grad" />
          <div className="container mx-auto px-6 relative z-10 flex flex-col lg:flex-row items-center gap-16">
            <div className="lg:w-1/2 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-[#38BDF8] text-xs font-bold uppercase tracking-widest mb-6">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#38BDF8] opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#38BDF8]" />
                </span>
                System Online: 99.9% Defense rate
              </div>
              <h1 className="text-5xl lg:text-7xl lp-display font-extrabold leading-tight mb-6">
                Next-Gen <span className="lp-highlight">Fraud Detection</span>
              </h1>
              <p className="text-[#94A3B8] text-lg lg:text-xl mb-10 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                Protecting your financial assets with AI-driven, real-time transaction monitoring and predictive threat analysis. Experience the future of secure banking.
              </p>
              <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
                <Link to="/auth" className="px-8 py-4 bg-[#2563EB] hover:bg-blue-600 text-white rounded-xl font-bold transition-all transform hover:-translate-y-1 shadow-lg shadow-blue-500/20 flex items-center gap-2">
                  Get Started <i className="fa-solid fa-arrow-right" />
                </Link>
                <a href="#protocol" className="px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl font-bold transition-all flex items-center gap-2">
                  Learn More <i className="fa-solid fa-chevron-right text-xs" />
                </a>
              </div>
            </div>

            <div className="lg:w-1/2 lp-perspective py-10" ref={triggerRef}>
              <div ref={cardRef} className="lp-card-3d relative w-[320px] h-[200px] sm:w-[420px] sm:h-[260px] mx-auto">
                <div className="lp-card-inner w-full h-full rounded-2xl p-8 flex flex-col justify-between relative overflow-hidden">
                  <div ref={glowRef} className="lp-card-glow" />
                  <div className="flex justify-between items-start relative z-10">
                    <div className="w-12 h-10 bg-gradient-to-br from-amber-400 to-amber-600 rounded-md flex items-center justify-center">
                      <i className="fa-solid fa-microchip text-2xl text-black/40" />
                    </div>
                    <i className="fa-brands fa-cc-visa text-5xl text-white opacity-80" />
                  </div>
                  <div className="relative z-10">
                    <p className="text-xl sm:text-2xl font-mono tracking-[0.2em] text-white/90">7894 7896 7854 4920</p>
                  </div>
                  <div className="flex justify-between items-end relative z-10">
                    <div>
                      <p className="text-[10px] uppercase tracking-widest text-[#94A3B8] mb-1">Card Holder</p>
                      <p className="text-sm sm:text-lg font-medium tracking-wide uppercase">Nihal Sharma</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] uppercase tracking-widest text-[#94A3B8] mb-1">Expires</p>
                      <p className="text-sm sm:text-lg font-medium tracking-wide">12/28</p>
                    </div>
                  </div>
                  <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#38BDF8]/10 rounded-full blur-3xl" />
                  <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-[#2563EB]/20 rounded-full blur-3xl" />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="protocol" className="py-24 bg-[#0B1120] relative overflow-hidden">
          <div className="container mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-4xl lg:text-5xl lp-display font-bold mb-4">Incident Response <span className="text-[#38BDF8]">Protocol</span></h2>
              <p className="text-[#94A3B8] max-w-2xl mx-auto">Immediate steps to take if you suspect fraudulent activity. Every second counts.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { icon: "fa-lock", title: "1. Freeze Your Card", desc: "Instantly block all transactions via our mobile app or web portal to prevent further loss." },
                { icon: "fa-phone-volume", title: "2. Contact Support", desc: "Reach our dedicated 24/7 fraud team. We use voice biometrics to verify your identity instantly." },
                { icon: "fa-file-shield", title: "3. Review Activity", desc: "Audit recent statements. Our ML models help identify unauthorized actions for chargebacks." },
              ].map((s) => (
                <div key={s.title} className="lp-glass p-10 rounded-3xl group hover:border-[#38BDF8]/50 transition-all duration-500">
                  <div className="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                    <i className={`fa-solid ${s.icon} text-3xl text-[#38BDF8]`} />
                  </div>
                  <h3 className="text-2xl lp-display font-bold mb-4">{s.title}</h3>
                  <p className="text-[#94A3B8] leading-relaxed">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="monitoring" className="py-24 bg-slate-900/30">
          <div className="container mx-auto px-6">
            <div className="flex flex-col lg:flex-row items-end justify-between mb-12 gap-6">
              <div className="max-w-xl">
                <h2 className="text-4xl lg:text-5xl lp-display font-bold mb-4">Live Threat <span className="text-[#38BDF8]">Monitoring</span></h2>
                <p className="text-[#94A3B8]">Real-time analysis of transaction anomalies globally. 10,000+ transactions per second.</p>
              </div>
              <div className="flex items-center gap-4 bg-[#1E293B] border border-white/5 p-4 rounded-2xl">
                <div className="text-right">
                  <p className="text-[10px] text-[#94A3B8] uppercase tracking-tighter">Current Threat Level</p>
                  <p className="text-[#10B981] font-bold">LOW RISK</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-[#10B981]/20 flex items-center justify-center">
                  <i className="fa-solid fa-shield-halved text-[#10B981]" />
                </div>
              </div>
            </div>
            <div className="lp-glass rounded-3xl p-6 lg:p-10">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                  <div className="w-3 h-3 bg-[#38BDF8] rounded-full animate-pulse" />
                  <h4 className="font-bold text-lg">Fraud Anomalies Detected (Global)</h4>
                </div>
                <Link to="/auth" className="px-5 py-2 bg-[#38BDF8] text-[#0B1120] rounded-lg text-sm font-bold hover:bg-cyan-300 transition-colors">Open Dashboard →</Link>
              </div>
              <div className="h-[300px] lg:h-[450px] w-full flex items-center justify-center text-[#94A3B8] border border-white/5 rounded-2xl bg-black/20">
                <div className="text-center px-6">
                  <i className="fa-solid fa-chart-line text-5xl text-[#38BDF8] mb-4" />
                  <p className="text-lg lp-display font-semibold mb-2">Sign in to view the live dashboard</p>
                  <p className="text-sm">Real-time fraud analytics, transaction history & ML risk scoring.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="contact" className="py-24 relative">
          <div className="container mx-auto px-6">
            <div className="max-w-5xl mx-auto lp-glass rounded-[2.5rem] overflow-hidden flex flex-col lg:flex-row">
              <div className="lg:w-2/5 p-10 lg:p-14 bg-[#2563EB] relative overflow-hidden">
                <div className="relative z-10">
                  <h2 className="text-4xl lp-display font-bold mb-6">Report an Issue</h2>
                  <p className="text-blue-100 mb-10 leading-relaxed">Our security analysts are ready to investigate any suspicious activity. Reach us directly:</p>
                  <div className="space-y-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center"><i className="fa-solid fa-envelope" /></div>
                      <span>nihalsharma967@gmail.com</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center"><i className="fa-solid fa-phone" /></div>
                      <span>+91-9039815061</span>
                    </div>
                  </div>
                </div>
                <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-white/10 rounded-full" />
              </div>
              <div className="lg:w-3/5 p-10 lg:p-14">
                <h3 className="lp-display font-bold text-2xl mb-6">Get protected in seconds</h3>
                <p className="text-[#94A3B8] mb-8">Create your free SecureGuard account and start monitoring transactions in real-time with AI-driven fraud detection.</p>
                <Link to="/auth" className="inline-flex w-full bg-[#38BDF8] hover:bg-cyan-400 text-[#0B1120] font-bold py-4 rounded-xl transition-all items-center justify-center gap-3">
                  <span>Create your account</span>
                  <i className="fa-solid fa-arrow-right" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        <footer className="py-8 text-center text-[#94A3B8] text-sm border-t border-white/5">
          © {new Date().getFullYear()} SecureGuard · AI Fraud Detection
        </footer>
      </main>
    </div>
  );
};

export default Landing;
