import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldCheck,
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Sparkles,
  Plus,
  HelpCircle,
} from "lucide-react";

export default function Login() {
  const {
    user,
    loading,
    loginWithEmail,
    registerWithEmail,
    loginWithGoogle,
    triggerFirebaseGoogle,
    isFirebaseConfigured,
  } = useAuth();

  const [, navigate] = useLocation();

  // Mode: "login" | "register"
  const [mode, setMode] = useState("login");

  // Form states
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [agreeTerms, setAgreeTerms] = useState(false);

  // UI helpers
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Modals
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotSent, setForgotSent] = useState(false);

  const [showGoogleChooser, setShowGoogleChooser] = useState(false);
  const [customGoogleEmail, setCustomGoogleEmail] = useState("");
  const [customGoogleName, setCustomGoogleName] = useState("");
  const [showCustomGoogleInput, setShowCustomGoogleInput] = useState(false);

  // Auto redirect if already logged in
  useEffect(() => {
    if (!loading && user) {
      navigate("/");
    }
  }, [user, loading, navigate]);

  // Password strength calculation
  const getPasswordStrength = (pwd) => {
    if (!pwd) return { score: 0, label: "", color: "bg-slate-700" };
    let score = 0;
    if (pwd.length >= 6) score += 1;
    if (pwd.length >= 8) score += 1;
    if (/[A-Z]/.test(pwd)) score += 1;
    if (/[0-9]/.test(pwd) || /[^A-Za-z0-9]/.test(pwd)) score += 1;

    if (score <= 1) return { score: 25, label: "Weak", color: "bg-red-500" };
    if (score === 2) return { score: 50, label: "Fair", color: "bg-amber-500" };
    if (score === 3) return { score: 75, label: "Good", color: "bg-sky-500" };
    return { score: 100, label: "Strong", color: "bg-emerald-500" };
  };

  const pwdStrength = getPasswordStrength(password);

  // Submit Handler: Sign In or Register
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");

    if (!email || !password) {
      setError("Please fill in all required fields.");
      return;
    }

    if (mode === "register") {
      if (!name.trim()) {
        setError("Please enter your full name.");
        return;
      }
      if (password.length < 6) {
        setError("Password must be at least 6 characters long.");
        return;
      }
      if (password !== confirmPassword) {
        setError("Passwords do not match. Please re-enter.");
        return;
      }
      if (!agreeTerms) {
        setError("Please agree to the Terms of Service to continue.");
        return;
      }
    }

    setSubmitting(true);

    try {
      if (mode === "login") {
        await loginWithEmail(email, password);
        setSuccessMsg("Logged in successfully! Redirecting...");
        setTimeout(() => navigate("/"), 400);
      } else {
        await registerWithEmail(name, email, password);
        setSuccessMsg("Account created successfully! Welcome to SatyaCheck.");
        setTimeout(() => navigate("/"), 400);
      }
    } catch (err) {
      setError(err.message || "Authentication failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // Google Sign-In Handler
  const handleGoogleClick = async () => {
    setError("");
    setSubmitting(true);

    if (isFirebaseConfigured) {
      try {
        await triggerFirebaseGoogle();
        navigate("/");
      } catch (err) {
        if (err.code === "auth/popup-closed-by-user") {
          setError("Google popup was closed. Please try again.");
        } else {
          setShowGoogleChooser(true);
        }
      } finally {
        setSubmitting(false);
      }
    } else {
      setSubmitting(false);
      setShowGoogleChooser(true);
    }
  };

  // Handle Google account chosen
  const handleSelectGoogleAccount = async (profile) => {
    setSubmitting(true);
    try {
      await loginWithGoogle(profile);
      setShowGoogleChooser(false);
      navigate("/");
    } catch (err) {
      setError(err.message || "Failed to sign in with Google.");
    } finally {
      setSubmitting(false);
    }
  };

  // Demo Credentials Fill
  const handleQuickDemo = () => {
    setMode("login");
    setEmail("test.user@example.com");
    setPassword("password123");
    setError("");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-sky-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-slate-400">Loading SatyaCheck Auth…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 relative overflow-hidden py-10 px-4">
      {/* Background Ambient Glows */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-sky-500/20 rounded-full blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative z-10 w-full max-w-md"
      >
        {/* Main Auth Card */}
        <div className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl shadow-2xl overflow-hidden">
          
          {/* Header & Logo */}
          <div className="p-7 pb-5 flex flex-col items-center text-center">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-sky-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-sky-500/25 mb-3">
              <ShieldCheck className="w-8 h-8 text-white" strokeWidth={2.2} />
            </div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">
              Satya<span className="text-sky-400">Check</span>
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              AI-Powered Multimodal Disinformation Defense
            </p>

            {/* Auth Switcher Tabs */}
            <div className="grid grid-cols-2 p-1 bg-slate-900/70 border border-white/5 rounded-xl w-full mt-5">
              <button
                type="button"
                onClick={() => {
                  setMode("login");
                  setError("");
                }}
                className={`py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  mode === "login"
                    ? "bg-sky-600 text-white shadow-sm"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode("register");
                  setError("");
                }}
                className={`py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  mode === "register"
                    ? "bg-sky-600 text-white shadow-sm"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Create Account
              </button>
            </div>
          </div>

          <div className="px-7 pb-7">
            {/* Feedback Alerts */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 flex items-start gap-2.5 p-3 rounded-lg bg-red-500/10 border border-red-500/25 text-red-400 text-xs"
              >
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-400" />
                <span>{error}</span>
              </motion.div>
            )}

            {successMsg && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 flex items-center gap-2 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs"
              >
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                <span>{successMsg}</span>
              </motion.div>
            )}

            {/* Main Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Full Name field (Register only) */}
              {mode === "register" && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="space-y-1.5"
                >
                  <label className="text-[11px] font-medium text-slate-300 block">
                    Full Name <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      required
                      placeholder="Your Full Name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-slate-900/80 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-colors"
                    />
                  </div>
                </motion.div>
              )}

              {/* Email field */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-medium text-slate-300 block">
                  Email Address <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    required
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-900/80 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-colors"
                  />
                </div>
              </div>

              {/* Password field */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-medium text-slate-300">
                    Password <span className="text-red-400">*</span>
                  </label>
                  {mode === "login" && (
                    <button
                      type="button"
                      onClick={() => setShowForgotPassword(true)}
                      className="text-[11px] text-sky-400 hover:text-sky-300 transition-colors cursor-pointer"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder={mode === "register" ? "At least 6 characters" : "••••••••"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-slate-900/80 border border-slate-700/80 rounded-xl pl-10 pr-10 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {/* Password strength meter (Register only) */}
                {mode === "register" && password && (
                  <div className="pt-1">
                    <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${pwdStrength.color} transition-all duration-300`}
                        style={{ width: `${pwdStrength.score}%` }}
                      />
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1">
                      Strength: <span className="font-semibold text-slate-200">{pwdStrength.label}</span>
                    </p>
                  </div>
                )}
              </div>

              {/* Confirm Password (Register only) */}
              {mode === "register" && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="space-y-1.5"
                >
                  <label className="text-[11px] font-medium text-slate-300 block">
                    Confirm Password <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      placeholder="Re-enter password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full bg-slate-900/80 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-colors"
                    />
                  </div>
                </motion.div>
              )}

              {/* Checkboxes */}
              {mode === "login" ? (
                <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-3.5 h-3.5 rounded border-slate-700 bg-slate-900 text-sky-600 focus:ring-0"
                    />
                    <span>Remember this device</span>
                  </label>
                </div>
              ) : (
                <div className="pt-1">
                  <label className="flex items-start gap-2 cursor-pointer select-none text-[11px] text-slate-400 leading-tight">
                    <input
                      type="checkbox"
                      checked={agreeTerms}
                      onChange={(e) => setAgreeTerms(e.target.checked)}
                      className="w-3.5 h-3.5 mt-0.5 rounded border-slate-700 bg-slate-900 text-sky-600 focus:ring-0"
                    />
                    <span>
                      I accept SatyaCheck's Terms of Service and Privacy Policy.
                    </span>
                  </label>
                </div>
              )}

              {/* Primary Submit Button */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full mt-2 flex items-center justify-center gap-2 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 active:from-sky-600 active:to-indigo-700 text-white font-semibold text-xs rounded-xl py-3 shadow-lg shadow-sky-500/20 hover:shadow-sky-500/35 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
              >
                {submitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>{mode === "login" ? "Signing In…" : "Creating Account…"}</span>
                  </>
                ) : (
                  <>
                    <span>{mode === "login" ? "Sign In to SatyaCheck" : "Create Free Account"}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </form>

            {/* Quick Demo Credentials Button */}
            {mode === "login" && (
              <div className="mt-3">
                <button
                  type="button"
                  onClick={handleQuickDemo}
                  className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg border border-dashed border-sky-500/30 hover:border-sky-500/60 bg-sky-500/5 hover:bg-sky-500/10 text-[11px] text-sky-400 hover:text-sky-300 transition-colors cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Use Demo Account (test.user@example.com)</span>
                </button>
              </div>
            )}

            {/* Divider */}
            <div className="relative my-5">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10" />
              </div>
              <div className="relative flex justify-center text-[11px] uppercase tracking-wider">
                <span className="bg-slate-900/90 px-3 text-slate-400">
                  Or continue with
                </span>
              </div>
            </div>

            {/* Google Sign In Button */}
            <button
              type="button"
              onClick={handleGoogleClick}
              disabled={submitting}
              className="w-full flex items-center justify-center gap-3 bg-white hover:bg-slate-100 active:bg-slate-200 text-slate-800 font-semibold text-xs rounded-xl py-2.5 px-4 shadow-md transition-all duration-150 disabled:opacity-60 cursor-pointer"
            >
              <svg width="18" height="18" viewBox="0 0 48 48" className="shrink-0">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                <path fill="none" d="M0 0h48v48H0z" />
              </svg>
              <span>Continue with Google</span>
            </button>
          </div>
        </div>

        {/* Sanskrit tagline */}
        <p className="text-center text-slate-500 text-xs mt-4">
          "Satya" means <span className="text-slate-300 font-medium">Truth</span> in Sanskrit 🇮🇳
        </p>
      </motion.div>

      {/* 1. Google Account Chooser Modal */}
      <AnimatePresence>
        {showGoogleChooser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4">
            <motion.div
              initial={{ scale: 0.94, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.94, opacity: 0 }}
              className="bg-white text-slate-900 rounded-2xl max-w-sm w-full shadow-2xl overflow-hidden border border-slate-200"
            >
              {/* Header */}
              <div className="p-6 pb-4 border-b border-slate-100 flex flex-col items-center text-center">
                <svg width="30" height="30" viewBox="0 0 48 48" className="mb-2">
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                </svg>
                <h2 className="text-lg font-bold text-slate-800">Choose an account</h2>
                <p className="text-xs text-slate-500 mt-0.5">to continue to <span className="font-semibold text-sky-600">SatyaCheck</span></p>
              </div>

              {/* Accounts */}
              <div className="p-3 divide-y divide-slate-100">
                <button
                  type="button"
                  onClick={() =>
                    handleSelectGoogleAccount({
                      uid: "google_demo_user_101",
                      displayName: "Demo User",
                      email: "demo.user@gmail.com",
                      photoURL: "https://api.dicebear.com/7.x/avataaars/svg?seed=Demo",
                    })
                  }
                  className="w-full flex items-center gap-3.5 p-3 rounded-xl hover:bg-slate-50 transition-colors text-left group cursor-pointer"
                >
                  <div className="w-10 h-10 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-sm ring-2 ring-indigo-100">
                    D
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-800 group-hover:text-indigo-600 truncate">
                      Demo User
                    </p>
                    <p className="text-xs text-slate-500 truncate">demo.user@gmail.com</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    handleSelectGoogleAccount({
                      uid: "google_evaluator_202",
                      displayName: "Project Evaluator",
                      email: "evaluator.reviewer@gmail.com",
                      photoURL: "https://api.dicebear.com/7.x/avataaars/svg?seed=Evaluator",
                    })
                  }
                  className="w-full flex items-center gap-3.5 p-3 rounded-xl hover:bg-slate-50 transition-colors text-left group cursor-pointer"
                >
                  <div className="w-10 h-10 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-sm ring-2 ring-emerald-100">
                    E
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-800 group-hover:text-emerald-600 truncate">
                      Project Evaluator
                    </p>
                    <p className="text-xs text-slate-500 truncate">evaluator.reviewer@gmail.com</p>
                  </div>
                </button>

                {!showCustomGoogleInput ? (
                  <button
                    type="button"
                    onClick={() => setShowCustomGoogleInput(true)}
                    className="w-full flex items-center gap-3.5 p-3 rounded-xl hover:bg-slate-50 transition-colors text-left text-slate-600 hover:text-slate-800 cursor-pointer"
                  >
                    <div className="w-10 h-10 rounded-full border-2 border-dashed border-slate-300 flex items-center justify-center text-slate-400">
                      <Plus className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-semibold">Use another Google account</span>
                  </button>
                ) : (
                  <div className="p-3 bg-slate-50 rounded-xl mt-1 space-y-2">
                    <input
                      type="text"
                      placeholder="Your Name"
                      value={customGoogleName}
                      onChange={(e) => setCustomGoogleName(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-sky-500 text-slate-800"
                    />
                    <input
                      type="email"
                      placeholder="Google Email (e.g. name@gmail.com)"
                      value={customGoogleEmail}
                      onChange={(e) => setCustomGoogleEmail(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-sky-500 text-slate-800"
                    />
                    <div className="flex gap-2 justify-end">
                      <button
                        type="button"
                        onClick={() => setShowCustomGoogleInput(false)}
                        className="px-3 py-1 text-xs text-slate-500 hover:text-slate-700 cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        disabled={!customGoogleEmail}
                        onClick={() => {
                          const n = customGoogleName.trim() || customGoogleEmail.split("@")[0];
                          handleSelectGoogleAccount({
                            uid: `google_${Date.now()}`,
                            displayName: n,
                            email: customGoogleEmail.trim(),
                            photoURL: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(n)}`,
                          });
                        }}
                        className="px-3 py-1 text-xs font-semibold bg-sky-600 hover:bg-sky-700 text-white rounded-lg disabled:opacity-50 cursor-pointer"
                      >
                        Sign in
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                <span>Google OAuth 2.0</span>
                <button
                  type="button"
                  onClick={() => setShowGoogleChooser(false)}
                  className="text-slate-600 hover:text-slate-900 font-medium cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 2. Forgot Password Modal */}
      <AnimatePresence>
        {showForgotPassword && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4">
            <motion.div
              initial={{ scale: 0.94, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.94, opacity: 0 }}
              className="bg-slate-900 text-white border border-white/10 rounded-2xl max-w-sm w-full p-6 shadow-2xl"
            >
              <div className="flex items-center gap-2 mb-2 text-sky-400">
                <HelpCircle className="w-5 h-5" />
                <h3 className="text-base font-bold text-white">Reset Password</h3>
              </div>
              <p className="text-xs text-slate-400 mb-4 leading-relaxed">
                Enter your registered email address and we will send you instructions to reset your password.
              </p>

              {!forgotSent ? (
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    if (!forgotEmail) return;
                    try {
                      await fetch("/api/auth/forgot-password", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ email: forgotEmail }),
                      });
                      setForgotSent(true);
                    } catch {}
                  }}
                  className="space-y-3"
                >
                  <input
                    type="email"
                    required
                    placeholder="you@example.com"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-sky-500"
                  />
                  <div className="flex gap-2 justify-end pt-1">
                    <button
                      type="button"
                      onClick={() => setShowForgotPassword(false)}
                      className="px-3 py-1.5 text-xs text-slate-400 hover:text-slate-200 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 text-xs font-semibold bg-sky-600 hover:bg-sky-500 text-white rounded-lg cursor-pointer"
                    >
                      Send Instructions
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-3">
                  <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs">
                    Password reset link prepared for <strong>{forgotEmail}</strong>.
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setShowForgotPassword(false);
                      setForgotSent(false);
                      setForgotEmail("");
                    }}
                    className="w-full py-2 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white rounded-lg cursor-pointer"
                  >
                    Back to Sign In
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
