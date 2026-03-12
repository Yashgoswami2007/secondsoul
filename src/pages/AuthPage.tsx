import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { Phone, ArrowLeft, ArrowRight, RefreshCw } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// Google SVG icon
const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" aria-hidden="true">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
  </svg>
);

type Step = "landing" | "otp-sent" | "success";

const AuthPage = () => {
  const { user, signInWithGoogle, sendOtp, verifyOtp } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string })?.from || "/account";

  const [step, setStep] = useState<Step>("landing");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  // If already logged in, redirect immediately
  useEffect(() => {
    if (user) navigate(from, { replace: true });
  }, [user]);

  // Countdown timer for OTP resend
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  // ── Phone number formatter ─────────────────
  const formatPhone = (raw: string) => {
    const digits = raw.replace(/\D/g, "");
    return digits.startsWith("91") ? `+${digits}` : `+91${digits}`;
  };

  // ── Send OTP ───────────────────────────────
  const handleSendOtp = async () => {
    setError("");
    const digits = phone.replace(/\D/g, "");
    if (digits.length < 10) {
      setError("Please enter a valid 10-digit mobile number.");
      return;
    }
    setLoading(true);
    const { error } = await sendOtp(formatPhone(phone));
    setLoading(false);
    if (error) {
      setError(error);
      return;
    }
    setStep("otp-sent");
    setCountdown(60);
    setTimeout(() => otpRefs.current[0]?.focus(), 100);
  };

  // ── OTP box input handling ─────────────────
  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d?$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 5) otpRefs.current[index + 1]?.focus();
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted.length === 6) {
      setOtp(pasted.split(""));
      otpRefs.current[5]?.focus();
    }
  };

  // ── Verify OTP ─────────────────────────────
  const handleVerifyOtp = async () => {
    setError("");
    const token = otp.join("");
    if (token.length < 6) {
      setError("Please enter the complete 6-digit code.");
      return;
    }
    setLoading(true);
    const { error } = await verifyOtp(formatPhone(phone), token);
    setLoading(false);
    if (error) {
      setError("Invalid or expired OTP. Please try again.");
      setOtp(["", "", "", "", "", ""]);
      otpRefs.current[0]?.focus();
      return;
    }
    setStep("success");
    setTimeout(() => navigate(from, { replace: true }), 1500);
  };

  // ── Resend OTP ─────────────────────────────
  const handleResend = async () => {
    setOtp(["", "", "", "", "", ""]);
    setError("");
    await sendOtp(formatPhone(phone));
    setCountdown(60);
    otpRefs.current[0]?.focus();
  };

  return (
    <div className="min-h-screen flex">
      {/* ── Left panel: branding (desktop only) ── */}
      <div className="hidden lg:flex w-1/2 bg-foreground relative items-center justify-center overflow-hidden">
        {/* Decorative blobs */}
        <div className="absolute w-96 h-96 rounded-full bg-[#FFD166]/5 -top-20 -left-20" />
        <div className="absolute w-72 h-72 rounded-full bg-[#FFD166]/5 bottom-10 right-10" />

        <div className="relative z-10 px-16 text-center">
          <Link to="/" className="flex items-center gap-2 text-secondary/40 hover:text-secondary/70 transition-colors text-xs font-body mb-16 justify-center">
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Store
          </Link>
          <h1 className="font-heading text-6xl font-bold text-secondary leading-tight mb-4">
            SECOND<br />
            <span className="italic font-normal text-[#FFE8B3]">Soul</span>
          </h1>
          <p className="font-body text-secondary/50 text-sm max-w-xs mx-auto leading-relaxed">
            Give clothes a second life. Sustainable thrift fashion curated for unique souls.
          </p>

          <div className="mt-16 flex flex-col gap-4 text-left">
            {[
              { icon: "♻️", text: "Sustainable pre-loved fashion" },
              { icon: "🛍️", text: "Curated vintage & streetwear" },
              { icon: "✨", text: "Each piece, one of a kind" },
            ].map((item) => (
              <div key={item.text} className="flex items-center gap-3">
                <span className="text-lg">{item.icon}</span>
                <span className="font-body text-xs text-secondary/40">{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right panel: form ── */}
      <div className="flex-1 flex items-center justify-center p-6 bg-background">
        <div className="w-full max-w-sm">

          {/* Mobile back link */}
          <Link to="/" className="flex lg:hidden items-center gap-1.5 text-xs font-body text-muted-foreground hover:text-foreground transition-colors mb-8">
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Store
          </Link>

          {/* ─── LANDING STEP ─── */}
          {step === "landing" && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <h2 className="font-heading text-3xl font-bold text-foreground">Welcome back</h2>
                <p className="font-body text-sm text-muted-foreground mt-2">
                  Sign in or create your account to continue.
                </p>
              </div>

              {/* Google button */}
              <Button
                variant="outline"
                className="w-full gap-3 h-12 font-body font-medium text-sm border-border hover:bg-secondary/5"
                onClick={signInWithGoogle}
              >
                <GoogleIcon />
                Continue with Google
              </Button>

              {/* Divider */}
              <div className="flex items-center gap-3">
                <div className="flex-grow h-px bg-border" />
                <span className="font-body text-xs text-muted-foreground">or use your mobile</span>
                <div className="flex-grow h-px bg-border" />
              </div>

              {/* Phone input */}
              <div className="space-y-3">
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2 pointer-events-none">
                    <span className="text-sm">🇮🇳</span>
                    <span className="font-body text-sm text-muted-foreground">+91</span>
                    <div className="w-px h-4 bg-border" />
                  </div>
                  <Input
                    type="tel"
                    inputMode="numeric"
                    maxLength={10}
                    value={phone}
                    onChange={(e) => { setPhone(e.target.value.replace(/\D/g, "")); setError(""); }}
                    placeholder="Mobile number"
                    className="pl-20 h-12 font-body text-sm"
                    onKeyDown={(e) => e.key === "Enter" && handleSendOtp()}
                  />
                </div>

                {error && <p className="font-body text-xs text-red-500">{error}</p>}

                <Button
                  className="w-full h-12 bg-[#FFD166] text-black hover:bg-[#FFD166]/90 font-bold gap-2"
                  onClick={handleSendOtp}
                  disabled={loading}
                >
                  {loading ? (
                    <div className="w-4 h-4 rounded-full border-2 border-black border-t-transparent animate-spin" />
                  ) : (
                    <>
                      <Phone className="w-4 h-4" />
                      Send OTP
                    </>
                  )}
                </Button>
              </div>

              <p className="font-body text-[11px] text-muted-foreground text-center leading-relaxed">
                By continuing, you agree to our Terms of Service and Privacy Policy.
              </p>
            </div>
          )}

          {/* ─── OTP STEP ─── */}
          {step === "otp-sent" && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <button
                  onClick={() => { setStep("landing"); setOtp(["","","","","",""]); setError(""); }}
                  className="flex items-center gap-1.5 text-xs font-body text-muted-foreground hover:text-foreground transition-colors mb-6"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Change number
                </button>
                <h2 className="font-heading text-3xl font-bold text-foreground">Enter OTP</h2>
                <p className="font-body text-sm text-muted-foreground mt-2">
                  Sent to <span className="text-foreground font-medium">+91 {phone}</span>
                </p>
              </div>

              {/* 6-box OTP input */}
              <div className="flex gap-3 justify-between" onPaste={handleOtpPaste}>
                {otp.map((digit, i) => (
                  <input
                    key={i}
                    ref={(el) => { otpRefs.current[i] = el; }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(i, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(i, e)}
                    className="w-12 h-14 rounded-lg border border-border bg-card text-center font-heading text-xl font-bold text-foreground focus:outline-none focus:border-[#FFD166] focus:ring-2 focus:ring-[#FFD166]/20 transition-all"
                  />
                ))}
              </div>

              {error && <p className="font-body text-xs text-red-500">{error}</p>}

              <Button
                className="w-full h-12 bg-[#FFD166] text-black hover:bg-[#FFD166]/90 font-bold gap-2"
                onClick={handleVerifyOtp}
                disabled={loading || otp.join("").length < 6}
              >
                {loading ? (
                  <div className="w-4 h-4 rounded-full border-2 border-black border-t-transparent animate-spin" />
                ) : (
                  <>
                    Verify & Continue
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </Button>

              {/* Resend */}
              <div className="text-center">
                {countdown > 0 ? (
                  <p className="font-body text-xs text-muted-foreground">
                    Resend OTP in <span className="text-foreground font-medium">{countdown}s</span>
                  </p>
                ) : (
                  <button
                    onClick={handleResend}
                    className="font-body text-xs text-[#FFD166] hover:underline flex items-center gap-1.5 mx-auto"
                  >
                    <RefreshCw className="w-3 h-3" />
                    Resend OTP
                  </button>
                )}
              </div>
            </div>
          )}

          {/* ─── SUCCESS STEP ─── */}
          {step === "success" && (
            <div className="text-center space-y-4 animate-fade-in">
              <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto">
                <span className="text-3xl">✓</span>
              </div>
              <h2 className="font-heading text-2xl font-bold text-foreground">You're in!</h2>
              <p className="font-body text-sm text-muted-foreground">Signing you in…</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
