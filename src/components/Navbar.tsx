import logo from "@/assets/secureguard-logo.png";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

interface NavbarProps {
  userName: string;
  onLogout: () => void;
}

export function Navbar({ userName, onLogout }: NavbarProps) {
  const initial = (userName?.trim()?.[0] ?? "U").toUpperCase();
  return (
    <header className="sticky top-0 z-40 backdrop-blur-xl bg-background/70 border-b border-border">
      <div className="container flex items-center justify-between h-20">
        <div className="flex items-center gap-4">
          <img src={logo} alt="SecureGuard logo" width={44} height={44} className="drop-shadow-[0_0_12px_hsl(var(--primary)/0.6)]" />
          <div className="font-display text-2xl font-bold tracking-tight">
            <span className="text-[#22c55e]" style={{ textShadow: "0 0 20px rgba(34, 197, 94, 0.5)" }}>Secure</span>
            <span className="text-[#ef4444]">Guard</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex flex-col items-end leading-tight">
            <span className="text-xs text-muted-foreground">Signed in as</span>
            <span className="text-sm font-medium">{userName}</span>
          </div>
          <div
            className="w-11 h-11 rounded-full gradient-primary flex items-center justify-center font-display font-bold text-primary-foreground shadow-glow"
            aria-label={`User avatar for ${userName}`}
          >
            {initial}
          </div>
          <Button variant="outline" size="sm" onClick={onLogout} className="gap-2">
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Logout</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
