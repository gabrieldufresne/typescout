"use client";

import { CurrencyCircleDollar, Asterisk } from "@phosphor-icons/react";

export function SandTag({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="inline-flex items-center px-[8px] py-[4px] rounded-[2px] font-sans text-[12px] text-[#000000] bg-[#e0ded8] uppercase whitespace-nowrap tracking-[.02em]"
      style={{ border: "0.5px solid #151515" }}
    >
      {children}
    </span>
  );
}

export function OutlineTag({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="inline-flex items-center px-[8px] py-[4px] rounded-[2px] font-sans text-[12px] text-[#151515] bg-transparent uppercase whitespace-nowrap tracking-[.02em]"
      style={{ border: "0.5px solid #151515" }}
    >
      {children}
    </span>
  );
}

export function FeatureTag({
  children,
  icon: Icon,
}: {
  children: React.ReactNode;
  icon: React.ElementType;
}) {
  return (
    <span
      className="inline-flex items-center gap-[6px] pl-[6px] pr-[8px] py-[4px] rounded-[2px] font-sans text-[12px] text-[#000000] bg-[#f4fbd4] uppercase whitespace-nowrap tracking-[.02em]"
      style={{ border: "0.5px solid #151515" }}
    >
      <Icon size={12} aria-hidden="true" />
      {children}
    </span>
  );
}

export function FreeBadge() {
  return (
    <span
      className="inline-flex items-center gap-[6px] pl-[6px] pr-[8px] py-[4px] rounded-[2px] font-sans text-[12px] text-[#151515] bg-transparent uppercase whitespace-nowrap tracking-[.02em]"
      style={{ border: "0.5px solid #151515" }}
    >
      <Asterisk size={12} aria-hidden="true" />
      Free
    </span>
  );
}

export function PaidBadge({ variant = "outline" }: { variant?: "outline" | "dark" }) {
  const dark = variant === "dark";
  return (
    <span
      className={`inline-flex items-center gap-[6px] pl-[6px] pr-[8px] py-[4px] rounded-[2px] font-sans text-[12px] uppercase whitespace-nowrap tracking-[.02em] ${dark ? "bg-[#151515] text-[#fafafa]" : "bg-transparent text-[#151515]"}`}
      style={{ border: "0.5px solid #151515" }}
    >
      <CurrencyCircleDollar size={12} aria-hidden="true" />
      Paid
    </span>
  );
}
