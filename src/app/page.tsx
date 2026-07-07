"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Users, ShieldCheck, Clock, Wallet, ArrowLeftRight, TrendingUp,
  GitBranch, Activity, ArrowUpRight, ArrowDownRight, CheckCircle,
  XCircle, AlertTriangle, FileText, Snowflake,
} from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { formatCurrency, formatNumber } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { dashboardApi, transactionsApi, kycApi } from "@/lib/api";

const container = { hidden: {}, show: { transition: { staggerChildren: 0.07 } } };
const item = { hidden: { opacity: 0, y: 18 }, show: { opacity: 1, y: 0 } };

const statusColors: Record<string, string> = {
  completed: "text-success bg-success/10",
  pending: "text-warning bg-warning/10",
  failed: "text-danger bg-danger/10",
};

const alertColors: Record<string, { bg: string; text: string; dot: string }> = {
  warning: { bg: "bg-warning/8", text: "text-warning", dot: "bg-warning" },
  info:    { bg: "bg-[#FBD12D]/8", text: "text-[#FBD12D]", dot: "bg-[#FBD12D]" },
  danger:  { bg: "bg-danger/8", text: "text-danger", dot: "bg-danger" },
  success: { bg: "bg-success/8", text: "text-success", dot: "bg-success" },
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="px-3 py-2.5 rounded-2xl border border-[var(--border)] bg-[var(--card-bg)] text-xs shadow-lg">
      <p className="font-bold text-[var(--foreground)] mb-1.5">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} style={{ color: p.color }} className="font-semibold">
          {p.name}: {p.value > 1000 ? formatCurrency(p.value) : p.value}
        </p>
      ))}
    </div>
  );
};

export default function DashboardPage() {
  const router = useRouter();
  const [liveStats, setLiveStats] = useState<any>(null);
  const [liveCharts, setLiveCharts] = useState<any>(null);
  const [liveTxns, setLiveTxns] = useState<any[]>([]);
  const [liveKyc, setLiveKyc] = useState<any[]>([]);

  useEffect(() => {
    dashboardApi.stats().then((r) => setLiveStats(r.data)).catch(() => {});
    dashboardApi.charts().then((r) => setLiveCharts(r.data)).catch(() => {});
    transactionsApi.list({ limit: "6", ordering: "-created_at" }).then((r) => setLiveTxns(r.data ?? [])).catch(() => {});
    kycApi.list({ status: "pending", limit: "3" }).then((r) => setLiveKyc(r.data ?? [])).catch(() => {});
  }, []);

  const s = {
    totalUsers:        liveStats?.total_users         ?? 0,
    verifiedUsers:     liveStats?.verified_users       ?? 0,
    pendingKYC:        liveStats?.pending_kyc          ?? 0,
    totalWalletBalance:liveStats?.total_wallet_balance ?? 0,
    transactionsToday: liveStats?.transactions_today   ?? 0,
    monthlyRevenue:    liveStats?.monthly_revenue      ?? 0,
    referralRewards:   liveStats?.referral_rewards     ?? 0,
    systemHealth:      liveStats?.system_health        ?? 0,
  };

  const chartStats = [
    { label: "Total Users",        value: formatNumber(s.totalUsers),                                                       change: "+12.4%", up: true,  icon: Users,          accent: "#FBD12D" },
    { label: "Verified Users",     value: formatNumber(s.verifiedUsers),                                                    change: "+8.2%",  up: true,  icon: ShieldCheck,    accent: "#16C784" },
    { label: "Pending KYC",        value: formatNumber(s.pendingKYC),                                                       change: "+3.1%",  up: false, icon: Clock,          accent: "#FACC15" },
    { label: "Wallet Balance",     value: `$${(s.totalWalletBalance / 1_000_000).toFixed(1)}M`,                             change: "+15.8%", up: true,  icon: Wallet,         accent: "#6366F1" },
    { label: "Transactions Today", value: formatNumber(s.transactionsToday),                                                change: "+22.3%", up: true,  icon: ArrowLeftRight, accent: "#EC4899" },
    { label: "Monthly Revenue",    value: `$${(s.monthlyRevenue / 1_000_000).toFixed(2)}M`,                                 change: "+9.7%",  up: true,  icon: TrendingUp,     accent: "#FBD12D" },
    { label: "Referral Rewards",   value: formatCurrency(s.referralRewards),                                                change: "+18.2%", up: true,  icon: GitBranch,      accent: "#16C784" },
    { label: "System Health",      value: `${s.systemHealth}%`,                                                             change: "+0.01%", up: true,  icon: Activity,       accent: "#16C784" },
  ];

  const dailyTx   = liveCharts?.daily_transactions ?? [];
  const revData   = liveCharts?.revenue            ?? [];
  const userGrowth= liveCharts?.user_growth        ?? [];
  const txnList   = liveTxns;
  const kycList   = liveKyc;

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">
      {/* Page header */}
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between">
        <div>
          <h1 className="text-[22px] font-black text-[var(--foreground)] tracking-tight">Dashboard</h1>
          <p className="text-[13px] text-[var(--muted)] mt-0.5">Good morning, Vivek. Here's what's happening today.</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-success/8 text-success text-[12px] font-bold border border-success/20">
            <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
            All Systems Operational
          </span>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <motion.div variants={container} initial="hidden" animate="show"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

        {/* ── HERO CARD (Total Users) ── */}
        <motion.div variants={item} whileHover={{ y: -3 }}
          className="lg:col-span-1 rounded-[20px] p-5 relative overflow-hidden cursor-default"
          style={{ background: "linear-gradient(135deg,#FBD12D 0%,#FBD12D 100%)", border: "none", boxShadow: "0 8px 32px rgba(251,209,45,0.4)" }}>
          {/* Shine overlay */}
          <div className="absolute -top-8 -right-8 w-36 h-36 rounded-full pointer-events-none"
            style={{ background: "radial-gradient(circle,rgba(255,255,255,0.25),transparent 70%)" }} />
          <div className="absolute bottom-0 left-0 w-24 h-24 rounded-full pointer-events-none"
            style={{ background: "radial-gradient(circle,rgba(0,0,0,0.08),transparent 70%)" }} />
          <div className="relative">
            <div className="flex items-center justify-between mb-5">
              <div className="w-10 h-10 rounded-[14px] flex items-center justify-center"
                style={{ background: "rgba(0,0,0,0.12)", border: "1px solid rgba(0,0,0,0.1)" }}>
                <Users className="w-5 h-5 text-black" />
              </div>
              <span className="flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-black/10 text-black/80">
                <ArrowUpRight className="w-3 h-3" /> +12.4%
              </span>
            </div>
            <p className="text-[28px] font-black text-black tracking-tight leading-none">
              {formatNumber(s.totalUsers)}
            </p>
            <p className="text-[12px] font-bold text-black/60 mt-1.5">Total Users</p>
            <div className="mt-4 pt-4 border-t border-black/15 flex items-center justify-between">
              <span className="text-[11px] text-black/50 font-medium">vs last month</span>
              <span className="text-[11px] font-bold text-black/80">+13,842 new</span>
            </div>
          </div>
        </motion.div>

        {/* ── REMAINING 7 CARDS ── */}
        {chartStats.slice(1).map((stat, i) => {
          const Icon = stat.icon;
          // mini sparkline bars (fake but varied per card)
          const sparkHeights = [
            [40,55,45,60,50,70,65],
            [30,45,35,50,40,35,48],
            [50,60,55,75,65,80,72],
            [35,50,42,58,48,62,55],
            [60,45,55,40,65,50,70],
            [40,55,50,65,45,60,58],
            [30,40,35,50,42,55,48],
          ][i];

          return (
            <motion.div key={stat.label} variants={item}
              whileHover={{ y: -3 }}
              className="card p-5 cursor-default flex flex-col justify-between min-h-[148px]"
            >
              {/* Top row */}
              <div className="flex items-start justify-between">
                <div>
                  <div className="w-9 h-9 rounded-[12px] flex items-center justify-center mb-3"
                    style={{ background: `${stat.accent}12`, border: `1px solid ${stat.accent}25`, color: stat.accent }}>
                    <Icon className="w-[17px] h-[17px]" />
                  </div>
                  <p className="text-[11px] font-semibold text-[var(--muted)] uppercase tracking-widest leading-none">{stat.label}</p>
                  <p className="text-[22px] font-black text-[var(--foreground)] tracking-tight leading-tight mt-1">{stat.value}</p>
                </div>
                {/* Mini sparkline */}
                <div className="flex items-end gap-[3px] h-10 mt-1 shrink-0">
                  {sparkHeights.map((h, si) => (
                    <div key={si} className="w-[4px] rounded-full transition-all"
                      style={{
                        height: `${h}%`,
                        background: si === sparkHeights.length - 1
                          ? stat.accent
                          : `${stat.accent}40`,
                      }} />
                  ))}
                </div>
              </div>

              {/* Bottom row */}
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-[var(--border)]">
                <span className="text-[11px] text-[var(--muted)]">vs last month</span>
                <span className={cn("flex items-center gap-0.5 text-[11px] font-bold",
                  stat.up ? "text-success" : "text-danger")}>
                  {stat.up ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                  {stat.change}
                </span>
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Charts Row 1 */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.28 }}
        className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Daily Transactions */}
        <div className="card p-6 lg:col-span-3">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-[14px] font-bold text-[var(--foreground)]">Daily Transactions</h3>
              <p className="text-[12px] text-[var(--muted)] mt-0.5">Volume & count — this week</p>
            </div>
            <span className="text-[11px] text-[var(--muted)] px-3 py-1 rounded-xl border border-[var(--border)] bg-[var(--input-bg)] font-medium">This Week</span>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={dailyTx} barGap={6}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: "var(--muted)" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "var(--muted)" }} axisLine={false} tickLine={false} width={42} tickFormatter={(v) => `$${v / 1000}k`} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(251,209,45,0.06)" }} />
              <Bar dataKey="volume" fill="#FBD12D" radius={[6, 6, 0, 0]} name="Volume" />
              <Bar dataKey="count" fill="#0A0A0A" radius={[6, 6, 0, 0]} name="Count" opacity={0.75} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Wallet Growth */}
        <div className="card p-6 lg:col-span-2 relative overflow-hidden"
          style={{ background: "linear-gradient(135deg,#0A0A0A 0%,#111008 100%)" }}>
          <div className="absolute top-0 right-0 w-40 h-40 rounded-full pointer-events-none opacity-20"
            style={{ background: "radial-gradient(circle,#FBD12D,transparent)", transform: "translate(20px,-20px)" }} />
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-[14px] font-bold text-white">Wallet Growth</h3>
                <p className="text-[12px] text-white/40 mt-0.5">Total balance 2026</p>
              </div>
            </div>
            <p className="text-[28px] font-black gold-text leading-none">${(s.totalWalletBalance / 1_000_000).toFixed(1)}M</p>
            <p className="text-[12px] text-success flex items-center gap-1 mt-1.5">
              <ArrowUpRight className="w-3.5 h-3.5" /> +15.8% from last month
            </p>
            <ResponsiveContainer width="100%" height={130} className="mt-4">
              <AreaChart data={[]}>

                <defs>
                  <linearGradient id="wg" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FBD12D" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#FBD12D" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" tick={{ fontSize: 10, fill: "rgba(255,255,255,0.3)" }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="balance" stroke="#FBD12D" strokeWidth={2} fill="url(#wg)" name="Balance" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </motion.div>

      {/* Charts Row 2 */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.38 }}
        className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="card p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-[14px] font-bold text-[var(--foreground)]">Revenue Analytics</h3>
              <p className="text-[12px] text-[var(--muted)] mt-0.5">Revenue vs fees collected</p>
            </div>
            <span className="text-[11px] text-[var(--muted)] px-3 py-1 rounded-xl border border-[var(--border)] bg-[var(--input-bg)] font-medium">2026</span>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={revData}>
              <defs>
                <linearGradient id="rg" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#FBD12D" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#FBD12D" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="fg" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#16C784" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#16C784" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: "var(--muted)" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "var(--muted)" }} axisLine={false} tickLine={false} width={48} tickFormatter={(v) => `$${v / 1000000}M`} />
              <Tooltip content={<CustomTooltip />} />
              <Legend iconType="circle" iconSize={7} wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }} />
              <Area type="monotone" dataKey="revenue" stroke="#FBD12D" strokeWidth={2.5} fill="url(#rg)" name="Revenue" />
              <Area type="monotone" dataKey="fees" stroke="#16C784" strokeWidth={2} fill="url(#fg)" name="Fees" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-[14px] font-bold text-[var(--foreground)]">User Growth</h3>
              <p className="text-[12px] text-[var(--muted)] mt-0.5">Total vs active users</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={userGrowth}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: "var(--muted)" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "var(--muted)" }} axisLine={false} tickLine={false} width={38} tickFormatter={(v) => `${v / 1000}K`} />
              <Tooltip content={<CustomTooltip />} />
              <Legend iconType="circle" iconSize={7} wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }} />
              <Line type="monotone" dataKey="users" stroke="#FBD12D" strokeWidth={2.5} dot={false} name="Total Users" />
              <Line type="monotone" dataKey="active" stroke="#0A0A0A" strokeWidth={2} dot={false} strokeDasharray="5 3" name="Active Users" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Bottom Row */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.46 }}
        className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Recent Transactions */}
        <div className="card xl:col-span-2 overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border)]">
            <div>
              <h3 className="text-[14px] font-bold text-[var(--foreground)]">Latest Transactions</h3>
              <p className="text-[12px] text-[var(--muted)] mt-0.5">Real-time activity feed</p>
            </div>
            <button onClick={() => router.push("/transactions")} className="text-[12px] text-[#FBD12D] hover:text-[#FBD12D] font-bold transition-colors">View all →</button>
          </div>
          <div className="divide-y divide-[var(--border-soft)]">
            {txnList.map((tx: any, i: number) => (
              <motion.div
                key={tx.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
                whileHover={{ backgroundColor: "rgba(251,209,45,0.025)" }}
                className="flex items-center gap-3 px-6 py-3.5 cursor-pointer transition-colors"
              >
                <div className="w-9 h-9 rounded-[12px] flex items-center justify-center shrink-0 font-bold text-[11px] text-black"
                  style={{ background: "linear-gradient(135deg,#FBD12D,#FBD12D)" }}>
                  {tx.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-[13px] font-semibold text-[var(--foreground)] truncate">{tx.user}</p>
                    <span className="text-[11px] text-[var(--muted)]">{tx.time}</span>
                  </div>
                  <p className="text-[11px] text-[var(--muted)] mt-0.5">{tx.id ?? tx.tx_id} · {tx.type ?? tx.tx_type} · {tx.network}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-[13px] font-black text-[var(--foreground)]">
                    {(tx.type ?? tx.tx_type) === "Withdrawal" ? "−" : "+"}{formatCurrency(tx.amount)}
                  </p>
                  <span className={cn("badge mt-0.5 text-[10px]", statusColors[tx.status])}>{tx.status}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-4">
          {/* Quick Actions */}
          <div className="card p-5">
            <h3 className="text-[13px] font-bold text-[var(--foreground)] mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: "Approve KYC", icon: CheckCircle, bg: "#16C784", light: "#16C78415", text: "#16C784", href: "/kyc" },
                { label: "Freeze Wallet", icon: Snowflake, bg: "#6366F1", light: "#6366F115", text: "#6366F1", href: "/wallets" },
                { label: "Generate Report", icon: FileText, bg: "#FBD12D", light: "#FBD12D15", text: "#FBD12D", href: "/reports" },
                { label: "View Alerts", icon: AlertTriangle, bg: "#EF4444", light: "#EF444415", text: "#EF4444", href: "/system-logs" },
              ].map(({ label, icon: Icon, bg, light, text, href }) => (
                <motion.button key={label}
                  whileHover={{ scale: 1.03, y: -1 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => router.push(href)}
                  className="flex flex-col items-center gap-2 p-3.5 rounded-2xl border text-[12px] font-bold transition-all"
                  style={{ color: text, background: light, borderColor: `${bg}25` }}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </motion.button>
              ))}
            </div>
          </div>

          {/* System Alerts */}
          <div className="card p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-[13px] font-bold text-[var(--foreground)]">System Alerts</h3>
              <span className="w-5 h-5 rounded-full bg-danger flex items-center justify-center text-[10px] font-black text-white">3</span>
            </div>
            <div className="space-y-2">
              {([] as any[]).map((alert) => {
                const cfg = alertColors[alert.severity];
                return (
                  <motion.div key={alert.id} whileHover={{ x: 2 }}
                    className={cn("flex items-start gap-2.5 p-3 rounded-xl text-[12px] transition-all", cfg.bg)}>
                    <div className={cn("w-1.5 h-1.5 rounded-full mt-1 shrink-0", cfg.dot)} />
                    <div className="flex-1 min-w-0">
                      <p className={cn("font-semibold leading-snug line-clamp-2", cfg.text)}>{alert.message}</p>
                      <p className="text-[var(--muted)] mt-0.5 text-[10px]">{alert.time}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Pending KYC */}
          <div className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[13px] font-bold text-[var(--foreground)]">Pending KYC</h3>
              <span className="text-[11px] text-[var(--muted)]">{kycList.length} requests</span>
            </div>
            <div className="space-y-3">
              {kycList.slice(0, 3).map((kyc: any) => (
                <div key={kyc.id} className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-[10px] flex items-center justify-center text-[10px] font-black text-black shrink-0"
                    style={{ background: "linear-gradient(135deg,#FBD12D,#FBD12D)" }}>
                    {kyc.avatar ?? kyc.user_avatar ?? "??"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-semibold text-[var(--foreground)] truncate">{kyc.user ?? kyc.user_name}</p>
                    <p className="text-[10px] text-[var(--muted)]">{kyc.country ?? kyc.user_country} · Level {kyc.level}</p>
                  </div>
                  <div className="flex gap-1.5">
                    <motion.button whileTap={{ scale: 0.88 }} className="w-6 h-6 rounded-lg bg-success/10 text-success hover:bg-success/20 flex items-center justify-center transition-colors">
                      <CheckCircle className="w-3 h-3" />
                    </motion.button>
                    <motion.button whileTap={{ scale: 0.88 }} className="w-6 h-6 rounded-lg bg-danger/10 text-danger hover:bg-danger/20 flex items-center justify-center transition-colors">
                      <XCircle className="w-3 h-3" />
                    </motion.button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
