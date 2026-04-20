import { motion } from "framer-motion";
import { Wifi } from "lucide-react";
import { useState } from "react";

interface CreditCardProps {
  cardholderName: string;
  cardNumber: string;
  expiry: string;
  cvv: string;
  flipped: boolean;
}

function formatCardNumber(num: string): string {
  const cleaned = num.replace(/\D/g, "").padEnd(16, "•").slice(0, 16);
  return cleaned.match(/.{1,4}/g)?.join("  ") ?? "•••• •••• •••• ••••";
}

export function CreditCard({ cardholderName, cardNumber, expiry, cvv, flipped }: CreditCardProps) {
  const displayName = (cardholderName || "CARDHOLDER NAME").toUpperCase();
  const displayExpiry = expiry || "MM/YY";
  const displayCvv = (cvv || "•••").padEnd(3, "•").slice(0, 4);
  const [manualFlip, setManualFlip] = useState(false);
  const isFlipped = flipped || manualFlip;

  return (
    <div className="perspective-1000 w-full max-w-[420px] mx-auto">
      <motion.div
        className="relative w-full aspect-[1.586/1] preserve-3d cursor-pointer"
        onClick={() => setManualFlip((f) => !f)}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
      >
        {/* FRONT */}
        <div className="absolute inset-0 backface-hidden rounded-2xl shadow-card overflow-hidden gradient-card border border-primary/30">
          {/* Glow accents */}
          <div className="absolute -top-20 -right-20 w-60 h-60 bg-primary/30 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-primary-glow/20 rounded-full blur-3xl" />
          {/* Subtle grid */}
          <div
            className="absolute inset-0 opacity-[0.06]"
            style={{
              backgroundImage:
                "linear-gradient(hsl(var(--primary-glow)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--primary-glow)) 1px, transparent 1px)",
              backgroundSize: "24px 24px",
            }}
          />

          <div className="relative h-full p-6 flex flex-col justify-between text-white">
            {/* Top row: chip + contactless */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                {/* Realistic chip */}
                <div className="w-12 h-9 rounded-md chip-pattern shadow-md ring-1 ring-yellow-700/40" />
                <Wifi className="w-6 h-6 rotate-90 opacity-80" />
              </div>
              <div className="text-right">
                <div className="text-[10px] uppercase tracking-widest text-primary-glow/80 font-display">SecureGuard</div>
                <div className="text-xs font-semibold">PLATINUM</div>
              </div>
            </div>

            {/* Card number */}
            <div className="font-mono text-xl md:text-2xl tracking-[0.2em] drop-shadow">
              {formatCardNumber(cardNumber)}
            </div>

            {/* Bottom row */}
            <div className="flex items-end justify-between">
              <div>
                <div className="text-[9px] uppercase tracking-wider text-white/60">Cardholder</div>
                <div className="font-display font-semibold text-sm md:text-base truncate max-w-[200px]">
                  {displayName}
                </div>
              </div>
              <div>
                <div className="text-[9px] uppercase tracking-wider text-white/60">Expires</div>
                <div className="font-mono text-sm">{displayExpiry}</div>
              </div>
              {/* VISA-style mark */}
              <div className="font-display italic font-bold text-2xl text-white/90">VISA</div>
            </div>
          </div>
        </div>

        {/* BACK */}
        <div className="absolute inset-0 backface-hidden rotate-y-180 rounded-2xl shadow-card overflow-hidden gradient-card border border-primary/30">
          <div className="relative h-full flex flex-col text-white">
            {/* Magnetic stripe */}
            <div className="w-full h-12 bg-black/80 mt-6" />

            <div className="px-6 mt-6 flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <div className="flex-1 h-10 bg-white/90 rounded flex items-center justify-end pr-3">
                  <span className="text-black font-mono text-lg tracking-widest">{displayCvv}</span>
                </div>
              </div>
              <div className="text-[10px] uppercase tracking-wider text-white/70">CVV / Security Code</div>
            </div>

            <div className="mt-auto p-6">
              <div className="text-[10px] text-white/50 leading-relaxed">
                This card is property of SecureGuard. Use is subject to fraud monitoring & terms of service.
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
