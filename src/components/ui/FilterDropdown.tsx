"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { ChevronDown, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface Option {
  value: string;
  label: string;
}

interface FilterDropdownProps {
  label: string;
  value: string;
  options: Option[];
  onChange: (value: string) => void;
  className?: string;
}

export function FilterDropdown({ label, value, options, onChange, className }: FilterDropdownProps) {
  const [open, setOpen] = useState(false);
  const [style, setStyle] = useState<React.CSSProperties>({});
  const [mounted, setMounted] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setMounted(true); }, []);

  const selected = options.find((o) => o.value === value);

  const updatePosition = useCallback(() => {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    const dropdownWidth = Math.max(rect.width, 180);
    // Flip left if it would overflow the right edge
    const leftPos = rect.right - dropdownWidth < 0 ? rect.left : rect.right - dropdownWidth;
    setStyle({
      position: "fixed",
      top: rect.bottom + 6,
      left: Math.max(8, leftPos),
      minWidth: dropdownWidth,
      zIndex: 99999,
    });
  }, []);

  const handleToggle = () => {
    updatePosition();
    setOpen((prev) => !prev);
  };

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        !buttonRef.current?.contains(target) &&
        !dropdownRef.current?.contains(target)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  // Reposition on scroll/resize
  useEffect(() => {
    if (!open) return;
    const handler = () => updatePosition();
    window.addEventListener("scroll", handler, true);
    window.addEventListener("resize", handler);
    return () => {
      window.removeEventListener("scroll", handler, true);
      window.removeEventListener("resize", handler);
    };
  }, [open, updatePosition]);

  const dropdown = (
    <AnimatePresence>
      {open && (
        <motion.div
          ref={dropdownRef}
          initial={{ opacity: 0, y: -6, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -6, scale: 0.97 }}
          transition={{ duration: 0.13, ease: [0.4, 0, 0.2, 1] }}
          style={style}
          className="rounded-2xl border border-[var(--border)] bg-[var(--card-bg)] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
        >
          {options.map((opt) => (
            <button
              key={opt.value}
              onMouseDown={(e) => {
                e.preventDefault();
                onChange(opt.value);
                setOpen(false);
              }}
              className={cn(
                "w-full flex items-center justify-between px-4 py-2.5 text-[13px] transition-colors text-left capitalize",
                value === opt.value
                  ? "text-[#FBD12D] font-semibold bg-[#FBD12D]/6"
                  : "text-[var(--foreground)] hover:bg-[var(--border-soft)]"
              )}
            >
              {opt.label}
              {value === opt.value && <Check className="w-3.5 h-3.5 text-[#FBD12D] shrink-0 ml-3" />}
            </button>
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <>
      <button
        ref={buttonRef}
        onClick={handleToggle}
        className={cn(
          "flex items-center gap-2 px-3.5 py-2 rounded-xl text-[13px] font-medium border transition-all select-none",
          open
            ? "border-[#FBD12D]/40 bg-[#FBD12D]/5 text-[var(--foreground)]"
            : "border-[var(--border)] text-[var(--muted)] hover:text-[var(--foreground)] hover:border-[var(--border)] bg-[var(--background)]",
          className
        )}
      >
        <span className="text-[11px] font-semibold uppercase tracking-wide text-[var(--muted)]">{label}</span>
        <span className={cn("font-semibold capitalize", value !== "all" ? "text-[#FBD12D]" : "text-[var(--foreground)]")}>
          {selected?.label ?? value}
        </span>
        <ChevronDown className={cn("w-3.5 h-3.5 text-[var(--muted)] transition-transform duration-200 shrink-0", open && "rotate-180")} />
      </button>
      {mounted && createPortal(dropdown, document.body)}
    </>
  );
}
