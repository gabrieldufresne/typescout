"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { ArrowUpRight } from "@phosphor-icons/react";

export function DetailSearchBar() {
  const [query, setQuery] = useState("");
  const router = useRouter();

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const q = query.trim();
    router.push(q ? `/?q=${encodeURIComponent(q)}` : "/");
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex items-center gap-2 bg-white w-full px-3 py-[10px]"
      style={{ border: "0.5px solid #151515", borderRadius: "2px" }}
    >
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search typefaces…"
        aria-label="Search typefaces"
        className="flex-1 bg-transparent font-sans text-[13px] uppercase tracking-[.02em] text-[#000000] outline-none min-w-0 placeholder:text-[rgba(21,21,21,0.4)] placeholder:normal-case"
      />
      <button
        type="submit"
        aria-label="Search"
        className="w-[22px] h-[22px] rounded-full bg-[#f4fbd4] flex items-center justify-center flex-shrink-0 cursor-pointer"
        style={{ border: "0.5px solid #151515" }}
      >
        <ArrowUpRight size={10} weight="regular" aria-hidden="true" />
      </button>
    </form>
  );
}
