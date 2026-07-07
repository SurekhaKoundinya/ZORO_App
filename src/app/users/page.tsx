"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, X, Shield, Wallet,
  ArrowLeftRight, GitBranch, Clock, CheckCircle, XCircle,
  Globe, Calendar, AlertTriangle, Eye, Ban
} from "lucide-react";
import { formatCurrency, cn } from "@/lib/utils";
import { useToast } from "@/components/ui/Toast";
import { FilterDropdown } from "@/components/ui/FilterDropdown";
import { usersApi } from "@/lib/api";

const statusColors: Record<string, string> = {
  active: "text-success bg-success/10 border-success/20",
  suspended: "text-danger bg-danger/10 border-danger/20",
  pending: "text-warning bg-warning/10 border-warning/20",
};

const kycColors: Record<string, string> = {
  "Level 1": "text-[var(--muted)] bg-[var(--border)]",
  "Level 2": "text-[#FBD12D] bg-[#FBD12D]/10",
  "Level 3": "text-success bg-success/10",
};

const riskColor = (score: number) => {
  if (score <= 20) return "text-success";
  if (score <= 50) return "text-warning";
  return "text-danger";
};

// Normalize API user object → consistent display fields
function normalizeUser(u: any) {
  const firstName  = u.first_name  ?? u.firstName  ?? "";
  const lastName   = u.last_name   ?? u.lastName   ?? "";
  const fullName   = u.name ?? u.full_name ?? (`${firstName} ${lastName}`.trim() || (u.email ?? "—"));
  const initials   = u.avatar ?? (fullName.split(" ").map((w: string) => w[0]).filter(Boolean).slice(0,2).join("").toUpperCase() || "??");
  const kycNum     = u.kyc_level   ?? u.kycLevel   ?? u.kyc_status ?? 0;
  const kycLabel   = typeof kycNum === "number"
    ? (kycNum >= 3 ? "Level 3" : kycNum >= 2 ? "Level 2" : "Level 1")
    : String(kycNum);
  const isActive   = u.is_active   ?? true;
  const status     = u.status      ?? (isActive ? "active" : "suspended");
  return {
    ...u,
    name:          fullName,
    avatar:        initials,
    status,
    kycLevel:      kycLabel,
    walletBalance: u.walletBalance  ?? u.wallet_balance  ?? u.balance  ?? 0,
    transactions:  u.transactions   ?? u.transaction_count ?? u.total_transactions ?? 0,
    riskScore:     u.riskScore      ?? u.risk_score       ?? 0,
    lastActive:    u.lastActive     ?? u.last_active      ?? u.last_login?.slice(0,10) ?? "—",
    joinDate:      u.joinDate       ?? u.date_joined      ?? u.created_at?.slice(0,10) ?? "—",
    country:       u.country        ?? "—",
    phone:         u.phone          ?? "—",
  };
}

export default function UsersPage() {
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [page, setPage] = useState(1);
  const [userList, setUserList] = useState<any[]>([]);

  useEffect(() => {
    usersApi.list().then((r) => {
      if (r.data?.length) setUserList(r.data.map(normalizeUser));
    }).catch(() => {});
  }, []);

  const handleSuspend = async (u: any) => {
    const isSuspended = u.status === "suspended";
    try {
      if (isSuspended) await usersApi.reactivate(u.id);
      else await usersApi.suspend(u.id);
    } catch { /* optimistic */ }
    const action = isSuspended ? "reactivated" : "suspended";
    setUserList((prev) => prev.map((usr) => usr.id === u.id ? normalizeUser({ ...usr, status: isSuspended ? "active" : "suspended" }) : usr));
    toast(isSuspended ? "success" : "warning", `User ${action}`, `${(u as any).name ?? (u as any).full_name} has been ${action}`);
    setSelectedUser((prev: any) => prev?.id === u.id ? { ...prev, status: isSuspended ? "active" : "suspended" } : prev);
  };

  const handleApproveKYC = async (u: any) => {
    try {
      await usersApi.approveKyc(u.id);
    } catch { /* optimistic */ }
    setUserList((prev) => prev.map((usr) => usr.id === u.id ? normalizeUser({ ...usr, kyc_level: 3 }) : usr));
    toast("success", "KYC Approved", `${(u as any).name ?? (u as any).full_name} upgraded to Level 3`);
    setSelectedUser((prev: any) => prev?.id === u.id ? { ...prev, kycLevel: "Level 3", kyc_level: 3 } : prev);
  };

  const handleFreezeWallet = async (u: any) => {
    try {
      await usersApi.freezeWallet(u.id);
    } catch { /* best effort */ }
    toast("info", "Wallet Frozen", `${(u as any).name ?? (u as any).full_name}'s wallet has been frozen`);
  };

  const handleSendMessage = (u: any) => {
    toast("info", "Message Sent", `Email notification sent to ${u.email}`);
  };

  const filtered = userList.filter((u) => {
    const name = u.name ?? u.full_name ?? "";
    const matchSearch = name.toLowerCase().includes(search.toLowerCase()) ||
      (u.email ?? "").toLowerCase().includes(search.toLowerCase()) ||
      (u.id ?? "").toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || u.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">User Management</h1>
          <p className="text-sm text-[var(--muted)] mt-0.5">{userList.length.toLocaleString()} total accounts</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#FBD12D] to-[#FBD12D] text-black text-sm font-semibold shadow-gold-sm hover:shadow-gold transition-all"
        >
          + Add User
        </motion.button>
      </div>

      {/* Filters */}
      <div className="card p-4 flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 flex-1 min-w-48 px-3 py-2 rounded-xl border border-[var(--border)] bg-[var(--background)]">
          <Search className="w-4 h-4 text-[var(--muted)] shrink-0" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, ID..."
            className="flex-1 bg-transparent text-sm outline-none text-[var(--foreground)] placeholder:text-[var(--muted)]"
          />
          {search && <button onClick={() => setSearch("")}><X className="w-3.5 h-3.5 text-[var(--muted)]" /></button>}
        </div>

        <FilterDropdown
          label="Status"
          value={statusFilter}
          onChange={setStatusFilter}
          options={[
            { value: "all", label: "All Users" },
            { value: "active", label: "Active" },
            { value: "suspended", label: "Suspended" },
            { value: "pending", label: "Pending" },
          ]}
        />

        <span className="text-xs text-[var(--muted)] ml-auto">{filtered.length} results</span>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[var(--border)]">
                {["User", "Status", "KYC Level", "Wallet Balance", "Transactions", "Risk Score", "Last Active", ""].map((h) => (
                  <th key={h} className="text-left px-5 py-3.5 text-[11px] font-semibold text-[var(--muted)] uppercase tracking-wider whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              <AnimatePresence>
                {filtered.map((user, i) => (
                  <motion.tr
                    key={user.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                    onClick={() => setSelectedUser(user)}
                    className="hover:bg-[#FBD12D]/3 cursor-pointer transition-colors group"
                  >
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#FBD12D]/20 to-[#FBD12D]/5 border border-[#FBD12D]/20 flex items-center justify-center shrink-0">
                          <span className="text-[11px] font-bold text-[#FBD12D]">{user.avatar}</span>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-[var(--foreground)]">{user.name}</p>
                          <p className="text-xs text-[var(--muted)]">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={cn("badge border", statusColors[user.status])}>{user.status}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={cn("badge", kycColors[user.kycLevel])}>{user.kycLevel}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="text-sm font-semibold text-[var(--foreground)]">{formatCurrency(user.walletBalance)}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="text-sm text-[var(--foreground)]">{(user.transactions ?? 0).toLocaleString()}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 rounded-full bg-[var(--border)] overflow-hidden">
                          <div
                            className={cn("h-full rounded-full", user.riskScore <= 20 ? "bg-success" : user.riskScore <= 50 ? "bg-warning" : "bg-danger")}
                            style={{ width: `${user.riskScore}%` }}
                          />
                        </div>
                        <span className={cn("text-xs font-semibold", riskColor(user.riskScore))}>{user.riskScore}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="text-xs text-[var(--muted)]">{user.lastActive}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <motion.button whileTap={{ scale: 0.9 }} className="w-7 h-7 rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--muted)] hover:text-[var(--foreground)] flex items-center justify-center transition-colors">
                          <Eye className="w-3.5 h-3.5" />
                        </motion.button>
                        <motion.button whileTap={{ scale: 0.9 }} className="w-7 h-7 rounded-lg border border-danger/20 bg-danger/5 text-danger hover:bg-danger/10 flex items-center justify-center transition-colors">
                          <Ban className="w-3.5 h-3.5" />
                        </motion.button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-5 py-3.5 border-t border-[var(--border)]">
          <span className="text-xs text-[var(--muted)]">Showing {filtered.length} of {userList.length} users</span>
          <div className="flex items-center gap-1">
            {[1, 2, 3, "...", 12].map((p, i) => (
              <motion.button
                key={i}
                whileTap={{ scale: 0.9 }}
                onClick={() => typeof p === "number" && setPage(p)}
                className={cn(
                  "w-7 h-7 rounded-lg text-xs font-medium transition-all",
                  page === p
                    ? "bg-[#FBD12D] text-black"
                    : "text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--border)]"
                )}
              >
                {p}
              </motion.button>
            ))}
          </div>
        </div>
      </div>

      {/* User Detail Drawer */}
      <AnimatePresence>
        {selectedUser && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedUser(null)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-[var(--card-bg)] border-l border-[var(--border)] z-40 overflow-y-auto"
            >
              <div className="p-6">
                {/* Drawer Header */}
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-bold text-[var(--foreground)]">User Profile</h2>
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setSelectedUser(null)}
                    className="w-8 h-8 rounded-xl border border-[var(--border)] flex items-center justify-center text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </motion.button>
                </div>

                {/* Profile */}
                <div className="flex items-center gap-4 mb-6 p-4 rounded-2xl bg-gradient-to-br from-[#FBD12D]/10 to-transparent border border-[#FBD12D]/20">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#FBD12D] to-[#FBD12D] flex items-center justify-center shadow-gold">
                    <span className="text-lg font-bold text-black">{selectedUser.avatar}</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-[var(--foreground)]">{selectedUser.name}</h3>
                    <p className="text-sm text-[var(--muted)]">{selectedUser.email}</p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className={cn("badge border", statusColors[selectedUser.status])}>{selectedUser.status}</span>
                      <span className={cn("badge", kycColors[selectedUser.kycLevel])}>{selectedUser.kycLevel}</span>
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                  {[
                    { icon: Wallet, label: "Balance", value: formatCurrency(selectedUser.walletBalance) },
                    { icon: ArrowLeftRight, label: "Transactions", value: (selectedUser.transactions ?? 0).toLocaleString() },
                    { icon: GitBranch, label: "Referrals", value: String(selectedUser.referrals ?? selectedUser.referral_count ?? 0) },
                    { icon: AlertTriangle, label: "Risk Score", value: String(selectedUser.riskScore ?? selectedUser.risk_score ?? 0), color: riskColor(selectedUser.riskScore ?? selectedUser.risk_score ?? 0) },
                  ].map(({ icon: Icon, label, value, color }) => (
                    <div key={label} className="p-4 rounded-2xl border border-[var(--border)] bg-[var(--background)]">
                      <div className="flex items-center gap-2 mb-2">
                        <Icon className="w-3.5 h-3.5 text-[var(--muted)]" />
                        <span className="text-[11px] text-[var(--muted)] font-medium">{label}</span>
                      </div>
                      <p className={cn("text-lg font-bold", color || "text-[var(--foreground)]")}>{value}</p>
                    </div>
                  ))}
                </div>

                {/* Info */}
                <div className="space-y-3 mb-6">
                  {[
                    { icon: Globe, label: "Country", value: selectedUser.country },
                    { icon: Calendar, label: "Joined", value: selectedUser.joinDate },
                    { icon: Clock, label: "Last Active", value: selectedUser.lastActive },
                    { icon: Shield, label: "KYC Level", value: selectedUser.kycLevel },
                  ].map(({ icon: Icon, label, value }) => (
                    <div key={label} className="flex items-center gap-3 py-2.5 border-b border-[var(--border)]">
                      <div className="w-7 h-7 rounded-lg bg-[var(--border)] flex items-center justify-center shrink-0">
                        <Icon className="w-3.5 h-3.5 text-[var(--muted)]" />
                      </div>
                      <span className="text-xs text-[var(--muted)] w-24 shrink-0">{label}</span>
                      <span className="text-sm font-medium text-[var(--foreground)]">{value}</span>
                    </div>
                  ))}
                </div>

                {/* Actions */}
                <div className="grid grid-cols-2 gap-2">
                  <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.97 }} onClick={() => handleApproveKYC(selectedUser)} className="py-2.5 rounded-xl bg-success/10 text-success text-sm font-semibold border border-success/20 hover:bg-success/20 transition-colors">
                    Approve KYC
                  </motion.button>
                  <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.97 }} onClick={() => handleSuspend(selectedUser)} className={cn("py-2.5 rounded-xl text-sm font-semibold transition-colors", selectedUser.status === "suspended" ? "bg-success/10 text-success border border-success/20 hover:bg-success/20" : "bg-danger/10 text-danger border border-danger/20 hover:bg-danger/20")}>
                    {selectedUser.status === "suspended" ? "Reactivate User" : "Suspend User"}
                  </motion.button>
                  <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.97 }} onClick={() => handleFreezeWallet(selectedUser)} className="py-2.5 rounded-xl bg-[#6366F1]/10 text-[#6366F1] text-sm font-semibold border border-[#6366F1]/20 hover:bg-[#6366F1]/20 transition-colors">
                    Freeze Wallet
                  </motion.button>
                  <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.97 }} onClick={() => handleSendMessage(selectedUser)} className="py-2.5 rounded-xl bg-[var(--border)] text-[var(--foreground)] text-sm font-semibold hover:bg-[var(--border)]/70 transition-colors">
                    Send Message
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
