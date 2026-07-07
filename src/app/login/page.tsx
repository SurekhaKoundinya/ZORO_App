"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { Eye, EyeOff, Lock, Mail, ArrowRight, ShieldCheck, BarChart3, Users, Zap } from "lucide-react";
import { useAuth } from "@/lib/auth";

const features = [
  { icon: Users, text: "User & KYC Management" },
  { icon: BarChart3, text: "Real-time Analytics" },
  { icon: ShieldCheck, text: "Compliance & Risk Control" },
  { icon: Zap, text: "Instant Transaction Monitoring" },
];

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    await new Promise((r) => setTimeout(r, 700));
    const ok = await login(email, password);
    if (!ok) setError("Invalid credentials. Check your email and password.");
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex" style={{ background: "#0A0A0A" }}>

      {/* ── LEFT PANEL ── */}
      <div className="hidden lg:flex lg:w-[52%] relative flex-col justify-between p-12 overflow-hidden"
        style={{ background: "linear-gradient(145deg, #0f0e08 0%, #1a1608 40%, #0d0c06 100%)" }}>

        {/* Gold glow blobs */}
        <div className="absolute top-0 left-0 w-[500px] h-[500px] rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle at 20% 20%, rgba(251,209,45,0.12) 0%, transparent 65%)" }} />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle at 80% 80%, rgba(251,209,45,0.07) 0%, transparent 65%)" }} />

        {/* Subtle grid */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.04]"
          style={{ backgroundImage: "linear-gradient(#FBD12D 1px, transparent 1px), linear-gradient(90deg, #FBD12D 1px, transparent 1px)", backgroundSize: "48px 48px" }} />

        {/* Top: Logo */}
        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
          className="flex items-center gap-3 relative z-10">
          <div className="w-10 h-10 rounded-xl overflow-hidden shadow-[0_4px_16px_rgba(251,209,45,0.35)]">
            <Image src="/logo.jpeg" alt="ZORO" width={40} height={40} className="w-full h-full object-cover" />
          </div>
          <div>
            <p className="text-[15px] font-black tracking-tight leading-none"
              style={{ background: "linear-gradient(90deg,#FBD12D,#f0c020)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
              ZORO
            </p>
            <p className="text-[9px] tracking-[0.25em] text-white/25 font-semibold uppercase mt-0.5">Admin Portal</p>
          </div>
        </motion.div>

        {/* Center: Headline + features */}
        <div className="relative z-10 space-y-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}>
            <p className="text-[11px] font-bold tracking-[0.22em] uppercase mb-4"
              style={{ color: "#FBD12D" }}>
              CRYPTO & FINANCE PLATFORM
            </p>
            <h1 className="text-[40px] font-black text-white leading-[1.1] tracking-tight">
              Manage your<br />
              <span style={{ background: "linear-gradient(90deg,#FBD12D 0%,#f8c400 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                entire platform
              </span><br />
              from one place.
            </h1>
            <p className="text-[15px] text-white/40 mt-5 leading-relaxed max-w-sm">
              Real-time visibility across users, wallets, transactions, and compliance — built for speed and control.
            </p>
          </motion.div>

          {/* Feature list */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="space-y-3">
            {features.map((f, i) => (
              <motion.div key={f.text} initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.35 + i * 0.07 }}
                className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                  style={{ background: "rgba(251,209,45,0.1)", border: "1px solid rgba(251,209,45,0.18)" }}>
                  <f.icon className="w-4 h-4" style={{ color: "#FBD12D" }} />
                </div>
                <span className="text-[13px] text-white/55 font-medium">{f.text}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>

      </div>

      {/* ── RIGHT PANEL ── */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 relative"
        style={{ background: "linear-gradient(160deg, #111111 0%, #0d0d0d 100%)" }}>

        {/* Subtle top-right glow */}
        <div className="absolute top-0 right-0 w-72 h-72 rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle at 90% 5%, rgba(251,209,45,0.06) 0%, transparent 60%)" }} />

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}
          className="w-full max-w-[400px]">

          {/* Mobile logo */}
          <div className="flex items-center gap-3 mb-10 lg:hidden">
            <div className="w-9 h-9 rounded-xl overflow-hidden">
              <Image src="/logo.jpeg" alt="ZORO" width={36} height={36} className="w-full h-full object-cover" />
            </div>
            <span className="text-[15px] font-black"
              style={{ background: "linear-gradient(90deg,#FBD12D,#f0c020)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
              ZORO Admin
            </span>
          </div>

          {/* Heading */}
          <div className="mb-8">
            <h2 className="text-[28px] font-black text-white tracking-tight">Sign in</h2>
            <p className="text-[14px] text-white/35 mt-1.5">Enter your credentials to access the admin portal</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Email */}
            <div className="space-y-2">
              <label className="text-[12px] font-semibold text-white/40 uppercase tracking-wider block">Email address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@zoro.com" required
                  className="w-full pl-11 pr-4 py-3.5 rounded-2xl text-[14px] text-white placeholder:text-white/20 outline-none transition-all duration-200"
                  style={{ background: "rgba(255,255,255,0.05)", border: "1.5px solid rgba(255,255,255,0.08)" }}
                  onFocus={(e) => { e.target.style.borderColor = "rgba(251,209,45,0.5)"; e.target.style.background = "rgba(251,209,45,0.04)"; }}
                  onBlur={(e) => { e.target.style.borderColor = "rgba(255,255,255,0.08)"; e.target.style.background = "rgba(255,255,255,0.05)"; }}
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-[12px] font-semibold text-white/40 uppercase tracking-wider">Password</label>
                <button type="button" className="text-[12px] font-semibold transition-colors" style={{ color: "#FBD12D" }}>
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••" required
                  className="w-full pl-11 pr-12 py-3.5 rounded-2xl text-[14px] text-white placeholder:text-white/20 outline-none transition-all duration-200"
                  style={{ background: "rgba(255,255,255,0.05)", border: "1.5px solid rgba(255,255,255,0.08)" }}
                  onFocus={(e) => { e.target.style.borderColor = "rgba(251,209,45,0.5)"; e.target.style.background = "rgba(251,209,45,0.04)"; }}
                  onBlur={(e) => { e.target.style.borderColor = "rgba(255,255,255,0.08)"; e.target.style.background = "rgba(255,255,255,0.05)"; }}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/25 hover:text-white/50 transition-colors">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2.5 px-4 py-3 rounded-2xl text-[13px] text-red-400"
                style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.15)" }}>
                <div className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" />
                {error}
              </motion.div>
            )}

            {/* Submit */}
            <motion.button type="submit" disabled={loading}
              whileHover={{ scale: loading ? 1 : 1.01 }}
              whileTap={{ scale: loading ? 1 : 0.98 }}
              className="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-2xl text-[14px] font-bold text-black transition-all disabled:opacity-60 mt-2"
              style={{ background: "linear-gradient(135deg, #FBD12D 0%, #e8bc00 100%)", boxShadow: "0 4px 24px rgba(251,209,45,0.25)" }}>
              {loading ? (
                <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />
              ) : (
                <>
                  Sign in to Portal
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </motion.button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.07)" }} />
            <span className="text-[11px] text-white/20 font-medium">Demo Access</span>
            <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.07)" }} />
          </div>

          {/* Demo credentials card */}
          <motion.button type="button" onClick={() => { setEmail("admin@zoro.finance"); setPassword("ChangeMe123!"); setError(""); }}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            className="w-full text-left px-5 py-4 rounded-2xl transition-all duration-200 group"
            style={{ background: "rgba(251,209,45,0.04)", border: "1.5px dashed rgba(251,209,45,0.2)" }}
            onMouseEnter={(e) => (e.currentTarget.style.borderColor = "rgba(251,209,45,0.4)")}
            onMouseLeave={(e) => (e.currentTarget.style.borderColor = "rgba(251,209,45,0.2)")}>
            <div className="flex items-center justify-between mb-2.5">
              <p className="text-[11px] font-bold uppercase tracking-widest" style={{ color: "#FBD12D" }}>
                Super Admin — Click to fill
              </p>
              <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: "#FBD12D" }} />
            </div>
            <div className="flex gap-6">
              <div>
                <p className="text-[10px] text-white/25 font-medium mb-0.5">EMAIL</p>
                <p className="text-[12px] text-white/55 font-mono">admin@zoro.finance</p>
              </div>
              <div>
                <p className="text-[10px] text-white/25 font-medium mb-0.5">PASSWORD</p>
                <p className="text-[12px] text-white/55 font-mono">ChangeMe123!</p>
              </div>
            </div>
          </motion.button>

          {/* Footer */}
          <p className="text-center text-[11px] text-white/15 mt-8">
            © 2026 ZORO Finance · Secured with 2FA · All rights reserved
          </p>
        </motion.div>
      </div>
    </div>
  );
}
