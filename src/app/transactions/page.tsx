"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, ArrowUpRight, ArrowDownRight, ExternalLink, Copy, Clock, ChevronRight, ArrowLeftRight } from "lucide-react";
import { formatCurrency, truncateHash, cn } from "@/lib/utils";
import { FilterDropdown } from "@/components/ui/FilterDropdown";
import { transactionsApi } from "@/lib/api";

const statusColors: Record<string, string> = {
  completed: "text-success bg-success/10 border-success/20",
  pending: "text-warning bg-warning/10 border-warning/20",
  failed: "text-danger bg-danger/10 border-danger/20",
};

const typeColors: Record<string, string> = {
  Deposit: "text-success",
  Withdrawal: "text-danger",
  Transfer: "text-[#6366F1]",
  Swap: "text-[#FBD12D]",
};

const typeIcons: Record<string, React.ElementType> = {
  Deposit: ArrowDownRight,
  Withdrawal: ArrowUpRight,
  Transfer: ArrowLeftRight,
  Swap: ArrowLeftRight,
};

export default function TransactionsPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [allTx, setAllTx] = useState<any[]>([]);
  const [selected, setSelected] = useState<any | null>(null);
  const [copied, setCopied] = useState("");
  const [txStats, setTxStats] = useState<any>({});

  useEffect(() => {
    transactionsApi.list({ limit: "100", ordering: "-created_at" }).then((r) => {
      if (r.data?.length) setAllTx(r.data);
    }).catch(() => {});
    transactionsApi.stats().then((r) => {
      if (r.data) setTxStats(r.data);
    }).catch(() => {});
  }, []);

  const filtered = allTx.filter((tx: any) => {
    const id = tx.id ?? tx.tx_id ?? "";
    const user = tx.user ?? tx.user_name ?? "";
    const hash = tx.hash ?? tx.tx_hash ?? "";
    const type = tx.type ?? tx.tx_type ?? "";
    const matchSearch = id.includes(search) || user.toLowerCase().includes(search.toLowerCase()) || hash.includes(search);
    const matchStatus = statusFilter === "all" || tx.status === statusFilter;
    const matchType = typeFilter === "all" || type === typeFilter;
    return matchSearch && matchStatus && matchType;
  });

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(""), 2000);
  };

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">Transactions</h1>
          <p className="text-sm text-[var(--muted)] mt-0.5">Complete audit trail of all platform activity</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Total Today", value: (txStats.total_today   ?? txStats.total     ?? 0).toLocaleString(), icon: ArrowLeftRight, color: "text-[#FBD12D]" },
          { label: "Completed",   value: (txStats.completed     ?? txStats.success   ?? 0).toLocaleString(), icon: ArrowDownRight, color: "text-success"   },
          { label: "Pending",     value: (txStats.pending       ?? 0).toLocaleString(),                     icon: Clock,          color: "text-warning"   },
          { label: "Failed",      value: (txStats.failed        ?? txStats.error     ?? 0).toLocaleString(), icon: X,             color: "text-danger"    },
        ].map((s) => {
          const Icon = s.icon;
          return (
            <motion.div key={s.label} whileHover={{ y: -2 }} className="card p-5">
              <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center mb-3 bg-current/10", s.color)}>
                <Icon className={cn("w-4 h-4", s.color)} />
              </div>
              <p className="text-2xl font-bold text-[var(--foreground)]">{s.value}</p>
              <p className="text-xs text-[var(--muted)] mt-1">{s.label}</p>
            </motion.div>
          );
        })}
      </div>

      {/* Filters */}
      <div className="card p-4 flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 flex-1 min-w-48 px-3 py-2 rounded-xl border border-[var(--border)] bg-[var(--background)]">
          <Search className="w-4 h-4 text-[var(--muted)] shrink-0" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by ID, user, hash..."
            className="flex-1 bg-transparent text-sm outline-none text-[var(--foreground)] placeholder:text-[var(--muted)]"
          />
          {search && <button onClick={() => setSearch("")}><X className="w-3.5 h-3.5 text-[var(--muted)]" /></button>}
        </div>

        <FilterDropdown
          label="Status"
          value={statusFilter}
          options={[
            { value: "all", label: "All" },
            { value: "completed", label: "Completed" },
            { value: "pending", label: "Pending" },
            { value: "failed", label: "Failed" },
          ]}
          onChange={setStatusFilter}
        />

        <FilterDropdown
          label="Type"
          value={typeFilter}
          options={[
            { value: "all", label: "All" },
            { value: "Deposit", label: "Deposit" },
            { value: "Withdrawal", label: "Withdrawal" },
            { value: "Transfer", label: "Transfer" },
            { value: "Swap", label: "Swap" },
          ]}
          onChange={setTypeFilter}
        />

        <span className="text-xs text-[var(--muted)] ml-auto">{filtered.length} results</span>
      </div>

      <div className="flex gap-6">
        {/* Table */}
        <div className={cn("card overflow-hidden flex-1 transition-all", selected ? "hidden xl:block" : "")}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[var(--border)]">
                  {["ID", "User", "Type", "Amount", "Status", "Network", "Time", ""].map((h) => (
                    <th key={h} className="text-left px-5 py-3.5 text-[11px] font-semibold text-[var(--muted)] uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {filtered.map((tx: any, i: number) => {
                  const txType = tx.type ?? tx.tx_type ?? "";
                  const txId   = tx.id ?? tx.tx_id ?? "";
                  const txUser = tx.user ?? tx.user_name ?? "";
                  const txAvatar = tx.avatar ?? tx.user_avatar ?? txUser.slice(0,2).toUpperCase();
                  const Icon = typeIcons[txType] || ArrowLeftRight;
                  return (
                    <motion.tr
                      key={txId}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.02 }}
                      onClick={() => setSelected(tx)}
                      className={cn("hover:bg-[#FBD12D]/3 cursor-pointer transition-colors", (selected?.id === tx.id || selected?.tx_id === tx.tx_id) && "bg-[#FBD12D]/5")}
                    >
                      <td className="px-5 py-3.5">
                        <span className="text-xs font-mono text-[var(--muted)]">{txId}</span>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-[#FBD12D]/10 border border-[#FBD12D]/20 flex items-center justify-center">
                            <span className="text-[9px] font-bold text-[#FBD12D]">{txAvatar}</span>
                          </div>
                          <span className="text-sm font-medium text-[var(--foreground)] whitespace-nowrap">{txUser}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-1.5">
                          <Icon className={cn("w-3.5 h-3.5", typeColors[txType])} />
                          <span className={cn("text-xs font-semibold", typeColors[txType])}>{txType}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="text-sm font-bold text-[var(--foreground)]">{formatCurrency(tx.amount)}</span>
                        <span className="text-[11px] text-[var(--muted)] ml-1">{tx.currency}</span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={cn("badge border", statusColors[tx.status])}>{tx.status}</span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="text-xs text-[var(--muted)]">{tx.network}</span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="text-xs text-[var(--muted)]">{tx.time ?? tx.created_at?.slice(0, 16).replace("T", " ") ?? "—"}</span>
                      </td>
                      <td className="px-5 py-3.5">
                        <ChevronRight className="w-4 h-4 text-[var(--muted)]" />
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Detail Drawer */}
        <AnimatePresence>
          {selected && (
            <motion.div
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 360 }}
              exit={{ opacity: 0, width: 0 }}
              className="card overflow-hidden shrink-0"
            >
              <div className="p-5 w-[360px]">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-sm font-bold text-[var(--foreground)]">Transaction Details</h3>
                  <motion.button whileTap={{ scale: 0.9 }} onClick={() => setSelected(null)} className="w-7 h-7 rounded-lg border border-[var(--border)] flex items-center justify-center text-[var(--muted)] hover:text-[var(--foreground)] transition-colors">
                    <X className="w-3.5 h-3.5" />
                  </motion.button>
                </div>

                {/* Amount */}
                <div className="p-5 rounded-2xl bg-gradient-to-br from-[#FBD12D]/10 to-transparent border border-[#FBD12D]/20 mb-4 text-center">
                  <p className="text-[11px] text-[var(--muted)] mb-1 font-medium uppercase tracking-wider">{selected.type ?? selected.tx_type}</p>
                  <p className="text-3xl font-bold gold-text">{formatCurrency(selected.amount)}</p>
                  <p className="text-sm text-[var(--muted)] mt-1">{selected.currency} · {selected.network}</p>
                  <span className={cn("badge border mt-2 inline-flex", statusColors[selected.status])}>{selected.status}</span>
                </div>

                {/* Hash */}
                <div className="p-3 rounded-xl bg-[var(--background)] border border-[var(--border)] mb-4">
                  <p className="text-[10px] text-[var(--muted)] font-medium mb-1.5">Blockchain Hash</p>
                  <div className="flex items-center gap-2">
                    <code className="text-[11px] font-mono text-[var(--foreground)] truncate flex-1">{truncateHash(selected.hash ?? selected.tx_hash ?? "", 10, 8)}</code>
                    <motion.button whileTap={{ scale: 0.9 }} onClick={() => handleCopy(selected.hash ?? selected.tx_hash ?? "", "hash")} className="text-[10px] text-[#FBD12D] font-medium shrink-0">
                      {copied === "hash" ? "✓" : <Copy className="w-3 h-3" />}
                    </motion.button>
                  </div>
                </div>

                {/* Details */}
                <div className="space-y-3 mb-5">
                  {[
                    { label: "Transaction ID", value: selected.id ?? selected.tx_id },
                    { label: "User", value: selected.user ?? selected.user_name },
                    { label: "Wallet", value: selected.wallet ?? selected.wallet_address },
                    { label: "Network", value: selected.network },
                    { label: "Time", value: selected.time ?? selected.created_at },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex items-center justify-between py-2 border-b border-[var(--border)]">
                      <span className="text-xs text-[var(--muted)]">{label}</span>
                      <span className="text-xs font-semibold text-[var(--foreground)]">{value}</span>
                    </div>
                  ))}
                </div>

                {/* Timeline */}
                <div className="mb-5">
                  <h4 className="text-xs font-semibold text-[var(--foreground)] mb-3">Timeline</h4>
                  <div className="space-y-3">
                    {[
                      { label: "Initiated", done: true },
                      { label: "Broadcast to network", done: true },
                      { label: "Confirmed (24/24)", done: selected.status === "completed" },
                      { label: "Settled", done: selected.status === "completed" },
                    ].map((step, i) => (
                      <div key={step.label} className="flex items-center gap-2.5">
                        <div className={cn("w-5 h-5 rounded-full flex items-center justify-center shrink-0 text-[10px]", step.done ? "bg-success text-white" : "bg-[var(--border)] text-[var(--muted)]")}>
                          {step.done ? "✓" : i + 1}
                        </div>
                        <span className={cn("text-xs", step.done ? "text-[var(--foreground)] font-medium" : "text-[var(--muted)]")}>{step.label}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <motion.button whileHover={{ scale: 1.01 }} className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-[#FBD12D]/20 bg-[#FBD12D]/5 text-[#FBD12D] text-sm font-semibold hover:bg-[#FBD12D]/10 transition-colors">
                  <ExternalLink className="w-3.5 h-3.5" />
                  View on Explorer
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
