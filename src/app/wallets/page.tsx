"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Wallet, Snowflake, ArrowUpRight, ArrowDownRight, Activity, Shield, Clock, AlertTriangle, ChevronRight, Copy, ExternalLink, TrendingUp, TrendingDown, X } from "lucide-react";
import { formatCurrency, truncateHash, cn } from "@/lib/utils";
import { useToast } from "@/components/ui/Toast";
import { walletsApi } from "@/lib/api";

const networkColors: Record<string, string> = {
  Ethereum: "text-[#627EEA] bg-[#627EEA]/10",
  Bitcoin: "text-[#F7931A] bg-[#F7931A]/10",
  Polygon: "text-[#8247E5] bg-[#8247E5]/10",
  BSC: "text-[#F3BA2F] bg-[#F3BA2F]/10",
};

const riskColors: Record<string, string> = {
  low: "text-success bg-success/10 border-success/20",
  medium: "text-warning bg-warning/10 border-warning/20",
  high: "text-danger bg-danger/10 border-danger/20",
};

const statusColors: Record<string, string> = {
  active: "text-success bg-success/10 border-success/20",
  frozen: "text-[#6366F1] bg-[#6366F1]/10 border-[#6366F1]/20",
};

// Normalize API wallet object → consistent display fields (API returns
// owner_name/owner_avatar/risk_level/last_activity/total_in/total_out/created_at,
// not the flat owner/avatar/riskLevel/lastActivity/totalIn/totalOut/createdAt this page
// renders). API has no per-wallet transaction count, so that falls back to 0.
function normalizeWallet(w: any) {
  const owner = w.owner_name ?? w.owner ?? "—";
  return {
    ...w,
    owner,
    avatar: w.owner_avatar ?? w.avatar ?? (owner.slice(0, 2).toUpperCase() || "??"),
    riskLevel: w.risk_level ?? w.riskLevel ?? "low",
    lastActivity: w.last_activity ?? w.lastActivity ?? "—",
    totalIn: w.total_in ?? w.totalIn ?? 0,
    totalOut: w.total_out ?? w.totalOut ?? 0,
    createdAt: w.created_at ?? w.createdAt ?? "—",
    transactions: w.transaction_count ?? w.transactions ?? 0,
  };
}


export default function WalletsPage() {
  const { toast } = useToast();
  const [walletList, setWalletList] = useState<any[]>([]);
  const [selected, setSelected] = useState<any | null>(null);
  const [walletActivity, setWalletActivity] = useState<any[]>([]);
  const [walletStats, setWalletStats] = useState<any>({});

  useEffect(() => {
    walletsApi.list().then((r) => {
      if (r.data?.length) {
        const normalized = r.data.map(normalizeWallet);
        setWalletList(normalized);
        setSelected(normalized[0]);
      }
    }).catch(() => {});
    walletsApi.stats().then((r) => {
      if (r.data) setWalletStats(r.data);
    }).catch(() => {});
    (walletsApi as any).activity?.().then((r: any) => {
      if (r?.data?.length) setWalletActivity(r.data);
    }).catch(() => {});
  }, []);
  const [copied, setCopied] = useState(false);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFreeze = async (wallet: any) => {
    const newStatus = wallet.status === "frozen" ? "active" : "frozen";
    try {
      if (newStatus === "frozen") await walletsApi.freeze(wallet.id);
      else await walletsApi.unfreeze(wallet.id);
    } catch { /* optimistic */ }
    setWalletList((prev) => prev.map((w) => w.id === wallet.id ? { ...w, status: newStatus } : w));
    setSelected((prev: any) => prev?.id === wallet.id ? { ...prev, status: newStatus } : prev);
    const owner = (wallet as any).owner ?? (wallet as any).owner_name;
    toast(newStatus === "frozen" ? "warning" : "success", `Wallet ${newStatus === "frozen" ? "Frozen" : "Unfrozen"}`, `${owner}'s wallet is now ${newStatus}`);
  };

  const handleRiskReview = async (wallet: any) => {
    try {
      await walletsApi.riskReview(wallet.id, (wallet as any).riskLevel ?? (wallet as any).risk_level ?? "medium", (wallet as any).riskScore ?? (wallet as any).risk_score ?? 50);
    } catch { /* best effort */ }
    toast("info", "Risk Review Initiated", `Manual risk review started for ${(wallet as any).owner ?? (wallet as any).owner_name}`);
  };

  const handleExplorer = (wallet: any) => {
    toast("info", "Opening Explorer", `Viewing ${wallet.address.slice(0, 10)}... on blockchain explorer`);
  };

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">Wallets</h1>
          <p className="text-sm text-[var(--muted)] mt-0.5">Monitor and manage all custody wallets</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Total Wallets",  value: (walletStats.total         ?? walletStats.total_wallets  ?? 0).toLocaleString(), icon: Wallet,        color: "text-[#FBD12D] bg-[#FBD12D]/10" },
          { label: "Active Wallets", value: (walletStats.active        ?? walletStats.active_wallets ?? 0).toLocaleString(), icon: Activity,       color: "text-success bg-success/10"      },
          { label: "Frozen Wallets", value: (walletStats.frozen        ?? walletStats.frozen_wallets ?? 0).toLocaleString(), icon: Snowflake,      color: "text-[#6366F1] bg-[#6366F1]/10"  },
          { label: "High Risk",      value: (walletStats.high_risk     ?? walletStats.high_risk_count ?? 0).toLocaleString(), icon: AlertTriangle, color: "text-danger bg-danger/10"        },
        ].map((s) => {
          const Icon = s.icon;
          return (
            <motion.div key={s.label} whileHover={{ y: -2 }} className="card p-5">
              <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center mb-3", s.color)}>
                <Icon className="w-4 h-4" />
              </div>
              <p className="text-2xl font-bold text-[var(--foreground)]">{s.value}</p>
              <p className="text-xs text-[var(--muted)] mt-1">{s.label}</p>
            </motion.div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Wallet List */}
        <div className="lg:col-span-2 space-y-3">
          <h3 className="text-sm font-semibold text-[var(--foreground)]">Wallet Directory</h3>
          {walletList.map((wallet, i) => (
            <motion.div
              key={wallet.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              onClick={() => setSelected(wallet)}
              className={cn(
                "card p-4 cursor-pointer transition-all",
                selected?.id === wallet.id && "border-[#FBD12D]/40 shadow-gold-sm"
              )}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FBD12D]/20 to-[#FBD12D]/5 border border-[#FBD12D]/20 flex items-center justify-center shrink-0">
                  <span className="text-[11px] font-bold text-[#FBD12D]">{wallet.avatar}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-[var(--foreground)] truncate">{wallet.owner}</p>
                    <span className={cn("badge border text-[10px]", statusColors[wallet.status])}>{wallet.status}</span>
                  </div>
                  <p className="text-xs text-[var(--muted)] mt-0.5 font-mono truncate">{truncateHash(wallet.address)}</p>
                </div>
              </div>
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-[var(--border)]">
                <div>
                  <p className="text-lg font-bold text-[var(--foreground)]">{formatCurrency(wallet.balance)}</p>
                  <span className={cn("text-[11px] px-1.5 py-0.5 rounded", networkColors[wallet.network])}>
                    {wallet.network}
                  </span>
                </div>
                <div className="text-right">
                  <span className={cn("badge border text-[10px]", riskColors[wallet.riskLevel])}>
                    {wallet.riskLevel} risk
                  </span>
                  <p className="text-[11px] text-[var(--muted)] mt-1">{wallet.lastActivity}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Wallet Detail */}
        <div className="lg:col-span-3">
          <AnimatePresence mode="wait">
            {selected && (
              <motion.div
                key={selected.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4"
              >
                {/* Main Card */}
                <div className="card p-6 bg-gradient-to-br from-[#FBD12D]/10 to-transparent border-[#FBD12D]/20">
                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <p className="text-xs text-[var(--muted)] font-medium uppercase tracking-wider mb-1">{selected.network} · {selected.currency}</p>
                      <h2 className="text-3xl font-bold gold-text">{formatCurrency(selected.balance)}</h2>
                    </div>
                    <span className={cn("badge border", statusColors[selected.status])}>{selected.status}</span>
                  </div>

                  {/* Address */}
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-[var(--background)] border border-[var(--border)]">
                    <code className="text-xs font-mono text-[var(--muted)] flex-1 truncate">{selected.address}</code>
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleCopy(selected.address)}
                      className="flex items-center gap-1 text-[10px] text-[#FBD12D] hover:text-[#FBD12D] font-medium shrink-0 transition-colors"
                    >
                      <Copy className="w-3 h-3" />
                      {copied ? "Copied!" : "Copy"}
                    </motion.button>
                    <ExternalLink className="w-3.5 h-3.5 text-[var(--muted)] cursor-pointer hover:text-[var(--foreground)] transition-colors" />
                  </div>

                  {/* In/Out */}
                  <div className="grid grid-cols-2 gap-3 mt-4">
                    <div className="p-3 rounded-xl bg-success/5 border border-success/20">
                      <div className="flex items-center gap-1.5 mb-1">
                        <TrendingUp className="w-3.5 h-3.5 text-success" />
                        <span className="text-[11px] text-[var(--muted)]">Total In</span>
                      </div>
                      <p className="text-base font-bold text-success">{formatCurrency(selected.totalIn)}</p>
                    </div>
                    <div className="p-3 rounded-xl bg-danger/5 border border-danger/20">
                      <div className="flex items-center gap-1.5 mb-1">
                        <TrendingDown className="w-3.5 h-3.5 text-danger" />
                        <span className="text-[11px] text-[var(--muted)]">Total Out</span>
                      </div>
                      <p className="text-base font-bold text-danger">{formatCurrency(selected.totalOut)}</p>
                    </div>
                  </div>
                </div>

                {/* Risk & Info */}
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: "Risk Level", value: selected.riskLevel.toUpperCase(), color: riskColors[selected.riskLevel] },
                    { label: "Transactions", value: selected.transactions.toLocaleString(), color: "" },
                    { label: "Created", value: selected.createdAt, color: "" },
                  ].map(({ label, value, color }) => (
                    <div key={label} className="card p-4">
                      <p className="text-[11px] text-[var(--muted)] font-medium mb-1">{label}</p>
                      <p className={cn("text-sm font-bold", color ? "" : "text-[var(--foreground)]")}>
                        {color ? <span className={cn("badge border text-[10px]", color)}>{value}</span> : value}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Activity Timeline */}
                <div className="card p-5">
                  <h3 className="text-sm font-semibold text-[var(--foreground)] mb-4">Wallet Activity</h3>
                  {walletActivity.length === 0 ? (
                    <p className="text-xs text-[var(--muted)] text-center py-4">No recent activity</p>
                  ) : (
                    <div className="relative space-y-0">
                      {walletActivity.map((activity: any, i: number) => {
                        const isIn = (activity.type ?? activity.tx_type ?? activity.direction) === "in" || (activity.amount ?? 0) > 0;
                        const timeLabel = activity.time ?? activity.created_at?.slice(11, 16) ?? "";
                        const eventLabel = activity.event ?? activity.description ?? activity.tx_type ?? "Transaction";
                        const amtRaw = activity.amount ?? activity.value ?? 0;
                        const amtLabel = typeof amtRaw === "string" ? amtRaw : `${isIn ? "+" : "-"}$${Math.abs(amtRaw).toLocaleString()}`;
                        return (
                          <div key={i} className="flex items-center gap-3 py-2.5 relative">
                            {i < walletActivity.length - 1 && (
                              <div className="absolute left-[15px] top-8 w-[1px] h-full bg-[var(--border)]" />
                            )}
                            <div className={cn(
                              "w-7 h-7 rounded-lg flex items-center justify-center shrink-0 z-10",
                              isIn ? "bg-success/10 text-success" : "bg-danger/10 text-danger"
                            )}>
                              {isIn ? <ArrowDownRight className="w-3.5 h-3.5" /> : <ArrowUpRight className="w-3.5 h-3.5" />}
                            </div>
                            <div className="flex-1">
                              <p className="text-xs font-medium text-[var(--foreground)]">{eventLabel}</p>
                              <p className="text-[10px] text-[var(--muted)]">{timeLabel}</p>
                            </div>
                            <span className={cn("text-sm font-bold", isIn ? "text-success" : "text-danger")}>
                              {amtLabel}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="grid grid-cols-3 gap-3">
                  <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.97 }} onClick={() => handleFreeze(selected)} className="py-2.5 rounded-xl bg-[#6366F1]/10 text-[#6366F1] border border-[#6366F1]/20 text-sm font-semibold hover:bg-[#6366F1]/20 transition-all flex items-center justify-center gap-2">
                    <Snowflake className="w-4 h-4" />
                    {selected.status === "frozen" ? "Unfreeze" : "Freeze"}
                  </motion.button>
                  <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.97 }} onClick={() => handleRiskReview(selected)} className="py-2.5 rounded-xl bg-[var(--border)] text-[var(--foreground)] text-sm font-semibold hover:bg-[var(--border)]/70 transition-all flex items-center justify-center gap-2">
                    <Shield className="w-4 h-4" />
                    Risk Review
                  </motion.button>
                  <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.97 }} onClick={() => handleExplorer(selected)} className="py-2.5 rounded-xl bg-[#FBD12D]/10 text-[#FBD12D] border border-[#FBD12D]/20 text-sm font-semibold hover:bg-[#FBD12D]/20 transition-all flex items-center justify-center gap-2">
                    <ExternalLink className="w-4 h-4" />
                    Explorer
                  </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
