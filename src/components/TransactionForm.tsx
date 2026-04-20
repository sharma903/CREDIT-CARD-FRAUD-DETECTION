import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MERCHANTS, MIN_AMOUNT, MAX_AMOUNT, formatTime12 } from "@/lib/fraud-engine";
import { MapPin, Clock } from "lucide-react";

export interface TransactionFormData {
  cardholderName: string;
  cardNumber: string;
  expiry: string;
  cvv: string;
  merchantName: string;
  productName: string;
  amount: number;
  location: string;
}

interface Props {
  onChange: (data: Partial<TransactionFormData>) => void;
  onCvvFocus: (focused: boolean) => void;
  onSubmit: (data: TransactionFormData) => void;
  location: string;
}

export function TransactionForm({ onChange, onCvvFocus, onSubmit, location }: Props) {
  const [cardholderName, setCardholderName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [merchantName, setMerchantName] = useState("");
  const [productName, setProductName] = useState("");
  const [amount, setAmount] = useState<string>("");
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    onChange({ cardholderName, cardNumber, expiry, cvv });
  }, [cardholderName, cardNumber, expiry, cvv, onChange]);

  function handleCardNumber(v: string) {
    const digits = v.replace(/\D/g, "").slice(0, 16);
    setCardNumber(digits);
  }

  function handleExpiry(v: string) {
    const digits = v.replace(/\D/g, "").slice(0, 4);
    if (digits.length >= 3) {
      setExpiry(`${digits.slice(0, 2)}/${digits.slice(2)}`);
    } else {
      setExpiry(digits);
    }
  }

  function handleCvv(v: string) {
    setCvv(v.replace(/\D/g, "").slice(0, 4));
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const amt = Number(amount);
    if (!cardholderName || cardNumber.length !== 16 || !expiry || cvv.length < 3) return;
    if (!merchantName || !productName || isNaN(amt) || amt < MIN_AMOUNT || amt > MAX_AMOUNT) return;

    onSubmit({
      cardholderName,
      cardNumber,
      expiry,
      cvv,
      merchantName,
      productName,
      amount: amt,
      location,
    });
  }

  return (
    <form onSubmit={submit} className="space-y-5">
      {/* Live time + location */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 rounded-lg bg-secondary/50 border border-border">
        <div className="flex items-center gap-2 text-sm">
          <Clock className="w-4 h-4 text-primary" />
          <span className="text-muted-foreground">Live time:</span>
          <span className="font-mono font-semibold">{formatTime12(now)}</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <MapPin className="w-4 h-4 text-primary" />
          <span className="text-muted-foreground">Location:</span>
          <span className="font-medium truncate">{location}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <Label htmlFor="ch-name">Cardholder Name</Label>
          <Input id="ch-name" value={cardholderName} onChange={(e) => setCardholderName(e.target.value)} placeholder="John Doe" maxLength={26} required />
        </div>

        <div className="sm:col-span-2">
          <Label htmlFor="card-no">Card Number</Label>
          <Input id="card-no" value={cardNumber.replace(/(.{4})/g, "$1 ").trim()} onChange={(e) => handleCardNumber(e.target.value)} placeholder="1234 5678 9012 3456" inputMode="numeric" required />
        </div>

        <div>
          <Label htmlFor="exp">Expiry</Label>
          <Input id="exp" value={expiry} onChange={(e) => handleExpiry(e.target.value)} placeholder="MM/YY" inputMode="numeric" required />
        </div>

        <div>
          <Label htmlFor="cvv">CVV</Label>
          <Input
            id="cvv"
            type="password"
            value={cvv}
            onChange={(e) => handleCvv(e.target.value)}
            onFocus={() => onCvvFocus(true)}
            onBlur={() => onCvvFocus(false)}
            placeholder="123"
            inputMode="numeric"
            maxLength={4}
            required
          />
        </div>
      </div>

      <div className="border-t border-border pt-5 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label>Merchant</Label>
            <Select value={merchantName} onValueChange={setMerchantName}>
              <SelectTrigger><SelectValue placeholder="Select merchant" /></SelectTrigger>
              <SelectContent>
                {MERCHANTS.map((m) => (
                  <SelectItem key={m.name} value={m.name}>
                    <div className="flex items-center gap-2">
                      <span className={
                        m.riskLevel === "high" ? "w-2 h-2 rounded-full bg-destructive" :
                        m.riskLevel === "medium" ? "w-2 h-2 rounded-full bg-warning" :
                        "w-2 h-2 rounded-full bg-success"
                      } />
                      <span>{m.name}</span>
                      <span className="text-xs text-muted-foreground">· {m.category}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="product">Product Name</Label>
            <Input id="product" value={productName} onChange={(e) => setProductName(e.target.value)} placeholder="e.g. iPhone 15 Pro" maxLength={60} required />
          </div>

          <div className="sm:col-span-2">
            <Label htmlFor="amount">Amount (USD) — min ${MIN_AMOUNT}, max ${MAX_AMOUNT.toLocaleString()}</Label>
            <Input
              id="amount"
              type="number"
              min={MIN_AMOUNT}
              max={MAX_AMOUNT}
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="125.00"
              required
            />
          </div>
        </div>

        <Button type="submit" className="w-full gradient-primary text-primary-foreground font-semibold shadow-glow hover:opacity-90 h-11">
          Analyze Transaction
        </Button>
      </div>
    </form>
  );
}
