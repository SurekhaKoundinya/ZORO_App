"use client";

import { usePathname } from "next/navigation";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";
import { useAuth } from "@/lib/auth";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { isAuthenticated } = useAuth();

  // Login page — render without shell
  if (pathname === "/login") {
    return <>{children}</>;
  }

  // Not authenticated yet — render nothing (auth redirect happens in AuthProvider)
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center"
        style={{ background: "linear-gradient(135deg, #0A0A0A 0%, #111008 100%)" }}>
        <div className="w-8 h-8 border-2 border-[#FBD12D]/30 border-t-[#FBD12D] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--background)]">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <TopBar />
        <main className="flex-1 overflow-y-auto">
          <div className="p-6 animate-fade-in">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
