import { Button } from "@/components/ui/button";
import { BookOpen, CheckCircle2, Loader2, Users } from "lucide-react";
import FountainBackground from "./components/FountainBackground";
import GlassCard from "./components/GlassCard";
import { useInternetIdentity } from "./hooks/useInternetIdentity";

export default function LoginScreen() {
  const { login, isLoggingIn, loginError } = useInternetIdentity();

  return (
    <div
      className="min-h-screen flex flex-col relative overflow-hidden"
      style={{ background: "oklch(0.10 0.05 265)" }}
    >
      {/* Animated water particles */}
      <FountainBackground />

      {/* Gradient mesh overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% 0%, oklch(0.22 0.12 255 / 0.35) 0%, transparent 70%), " +
            "radial-gradient(ellipse 60% 40% at 80% 100%, oklch(0.18 0.10 240 / 0.25) 0%, transparent 60%)",
          zIndex: 1,
        }}
      />

      {/* Main content */}
      <div
        className="relative flex-1 flex flex-col items-center justify-center px-6 py-12"
        style={{ zIndex: 2 }}
      >
        <div className="w-full max-w-sm space-y-7">
          {/* Title section */}
          <div className="text-center space-y-4">
            <div>
              <h1
                className="text-3xl font-bold text-white"
                style={{
                  fontFamily: "Poppins, sans-serif",
                  letterSpacing: "-0.02em",
                }}
              >
                LAIA Foundation
              </h1>
              <p className="text-white/70 text-sm mt-1 font-medium">
                Attendance Management
              </p>
              <p
                className="text-white/50 text-xs mt-0.5"
                style={{ fontFamily: "Poppins, sans-serif" }}
              >
                வகுப்பு வருகை மேலாண்மை
              </p>
            </div>
          </div>

          {/* Features */}
          <div className="space-y-3">
            {[
              {
                icon: Users,
                en: "Village-wise student tracking",
                ta: "கிராம மாணவர் கண்காணிப்பு",
                delay: "stagger-1",
              },
              {
                icon: CheckCircle2,
                en: "Daily attendance with photo",
                ta: "தினசரி புகைப்பட வருகை",
                delay: "stagger-2",
              },
              {
                icon: BookOpen,
                en: "Central admin dashboard",
                ta: "மைய நிர்வாக பலகை",
                delay: "stagger-3",
              },
            ].map(({ icon: Icon, en, ta, delay }) => (
              <GlassCard
                key={en}
                hover
                className={`flex items-center gap-3 px-4 py-3 animate-slide-in-up opacity-0 ${delay}`}
              >
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: "oklch(0.56 0.18 240 / 0.25)" }}
                >
                  <Icon className="w-4 h-4 text-blue-300" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{en}</p>
                  <p className="text-xs text-white/50">{ta}</p>
                </div>
              </GlassCard>
            ))}
          </div>

          {/* Login Button */}
          <div className="space-y-3">
            <button
              type="button"
              data-ocid="auth.login_button"
              onClick={login}
              disabled={isLoggingIn}
              className="btn-gradient animate-pulse-glow w-full h-14 rounded-xl text-white font-bold text-base flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
              style={{ fontFamily: "Poppins, sans-serif" }}
            >
              {isLoggingIn ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Logging in...</span>
                </>
              ) : (
                "Login / உள்நுழைவு"
              )}
            </button>

            {loginError && (
              <p className="text-red-400 text-sm text-center">
                {loginError.message}
              </p>
            )}

            <p className="text-xs text-center text-white/35">
              Secure login via Internet Identity
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div
        className="relative text-center py-4 text-xs text-white/30"
        style={{ zIndex: 2 }}
      >
        LAIA Foundation &copy; {new Date().getFullYear()}. Built with love using{" "}
        <a
          href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(typeof window !== "undefined" ? window.location.hostname : "")}`}
          target="_blank"
          rel="noopener noreferrer"
          className="underline text-white/40 hover:text-white/60 transition-colors"
        >
          caffeine.ai
        </a>
      </div>
    </div>
  );
}
