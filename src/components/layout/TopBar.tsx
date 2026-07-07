"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, Bell, Sun, Moon, ChevronDown,
  Shield, LogOut, User, Settings, TrendingUp, AlertTriangle,
  CheckCircle, X, Zap,
} from "lucide-react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth";
import { notificationsApi } from "@/lib/api";

// Normalize API notification → display shape (API uses notif_type/is_read/created_at).
function normalizeNotif(n: any) {
  return {
    id: n.id,
    type: n.notif_type ?? n.type ?? "info",
    title: n.title ?? "Notification",
    message: n.message ?? "",
    time: n.time ?? n.created_at?.slice(0, 16).replace("T", " ") ?? "",
    read: n.is_read ?? n.read ?? false,
  };
}

const notifIconMap = {
  warning: { icon: AlertTriangle, color: "text-warning bg-warning/10" },
  success: { icon: CheckCircle, color: "text-success bg-success/10" },
  danger:  { icon: AlertTriangle, color: "text-danger bg-danger/10" },
  info:    { icon: TrendingUp, color: "text-[#FBD12D] bg-[#FBD12D]/10" },
};

export default function TopBar() {
  const [searchFocus, setSearchFocus] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [showNotifs, setShowNotifs] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [localNotifs, setLocalNotifs] = useState<ReturnType<typeof normalizeNotif>[]>([]);
  const { user, logout } = useAuth();

  useEffect(() => {
    setMounted(true);
    notificationsApi.list().then((r) => {
      if (r.data?.length) setLocalNotifs(r.data.map(normalizeNotif));
    }).catch(() => {});
  }, []);

  const unread = localNotifs.filter((n) => !n.read).length;

  const markAllRead = () => {
    setLocalNotifs((n) => n.map((x) => ({ ...x, read: true })));
    notificationsApi.markAllRead().catch(() => {});
  };

  const markOneRead = (id: string) => {
    setLocalNotifs((n) => n.map((x) => (x.id === id ? { ...x, read: true } : x)));
    notificationsApi.markRead(id).catch(() => {});
  };

  const dateStr = mounted
    ? new Date().toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" })
    : "";

  return (
    <header
      className="sticky top-0 z-10 flex items-center gap-4 px-6 h-24 border-b border-[var(--border)] backdrop-blur-xl"
      style={{ background: "var(--topbar-bg)" }}
    >
      {/* Search */}
      <div className="flex-1 max-w-sm">
        <motion.div
          animate={{ scale: searchFocus ? 1.01 : 1 }}
          className={cn(
            "flex items-center gap-2.5 px-4 py-2.5 rounded-2xl border transition-all duration-200",
            searchFocus
              ? "border-[#FBD12D]/50 bg-white dark:bg-[var(--input-bg)] shadow-[0_0_0_3px_rgba(251,209,45,0.1)]"
              : "border-[var(--border)] bg-[var(--input-bg)]"
          )}
        >
          <Search className="w-3.5 h-3.5 text-[var(--muted)] shrink-0" />
          <input
            type="text"
            placeholder="Search users, wallets, transactions…"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            onFocus={() => setSearchFocus(true)}
            onBlur={() => setSearchFocus(false)}
            className="flex-1 bg-transparent text-[13px] text-[var(--foreground)] placeholder:text-[var(--muted-light)] outline-none"
          />
          {searchValue ? (
            <button onClick={() => setSearchValue("")} className="text-[var(--muted)] hover:text-[var(--foreground)] transition-colors">
              <X className="w-3.5 h-3.5" />
            </button>
          ) : (
            <kbd className="hidden sm:flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[10px] font-mono text-[var(--muted)] border border-[var(--border)] bg-[var(--card-bg)]">
              ⌘K
            </kbd>
          )}
        </motion.div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-1.5 ml-auto">
        {/* Date */}
        <span className="hidden xl:block text-[12px] text-[var(--muted)] mr-3 font-medium">{dateStr}</span>

        {/* Theme toggle */}
        <motion.button
          whileHover={{ scale: 1.05, rotate: 15 }}
          whileTap={{ scale: 0.92 }}
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="flex items-center justify-center w-9 h-9 rounded-xl border border-[var(--border)] bg-[var(--card-bg)] text-[var(--muted)] hover:text-[#FBD12D] hover:border-[#FBD12D]/40 transition-all"
        >
          {mounted ? (theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />) : <span className="w-4 h-4 block" />}
        </motion.button>

        {/* Notifications */}
        <div className="relative">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.92 }}
            onClick={() => { setShowNotifs(!showNotifs); setShowProfile(false); }}
            className="flex items-center justify-center w-9 h-9 rounded-xl border border-[var(--border)] bg-[var(--card-bg)] text-[var(--muted)] hover:text-[var(--foreground)] hover:border-[#FBD12D]/30 transition-all relative"
          >
            <Bell className="w-4 h-4" />
            {unread > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-danger text-[9px] text-white font-bold flex items-center justify-center"
              >
                {unread}
              </motion.span>
            )}
          </motion.button>

          <AnimatePresence>
            {showNotifs && (
              <motion.div
                initial={{ opacity: 0, y: 6, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 6, scale: 0.96 }}
                transition={{ duration: 0.14 }}
                className="absolute right-0 top-12 w-80 rounded-2xl border border-[var(--border)] bg-[var(--card-bg)] z-50 overflow-hidden"
                style={{ boxShadow: "0 16px 48px rgba(0,0,0,0.12), 0 0 0 1px rgba(251,209,45,0.08)" }}
              >
                <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border)]">
                  <div>
                    <p className="text-[13px] font-bold text-[var(--foreground)]">Notifications</p>
                    {unread > 0 && <p className="text-[11px] text-[var(--muted)]">{unread} new</p>}
                  </div>
                  {unread > 0 && (
                    <button onClick={markAllRead} className="text-[11px] text-[#FBD12D] hover:text-[#FBD12D] font-semibold transition-colors">
                      Mark all read
                    </button>
                  )}
                </div>
                <div className="divide-y divide-[var(--border)] max-h-80 overflow-y-auto">
                  {localNotifs.length === 0 && (
                    <p className="text-[12px] text-[var(--muted)] text-center py-8">No notifications</p>
                  )}
                  {localNotifs.map((notif) => {
                    const cfg = notifIconMap[notif.type as keyof typeof notifIconMap] ?? notifIconMap.info;
                    const Icon = cfg.icon;
                    return (
                      <motion.div
                        key={notif.id}
                        whileHover={{ backgroundColor: "rgba(251,209,45,0.03)" }}
                        onClick={() => markOneRead(notif.id)}
                        className={cn("flex gap-3 px-4 py-3 cursor-pointer transition-colors", !notif.read && "bg-[#FBD12D]/[0.03]")}
                      >
                        <div className={cn("w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5", cfg.color)}>
                          <Icon className="w-3.5 h-3.5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-[12px] font-semibold text-[var(--foreground)] truncate">{notif.title}</p>
                            {!notif.read && <span className="w-1.5 h-1.5 rounded-full bg-[#FBD12D] shrink-0" />}
                          </div>
                          <p className="text-[11px] text-[var(--muted)] mt-0.5 line-clamp-2">{notif.message}</p>
                          <p className="text-[10px] text-[var(--muted-light)] mt-1">{notif.time}</p>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
                <div className="px-4 py-2.5 border-t border-[var(--border)]">
                  <button className="text-[11px] text-[#FBD12D] hover:text-[#FBD12D] font-semibold transition-colors">
                    View all notifications →
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Profile */}
        <div className="relative ml-0.5">
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => { setShowProfile(!showProfile); setShowNotifs(false); }}
            className="flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-2xl border border-[var(--border)] bg-[var(--card-bg)] hover:border-[#FBD12D]/40 hover:shadow-[0_0_0_3px_rgba(251,209,45,0.08)] transition-all"
          >
            <div className="relative">
              <div className="w-7 h-7 rounded-[10px] flex items-center justify-center"
                style={{ background: "linear-gradient(135deg,#FBD12D 0%,#FBD12D 100%)" }}>
                <span className="text-[11px] font-black text-black">{user?.avatar ?? "VV"}</span>
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-success border-2 border-[var(--card-bg)]" />
            </div>
            <div className="hidden md:block text-left">
              <p className="text-[12px] font-bold text-[var(--foreground)] leading-none">{user?.name ?? "Admin"}</p>
              <p className="text-[10px] text-[var(--muted)] mt-0.5">{user?.role ?? "Super Admin"}</p>
            </div>
            <ChevronDown className="w-3 h-3 text-[var(--muted)]" />
          </motion.button>

          <AnimatePresence>
            {showProfile && (
              <motion.div
                initial={{ opacity: 0, y: 6, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 6, scale: 0.96 }}
                transition={{ duration: 0.14 }}
                className="absolute right-0 top-12 w-56 rounded-2xl border border-[var(--border)] bg-[var(--card-bg)] z-50 overflow-hidden"
                style={{ boxShadow: "0 16px 48px rgba(0,0,0,0.12), 0 0 0 1px rgba(251,209,45,0.08)" }}
              >
                {/* Gold header */}
                <div className="px-4 py-4 relative overflow-hidden"
                  style={{ background: "linear-gradient(135deg,#0A0A0A 0%,#1A1510 100%)" }}>
                  <div className="absolute top-0 right-0 w-24 h-24 rounded-full opacity-20"
                    style={{ background: "radial-gradient(circle,#FBD12D,transparent)", transform: "translate(8px,-8px)" }} />
                  <div className="w-10 h-10 rounded-2xl flex items-center justify-center mb-2"
                    style={{ background: "linear-gradient(135deg,#FBD12D,#FBD12D)" }}>
                    <span className="text-sm font-black text-black">{user?.avatar ?? "VV"}</span>
                  </div>
                  <p className="text-[13px] font-bold text-white">{user?.name ?? "Admin"}</p>
                  <p className="text-[11px] text-white/50">{user?.email ?? ""}</p>
                  <div className="flex items-center gap-1.5 mt-1.5">
                    <Shield className="w-3 h-3 text-[#FBD12D]" />
                    <span className="text-[10px] text-[#FBD12D] font-semibold">Super Admin</span>
                  </div>
                </div>
                <div className="py-1.5">
                  {[{ icon: User, label: "My Profile" }, { icon: Settings, label: "Settings" }, { icon: Zap, label: "API Keys" }].map(({ icon: Icon, label }) => (
                    <button key={label} className="w-full flex items-center gap-3 px-4 py-2.5 text-[13px] text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--input-bg)] transition-colors">
                      <Icon className="w-3.5 h-3.5" />
                      {label}
                    </button>
                  ))}
                </div>
                <div className="border-t border-[var(--border)] py-1.5">
                  <button onClick={logout} className="w-full flex items-center gap-3 px-4 py-2.5 text-[13px] text-danger hover:bg-danger/5 transition-colors">
                    <LogOut className="w-3.5 h-3.5" />
                    Sign Out
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Backdrop */}
      {(showNotifs || showProfile) && (
        <div className="fixed inset-0 z-40" onClick={() => { setShowNotifs(false); setShowProfile(false); }} />
      )}
    </header>
  );
}
