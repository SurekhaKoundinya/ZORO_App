"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  User, Shield, Zap, Users2, Eye, EyeOff,
  CheckCircle, Copy, Plus, Trash2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/Toast";
import { authApi, settingsApi } from "@/lib/api";
import { useAuth } from "@/lib/auth";

const tabs = [
  { id: "profile",  label: "Profile",            icon: User   },
  { id: "security", label: "Security",            icon: Shield },
  { id: "roles",    label: "Roles & Permissions", icon: Users2 },
  { id: "api",      label: "API Keys",            icon: Zap   },
];

const roleColors: Record<string, string> = {
  super_admin: "text-[#FBD12D] bg-[#FBD12D]/10 border-[#FBD12D]/20",
  admin:       "text-[#6366F1] bg-[#6366F1]/10 border-[#6366F1]/20",
  kyc_agent:   "text-success bg-success/10 border-success/20",
  support:     "text-warning bg-warning/10 border-warning/20",
  user:        "text-[var(--muted)] bg-[var(--border)] border-[var(--border)]",
};

export default function SettingsPage() {
  const { toast } = useToast();
  const { user: authUser } = useAuth();
  const [activeTab, setActiveTab]   = useState("profile");
  const [showPassword, setShowPassword] = useState(false);
  const [copied, setCopied]         = useState("");
  const [profile, setProfile]       = useState<any>(null);
  const [keyList, setKeyList]       = useState<any[]>([]);
  const [roleList, setRoleList]     = useState<any[]>([]);
  const [platform, setPlatform]     = useState<any>({});
  const pwRefs   = useRef<HTMLInputElement[]>([]);
  const profRefs = useRef<Record<string, HTMLInputElement | null>>({});

  // ── Fetch all real data on mount ──────────────────────────────
  useEffect(() => {
    authApi.me().then((r) => setProfile(r.data)).catch(() => {});
    authApi.apiKeys.list().then((r) => {
      if (r.data?.length) setKeyList(r.data.map((k: any) => ({
        id:       k.id ?? k.key_id,
        name:     k.name,
        prefix:   k.prefix ?? (k.id ?? "").toString().slice(0, 8),
        scopes:   k.scopes ?? k.permissions?.split(",") ?? ["read:all"],
        created:  k.created_at?.slice(0, 10) ?? k.created ?? "—",
        lastUsed: k.last_used ?? k.last_used_at ?? "Never",
        status:   k.is_active === false ? "inactive" : "active",
      })));
    }).catch(() => {});
    settingsApi.roles().then((r) => { if (r.data?.length) setRoleList(r.data); }).catch(() => {});
    settingsApi.profile().then((r) => {
      if (r.data) setProfile(r.data);
    }).catch(() => {});
  }, []);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(""), 2000);
  };

  const handleSaveProfile = async () => {
    const updates: Record<string, string> = {};
    const map: Record<string, string> = {
      first_name: "First Name", last_name: "Last Name",
      phone: "Phone", country: "Timezone",
    };
    Object.entries(map).forEach(([field]) => {
      const el = profRefs.current[field];
      if (el) updates[field] = el.value;
    });
    try {
      const r = await settingsApi.updateProfile(updates);
      if (r) setProfile((p: any) => ({ ...p, ...updates }));
      toast("success", "Profile Saved", "Your profile has been updated");
    } catch (e: any) {
      toast("error", "Save Failed", e?.message ?? "Could not save profile");
    }
  };

  const handleUpdatePassword = async () => {
    const [current, next, confirm] = pwRefs.current.map((r) => r?.value ?? "");
    if (!current || !next || !confirm) { toast("warning", "Missing Fields", "Fill all password fields"); return; }
    if (next !== confirm) { toast("error", "Mismatch", "New passwords do not match"); return; }
    try {
      await authApi.changePassword(current, next, confirm);
      toast("success", "Password Updated", "Your password has been changed");
      pwRefs.current.forEach((r) => { if (r) r.value = ""; });
    } catch (e: any) {
      toast("error", "Error", e?.message ?? "Password update failed");
    }
  };

  const handleDeleteKey = async (id: string) => {
    setKeyList((prev) => prev.filter((k) => k.id !== id));
    try { await authApi.apiKeys.delete(id); } catch { /* optimistic */ }
    toast("warning", "API Key Deleted", `Key revoked`);
  };

  const handleGenerateKey = async () => {
    try {
      const r = await authApi.apiKeys.create("New API Key");
      const k = r.data;
      setKeyList((prev) => [...prev, {
        id:       k.id ?? k.key_id,
        name:     k.name ?? "New API Key",
        prefix:   k.prefix ?? "",
        scopes:   k.scopes ?? ["read:all"],
        created:  k.created_at?.slice(0, 10) ?? "Today",
        lastUsed: "Never",
        status:   "active",
        rawKey:   k.key,   // shown once
      }]);
      toast("success", "API Key Generated", "Copy the key now — it won't be shown again");
    } catch (e: any) {
      toast("error", "Failed", e?.message ?? "Could not generate API key");
    }
  };

  const handleRemoveRole = async (id: string) => {
    setRoleList((prev) => prev.filter((r) => r.id !== id));
    try { await settingsApi.removeRole(id); } catch { /* optimistic */ }
    toast("warning", "Role Removed", "User role has been revoked");
  };

  const handleUpdateRole = async (id: string, newRole: string) => {
    setRoleList((prev) => prev.map((r) => r.id === id ? { ...r, role: newRole } : r));
    try { await settingsApi.updateRole(id, newRole); } catch { /* optimistic */ }
    toast("success", "Role Updated", `Role changed to ${newRole}`);
  };

  const displayName = profile
    ? `${profile.first_name ?? ""} ${profile.last_name ?? ""}`.trim() || profile.email
    : authUser?.name ?? "—";

  const displayEmail  = profile?.email  ?? authUser?.email ?? "—";
  const displayRole   = profile?.role   ?? authUser?.role  ?? "—";
  const displayAvatar = profile?.avatar ?? authUser?.avatar ?? displayName.slice(0, 2).toUpperCase();

  return (
    <div className="space-y-6 max-w-[1200px]">
      <div>
        <h1 className="text-2xl font-bold text-[var(--foreground)]">Settings</h1>
        <p className="text-sm text-[var(--muted)] mt-0.5">Manage your account, security, and platform configuration</p>
      </div>

      <div className="flex gap-6">
        {/* Sidebar */}
        <div className="w-52 shrink-0 space-y-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <motion.button key={tab.id} whileTap={{ scale: 0.97 }} onClick={() => setActiveTab(tab.id)}
                className={cn("w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
                  activeTab === tab.id
                    ? "bg-[#FBD12D]/10 text-[#FBD12D] border border-[#FBD12D]/20"
                    : "text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--border)]")}>
                <Icon className="w-4 h-4 shrink-0" />{tab.label}
              </motion.button>
            );
          })}
        </div>

        {/* Content */}
        <div className="flex-1">
          <AnimatePresence mode="wait">

            {/* ── PROFILE ── */}
            {activeTab === "profile" && (
              <motion.div key="profile" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
                <div className="card p-6">
                  <h3 className="text-sm font-bold text-[var(--foreground)] mb-5">Admin Profile</h3>
                  <div className="flex items-center gap-5 mb-6">
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#FBD12D] to-[#FBD12D] flex items-center justify-center shadow-gold">
                      <span className="text-2xl font-bold text-black">{displayAvatar}</span>
                    </div>
                    <div>
                      <p className="text-lg font-bold text-[var(--foreground)]">{displayName}</p>
                      <p className="text-sm text-[var(--muted)]">{displayEmail}</p>
                      <span className="badge border text-[10px] border-[#FBD12D]/20 text-[#FBD12D] bg-[#FBD12D]/10 mt-1 capitalize">{displayRole.replace("_", " ")}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { label: "First Name", field: "first_name", value: profile?.first_name ?? "" },
                      { label: "Last Name",  field: "last_name",  value: profile?.last_name  ?? "" },
                      { label: "Email",      field: "email",      value: profile?.email       ?? displayEmail },
                      { label: "Phone",      field: "phone",      value: profile?.phone       ?? "" },
                      { label: "Role",       field: "role",       value: profile?.role?.replace("_", " ") ?? displayRole },
                      { label: "Country",    field: "country",    value: profile?.country     ?? "" },
                    ].map(({ label, field, value }) => (
                      <div key={field}>
                        <label className="text-[11px] font-semibold text-[var(--muted)] uppercase tracking-wider mb-1.5 block">{label}</label>
                        <input
                          key={value}
                          ref={(el) => { profRefs.current[field] = el; }}
                          defaultValue={value}
                          readOnly={field === "email" || field === "role"}
                          className={cn("w-full px-3 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--background)] text-sm text-[var(--foreground)] outline-none transition-all",
                            field === "email" || field === "role"
                              ? "opacity-60 cursor-not-allowed"
                              : "focus:border-[#FBD12D]/40 focus:ring-2 focus:ring-[#FBD12D]/10"
                          )}
                        />
                      </div>
                    ))}
                  </div>

                  <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.97 }} onClick={handleSaveProfile}
                    className="mt-5 px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#FBD12D] to-[#FBD12D] text-black text-sm font-semibold shadow-gold-sm">
                    Save Changes
                  </motion.button>
                </div>
              </motion.div>
            )}

            {/* ── SECURITY ── */}
            {activeTab === "security" && (
              <motion.div key="security" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
                <div className="card p-6">
                  <h3 className="text-sm font-bold text-[var(--foreground)] mb-5">Change Password</h3>
                  <div className="space-y-4 max-w-md">
                    {["Current Password", "New Password", "Confirm New Password"].map((label, idx) => (
                      <div key={label}>
                        <label className="text-[11px] font-semibold text-[var(--muted)] uppercase tracking-wider mb-1.5 block">{label}</label>
                        <div className="relative">
                          <input
                            ref={(el) => { if (el) pwRefs.current[idx] = el; }}
                            type={showPassword ? "text" : "password"}
                            placeholder="••••••••"
                            className="w-full px-3 py-2.5 pr-10 rounded-xl border border-[var(--border)] bg-[var(--background)] text-sm text-[var(--foreground)] outline-none focus:border-[#FBD12D]/40 transition-all"
                          />
                          <button onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted)] hover:text-[var(--foreground)] transition-colors">
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                    ))}
                    <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.97 }} onClick={handleUpdatePassword}
                      className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#FBD12D] to-[#FBD12D] text-black text-sm font-semibold shadow-gold-sm">
                      Update Password
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ── ROLES ── */}
            {activeTab === "roles" && (
              <motion.div key="roles" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
                <div className="card overflow-hidden">
                  <div className="flex items-center justify-between px-6 py-5 border-b border-[var(--border)]">
                    <h3 className="text-sm font-bold text-[var(--foreground)]">Roles & Permissions</h3>
                  </div>
                  <div className="divide-y divide-[var(--border)]">
                    {roleList.length === 0 && (
                      <p className="text-sm text-[var(--muted)] text-center py-10">No admin users found</p>
                    )}
                    {roleList.map((u: any, i: number) => {
                      const name = `${u.first_name ?? ""} ${u.last_name ?? ""}`.trim() || u.email;
                      const color = roleColors[u.role] ?? roleColors.user;
                      return (
                        <motion.div key={u.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                          className="flex items-center gap-4 px-6 py-4 hover:bg-[#FBD12D]/3 transition-colors">
                          <div className="w-9 h-9 rounded-xl bg-[#FBD12D]/10 border border-[#FBD12D]/20 flex items-center justify-center shrink-0">
                            <span className="text-[11px] font-bold text-[#FBD12D]">{name.slice(0,2).toUpperCase()}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-[var(--foreground)] truncate">{name}</p>
                            <p className="text-xs text-[var(--muted)] truncate">{u.email}</p>
                          </div>
                          <span className={cn("badge border text-xs capitalize", color)}>{u.role?.replace("_", " ")}</span>
                          <select
                            value={u.role}
                            onChange={(e) => handleUpdateRole(u.id, e.target.value)}
                            className="text-xs px-2 py-1.5 rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] outline-none focus:border-[#FBD12D]/40 cursor-pointer">
                            {["super_admin","admin","kyc_agent","support"].map((r) => (
                              <option key={r} value={r}>{r.replace("_"," ")}</option>
                            ))}
                          </select>
                          {u.role !== "super_admin" && (
                            <motion.button whileTap={{ scale: 0.9 }} onClick={() => handleRemoveRole(u.id)}
                              className="w-7 h-7 rounded-lg border border-danger/20 bg-danger/5 text-danger flex items-center justify-center hover:bg-danger/10 transition-colors">
                              <Trash2 className="w-3.5 h-3.5" />
                            </motion.button>
                          )}
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            )}

            {/* ── API KEYS ── */}
            {activeTab === "api" && (
              <motion.div key="api" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
                <div className="card overflow-hidden">
                  <div className="flex items-center justify-between px-6 py-5 border-b border-[var(--border)]">
                    <div>
                      <h3 className="text-sm font-bold text-[var(--foreground)]">API Keys</h3>
                      <p className="text-xs text-[var(--muted)] mt-0.5">Manage API access for integrations</p>
                    </div>
                    <motion.button whileTap={{ scale: 0.97 }} onClick={handleGenerateKey}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#FBD12D] to-[#FBD12D] text-black text-xs font-semibold shadow-gold-sm flex items-center gap-1.5">
                      <Plus className="w-3.5 h-3.5" /> Generate Key
                    </motion.button>
                  </div>
                  <div className="divide-y divide-[var(--border)]">
                    {keyList.length === 0 && (
                      <p className="text-sm text-[var(--muted)] text-center py-10">No API keys yet</p>
                    )}
                    {keyList.map((key: any, i: number) => (
                      <motion.div key={key.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                        className="px-6 py-5">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <p className="text-sm font-bold text-[var(--foreground)]">{key.name}</p>
                            <p className="text-xs text-[var(--muted)] mt-0.5">Created {key.created} · Last used {key.lastUsed}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="badge border border-success/20 text-success bg-success/10 text-[10px]">{key.status}</span>
                            <motion.button whileTap={{ scale: 0.9 }} onClick={() => handleDeleteKey(key.id)}
                              className="w-7 h-7 rounded-lg border border-danger/20 bg-danger/5 text-danger flex items-center justify-center hover:bg-danger/10 transition-colors">
                              <Trash2 className="w-3.5 h-3.5" />
                            </motion.button>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 p-3 rounded-xl bg-[var(--background)] border border-[var(--border)] mb-3">
                          <code className="text-xs font-mono text-[var(--muted)] flex-1 truncate">
                            {key.rawKey ?? `${key.prefix ?? key.id?.toString().slice(0,8) ?? ""}••••••••`}
                          </code>
                          <motion.button whileTap={{ scale: 0.9 }} onClick={() => handleCopy(key.rawKey ?? key.id, key.id)}
                            className="flex items-center gap-1 text-[10px] text-[#FBD12D] font-medium shrink-0">
                            {copied === key.id ? <CheckCircle className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                            {copied === key.id ? "Copied" : key.rawKey ? "Copy Key" : "Copy ID"}
                          </motion.button>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {(key.scopes ?? []).map((scope: string) => (
                            <span key={scope} className="px-2 py-0.5 rounded-md bg-[var(--border)] text-[10px] text-[var(--muted)] font-mono">{scope}</span>
                          ))}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
