import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import logo from "@/assets/secureguard-logo.png";
import { motion } from "framer-motion";

interface LoginProps {
  onLogin: (name: string) => void;
}

export function Login({ onLogin }: LoginProps) {
  const [name, setName] = useState("");

  useEffect(() => {
    document.title = "SecureGuard – AI Fraud Detection";
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
        className="w-full max-w-md gradient-card border border-primary/30 rounded-2xl p-8 shadow-card"
      >
        <div className="flex flex-col items-center text-center mb-8">
          <img src={logo} alt="SecureGuard" width={72} height={72} className="float drop-shadow-[0_0_24px_hsl(var(--primary)/0.7)]" />
          <h1 className="mt-4 font-display text-3xl font-bold">
            <span className="text-primary">Secure</span>Guard
          </h1>
          <p className="text-muted-foreground text-sm mt-2">AI-powered credit card fraud detection</p>
        </div>

        <form
          onSubmit={async (e) => {
  e.preventDefault();

  try {
    const res = await fetch("http://localhost:5000/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: name, // ⚠️ temporary (see note below)
        password: "123456", // ⚠️ temporary
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.error || "Login failed");
      return;
    }

    // ✅ STORE TOKEN + USER (THIS IS WHAT YOU ASKED)
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));

    // keep your existing flow
    onLogin(data.user.name);

  } catch (err) {
    console.error(err);
    alert("Server error");
  }
}}
          className="space-y-4"
        >
          <div>
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Alex Johnson"
              className="mt-1.5"
              required
              maxLength={60}
            />
          </div>
          <Button type="submit" className="w-full gradient-primary text-primary-foreground font-semibold shadow-glow hover:opacity-90">
            Enter Dashboard
          </Button>
        </form>
      </motion.div>
    </div>
  );
}
