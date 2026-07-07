"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, Users, ShieldCheck, Wallet,
  ArrowLeftRight, GitBranch, Gift, BarChart3,
  ScrollText, Settings, LogOut, ChevronLeft, ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth";

const navItems = [
  { label: "Dashboard", href: "/", icon: LayoutDashboard },
  { label: "Users", href: "/users", icon: Users },
  { label: "KYC", href: "/kyc", icon: ShieldCheck },
  { label: "Wallets", href: "/wallets", icon: Wallet },
  { label: "Transactions", href: "/transactions", icon: ArrowLeftRight },
  { label: "Referrals", href: "/referrals", icon: GitBranch },
  { label: "Rewards", href: "/rewards", icon: Gift },
  { label: "Reports", href: "/reports", icon: BarChart3 },
  { label: "System Logs", href: "/system-logs", icon: ScrollText },
  { label: "Settings", href: "/settings", icon: Settings },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const { logout } = useAuth();

  return (
    <motion.aside
      animate={{ width: collapsed ? 68 : 232 }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      className="relative flex flex-col h-screen bg-[var(--sidebar-bg)] border-r border-[var(--border)] shrink-0 overflow-hidden z-20"
      style={{ boxShadow: "2px 0 24px rgba(0,0,0,0.04)" }}
    >
      {/* Logo */}
      <div className="flex items-center px-2 h-24 border-b border-[var(--border)] shrink-0">
        <AnimatePresence mode="wait">
          {collapsed ? (
            <motion.div
              key="collapsed-logo"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="shrink-0 w-16 h-16 rounded-2xl overflow-hidden"
              style={{ boxShadow: "0 2px 12px rgba(251,209,45,0.25)" }}
            >
              <Image
                src="/logo.jpeg"
                alt="ZORO"
                width={64}
                height={64}
                className="w-full h-full object-cover object-center"
                priority
              />
            </motion.div>
          ) : (
            <motion.div
              key="expanded-logo"
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -6 }}
              transition={{ duration: 0.18 }}
              className="flex items-center gap-3 min-w-0"
            >
              <div className="shrink-0 w-[72px] h-[72px] rounded-2xl overflow-hidden"
                style={{ boxShadow: "0 4px 16px rgba(251,209,45,0.3)" }}>
                <Image
                  src="/logo.jpeg"
                  alt="ZORO"
                  width={72}
                  height={72}
                  className="w-full h-full object-cover object-center"
                  priority
                />
              </div>
              <div className="flex flex-col justify-center leading-none">
                <span
                  className="text-[20px] font-black tracking-tight leading-none"
                  style={{
                    background: "linear-gradient(135deg,#c8a800 0%,#FBD12D 45%,#a07800 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  ZORO
                </span>
                <span className="text-[9px] font-bold tracking-[0.24em] uppercase text-[var(--muted)] mt-1">
                  GROW HIGH
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Nav section label */}
      {!collapsed && (
        <div className="px-5 pt-5 pb-2">
          <p className="text-[10px] font-bold text-[var(--muted-light)] uppercase tracking-widest">Main Menu</p>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden py-2 space-y-0.5 px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));

          return (
            <Link key={item.href} href={item.href}>
              <motion.div
                whileHover={{ x: collapsed ? 0 : 2 }}
                whileTap={{ scale: 0.97 }}
                className={cn(
                  "flex items-center gap-3 px-2.5 py-2.5 rounded-[14px] cursor-pointer transition-all duration-200 group relative",
                  isActive
                    ? "text-[#0A0A0A] dark:text-white"
                    : "text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--border-soft)]"
                )}
                style={isActive ? {
                  background: "linear-gradient(135deg,#FBD12D 0%,#c8a800 100%)",
                  boxShadow: "0 4px 16px rgba(251,209,45,0.35)",
                } : {}}
              >
                <div className={cn(
                  "flex items-center justify-center w-8 h-8 rounded-[10px] shrink-0 transition-all",
                  isActive
                    ? "bg-black/10 text-black dark:text-white"
                    : "group-hover:bg-[var(--border)]"
                )}>
                  <Icon className="w-[16px] h-[16px]" />
                </div>
                <AnimatePresence>
                  {!collapsed && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className={cn(
                        "text-[13px] font-semibold whitespace-nowrap",
                        isActive ? "text-black dark:text-white" : ""
                      )}
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.div>
            </Link>
          );
        })}
      </nav>

      {/* Bottom: logout */}
      <div className="px-2 pb-4 space-y-1 border-t border-[var(--border)] pt-3">
        <motion.button
          onClick={logout}
          whileHover={{ x: collapsed ? 0 : 2 }}
          whileTap={{ scale: 0.97 }}
          className="w-full flex items-center gap-3 px-2.5 py-2.5 rounded-[14px] text-[var(--muted)] hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all duration-200"
        >
          <div className="flex items-center justify-center w-8 h-8 rounded-[10px] shrink-0">
            <LogOut className="w-4 h-4" />
          </div>
          <AnimatePresence>
            {!collapsed && (
              <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="text-[13px] font-semibold">
                Logout
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>
      </div>

      {/* Collapse toggle */}
      <motion.button
        onClick={() => setCollapsed(!collapsed)}
        whileHover={{ scale: 1.15 }}
        whileTap={{ scale: 0.9 }}
        className="absolute -right-3 top-[96px] w-6 h-6 rounded-full bg-[var(--card-bg)] border border-[var(--border)] flex items-center justify-center text-[var(--muted)] hover:text-[#FBD12D] hover:border-[#FBD12D]/50 transition-all z-10"
        style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}
      >
        {collapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
      </motion.button>
    </motion.aside>
  );
}
