import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MERCHANTS, MERCHANT_PRODUCTS, MIN_AMOUNT, MAX_AMOUNT } from "@/lib/fraud-engine";

export interface TransactionFormData {
  cardholderName: string;
  cardNumber: string;
  expiry: string;
  cvv: string;
  merchantName: string;
  productName: string;
  amount: number;
  location: string;
  timestamp: Date;
}

interface Props {
  onChange: (data: Partial<TransactionFormData>) => void;
  onCvvFocus: (focused: boolean) => void;
  onSubmit: (data: TransactionFormData) => void;
}

const LOCATION_OPTIONS = [
  "Mumbai, India",
  "Delhi, India",
  "Bengaluru, India",
  "Chennai, India",
  "Kolkata, India",
  "Hyderabad, India",
  "Foreign / Unknown",
];

function pad(n: number) {
  return n.toString().padStart(2, "0");
}
function defaultDateStr() {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}
function defaultTimeStr() {
  const d = new Date();
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function TransactionForm({ onChange, onCvvFocus, onSubmit }: Props) {
  const [cardholderName, setCardholderName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [merchantName, setMerchantName] = useState("");
  const [productName, setProductName] = useState("");
  const [amount, setAmount] = useState<string>("");
  const [date, setDate] = useState<string>(defaultDateStr());
  const [time, setTime] = useState<string>(defaultTimeStr());
  const [location, setLocation] = useState<string>("Mumbai, India");

  useEffect(() => {
    onChange({ cardholderName, cardNumber, expiry, cvv });
  }, [cardholderName, cardNumber, expiry, cvv, onChange]);

  // Reset product when merchant changes
  useEffect(() => {
    setProductName("");
  }, [merchantName]);

  const productOptions = merchantName ? MERCHANT_PRODUCTS[merchantName] ?? [] : [];

  function handleCardNumber(v: string) {
    setCardNumber(v.replace(/\D/g, "").slice(0, 16));
  }
  function handleExpiry(v: string) {
    const digits = v.replace(/\D/g, "").slice(0, 4);
    setExpiry(digits.length >= 3 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits);
  }
  function handleCvv(v: string) {
    setCvv(v.replace(/\D/g, "").slice(0, 4));
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const amt = Number(amount);
    if (!cardholderName || cardNumber.length !== 16 || !expiry || cvv.length < 3) return;
    if (!merchantName || !productName || isNaN(amt) || amt < MIN_AMOUNT || amt > MAX_AMOUNT) return;
    if (!date || !time) return;

    const [yy, mm, dd] = date.split("-").map(Number);
    const [hh, mi] = time.split(":").map(Number);
    const ts = new Date(yy, (mm ?? 1) - 1, dd ?? 1, hh ?? 0, mi ?? 0, 0);

    onSubmit({
      cardholderName,
      cardNumber,
      expiry,
      cvv,
      merchantName,
      productName,
      amount: amt,
      location,
      timestamp: ts,
    });
  }

  return (
    <form onSubmit={submit} className="space-y-5">
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
            <Label>Product</Label>
            <Select value={productName} onValueChange={setProductName} disabled={!merchantName}>
              <SelectTrigger>
                <SelectValue placeholder={merchantName ? "Select product" : "Select merchant first"} />
              </SelectTrigger>
              <SelectContent>
                {productOptions.map((p) => (
                  <SelectItem key={p} value={p}>{p}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="sm:col-span-2">
            <Label htmlFor="amount">Amount (₹) — limit ₹{MAX_AMOUNT.toLocaleString("en-IN")}</Label>
            <Input
              id="amount"
              type="number"
              min={MIN_AMOUNT}
              max={MAX_AMOUNT}
              step="1"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="1500"
              required
            />
          </div>

          <div>
            <Label htmlFor="tx-date">Transaction Date</Label>
            <Input id="tx-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
          </div>

          <div>
            <Label htmlFor="tx-time">Transaction Time</Label>
            <Input id="tx-time" type="time" value={time} onChange={(e) => setTime(e.target.value)} required />
          </div>

          <div className="sm:col-span-2">
            <Label>Location</Label>
            <Select value={location} onValueChange={setLocation}>
              <SelectTrigger><SelectValue placeholder="Select location" /></SelectTrigger>
              <SelectContent>
                {LOCATION_OPTIONS.map((l) => (
                  <SelectItem key={l} value={l}>{l}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button type="submit" className="w-full gradient-primary text-primary-foreground font-semibold shadow-glow hover:opacity-90 h-11">
          Analyze Transaction
        </Button>
      </div>
    </form>
  );
}
