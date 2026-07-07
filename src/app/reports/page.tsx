"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FileText, Download, RefreshCw, TrendingUp, Users, Wallet, ArrowLeftRight, GitBranch, CheckCircle, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/Toast";
import { reportsApi, API_BASE, getToken } from "@/lib/api";

const formatColors: Record<string, string> = {
  CSV:   "text-success bg-success/10 border-success/20",
  Excel: "text-[#1D6F42] bg-[#1D6F42]/10 border-[#1D6F42]/20",
  PDF:   "text-danger bg-danger/10 border-danger/20",
  XLSX:  "text-[#1D6F42] bg-[#1D6F42]/10 border-[#1D6F42]/20",
};

const typeIcon: Record<string, React.ElementType> = {
  revenue:    TrendingUp,
  user:       Users,
  users:      Users,
  transaction: ArrowLeftRight,
  wallet:     Wallet,
  wallets:    Wallet,
  referral:   GitBranch,
  compliance: CheckCircle,
  kyc:        CheckCircle,
  custom:     FileText,
};

export default function ReportsPage() {
  const { toast } = useToast();
  const [reportList, setReportList] = useState<any[]>([]);
  const [generating, setGenerating] = useState(false);
  const [reportStats, setReportStats] = useState<any>({});

  useEffect(() => {
    reportsApi.list().then((r) => {
      if (Array.isArray(r)) {
        setReportList(r);
        setReportStats({ total: r.length, ready: r.filter((x: any) => x.status === "ready" || x.status === "completed").length });
      } else if (r.data) {
        setReportList(r.data);
        setReportStats({
          total: (r as any).meta?.total ?? r.data.length,
          ready: r.data.filter((x: any) => x.status === "ready" || x.status === "completed").length,
          ...(r as any).meta,
        });
      }
    }).catch(() => {});
  }, []);

  const handleDownload = async (report: any, fmt?: string) => {
    const reportId = report.id ?? report.report_id;
    const title    = report.title ?? report.report_type ?? "Report";
    const format   = fmt ?? report.format ?? "csv";
    try {
      const token = getToken();
      const url   = reportsApi.downloadUrl(reportId);
      const res   = await fetch(url, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
      if (res.ok) {
        const blob  = await res.blob();
        const burl  = URL.createObjectURL(blob);
        const a     = document.createElement("a");
        a.href      = burl;
        a.download  = `${title.replace(/\s+/g, "_")}.${format.toLowerCase()}`;
        a.click();
        URL.revokeObjectURL(burl);
        toast("success", "Download Started", `${title} (${format.toUpperCase()}) is downloading`);
        return;
      }
    } catch { /* fall through */ }
    toast("error", "Download Failed", "Could not download report — check your connection");
  };

  const handleGenerateNew = async () => {
    setGenerating(true);
    toast("info", "Generating Report", "Your report is being prepared...");
    try {
      const r = await reportsApi.generate("custom", "csv");
      toast("success", "Report Ready", "Custom report has been generated");
      if (r.data) setReportList((prev) => [r.data, ...prev]);
    } catch (e: any) {
      toast("error", "Generation Failed", e?.message ?? "Could not generate report");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">Reports</h1>
          <p className="text-sm text-[var(--muted)] mt-0.5">Export and analyze platform data</p>
        </div>
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} onClick={handleGenerateNew} disabled={generating}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#FBD12D] to-[#FBD12D] text-black text-sm font-semibold shadow-gold-sm flex items-center gap-2 disabled:opacity-70">
          <RefreshCw className={cn("w-4 h-4", generating && "animate-spin")} />
          {generating ? "Generating..." : "Generate New Report"}
        </motion.button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Reports Available",   value: (reportStats.total        ?? reportList.length).toLocaleString(),                          icon: FileText   },
          { label: "Ready to Download",   value: (reportStats.ready        ?? reportList.filter((r) => r.status === "ready" || r.status === "completed").length).toLocaleString(), icon: Download   },
          { label: "Scheduled Reports",   value: (reportStats.scheduled    ?? 0).toLocaleString(),                                          icon: RefreshCw  },
        ].map((s) => {
          const Icon = s.icon;
          return (
            <motion.div key={s.label} whileHover={{ y: -2 }} className="card p-5 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-[#FBD12D]/10 border border-[#FBD12D]/20 flex items-center justify-center">
                <Icon className="w-5 h-5 text-[#FBD12D]" />
              </div>
              <div>
                <p className="text-2xl font-bold text-[var(--foreground)]">{s.value}</p>
                <p className="text-xs text-[var(--muted)]">{s.label}</p>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Report Cards from API */}
      {reportList.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {reportList.map((report: any, i: number) => {
            const title    = report.title ?? report.report_type ?? `Report #${report.id}`;
            const desc     = report.description ?? report.report_type ?? "";
            const status   = report.status ?? "ready";
            const size     = report.file_size ?? report.size ?? "";
            const generated = report.generated_at?.slice(0, 10) ?? report.created_at?.slice(0, 10) ?? report.generated ?? "";
            const formats: string[]  = report.formats ?? (report.format ? [report.format.toUpperCase()] : ["CSV"]);
            const rtype    = (report.report_type ?? report.type ?? "custom").toLowerCase();
            const Icon     = typeIcon[rtype] ?? FileText;
            const isReady  = status === "ready" || status === "completed";
            return (
              <motion.div key={report.id ?? i} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
                whileHover={{ y: -3 }} className="card p-6 relative overflow-hidden">
                {!isReady && (
                  <div className="absolute top-3 right-3">
                    <RefreshCw className="w-3.5 h-3.5 text-[var(--muted)] animate-spin" />
                  </div>
                )}
                <div className="w-10 h-10 rounded-xl bg-[#FBD12D]/10 border border-[#FBD12D]/20 flex items-center justify-center mb-4">
                  <Icon className="w-5 h-5 text-[#FBD12D]" />
                </div>
                <h3 className="text-sm font-bold text-[var(--foreground)] mb-1.5 capitalize">{title.replace(/_/g, " ")}</h3>
                {desc && <p className="text-xs text-[var(--muted)] leading-relaxed mb-4">{desc}</p>}
                <div className="flex items-center gap-1.5 mb-4">
                  {formats.map((fmt: string) => (
                    <span key={fmt} className={cn("badge border text-[10px]", formatColors[fmt.toUpperCase()] ?? "text-[var(--muted)] border-[var(--border)]")}>{fmt.toUpperCase()}</span>
                  ))}
                </div>
                {(generated || size) && (
                  <div className="flex items-center justify-between text-[11px] text-[var(--muted)] mb-4">
                    {generated && <span>{generated}</span>}
                    {size      && <span>{size}</span>}
                  </div>
                )}
                {isReady ? (
                  <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${formats.length}, 1fr)` }}>
                    {formats.map((fmt: string) => (
                      <motion.button key={fmt} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                        onClick={() => handleDownload(report, fmt.toLowerCase())}
                        className={cn("flex items-center justify-center gap-1.5 py-2 rounded-xl border text-[11px] font-semibold transition-all hover:opacity-80",
                          formatColors[fmt.toUpperCase()] ?? "text-[var(--muted)] border-[var(--border)]")}>
                        <Download className="w-3 h-3" />
                        {fmt.toUpperCase()}
                      </motion.button>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center gap-2 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--background)] justify-center">
                    <RefreshCw className="w-3.5 h-3.5 text-[var(--muted)] animate-spin" />
                    <span className="text-xs text-[var(--muted)]">Processing...</span>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      ) : (
        <div className="card p-16 flex flex-col items-center justify-center text-center">
          <div className="w-14 h-14 rounded-2xl bg-[#FBD12D]/10 border border-[#FBD12D]/20 flex items-center justify-center mb-4">
            <FileText className="w-7 h-7 text-[#FBD12D]" />
          </div>
          <p className="text-base font-semibold text-[var(--foreground)] mb-1">No reports yet</p>
          <p className="text-sm text-[var(--muted)] mb-5">Generate your first report to see it here</p>
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} onClick={handleGenerateNew} disabled={generating}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#FBD12D] to-[#FBD12D] text-black text-sm font-semibold shadow-gold-sm flex items-center gap-2 disabled:opacity-70">
            <RefreshCw className={cn("w-4 h-4", generating && "animate-spin")} />
            {generating ? "Generating..." : "Generate Report"}
          </motion.button>
        </div>
      )}
    </div>
  );
}
