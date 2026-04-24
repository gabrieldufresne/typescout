"use client";

import { useState, useRef, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { ArrowUpRight, X } from "@phosphor-icons/react";

function CtaArrowButton({ disabled }: { disabled?: boolean }) {
  return (
    <motion.button
      type="submit"
      disabled={disabled}
      aria-label="Search"
      className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-[#151515] disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
      style={{ border: "0.5px solid #151515" }}
      initial="rest"
      whileHover="hover"
      variants={{
        rest: { backgroundColor: "#f4fbd4" },
        hover: { backgroundColor: "#d4f070" },
      }}
      transition={{ duration: 0.15 }}
    >
      <motion.div
        variants={{ rest: { rotate: 0 }, hover: { rotate: 45 } }}
        transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
      >
        <ArrowUpRight size={12} weight="regular" aria-hidden="true" />
      </motion.div>
    </motion.button>
  );
}

export function DetailSearchBar() {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const q = query.trim();
    if (q) router.push(`/?q=${encodeURIComponent(q)}`);
  }

  function handleReset() {
    setQuery("");
    inputRef.current?.focus();
  }

  return (
    <>
      {/* Bottom gradient — lifts search bar from page content */}
      <div
        className="fixed bottom-0 left-0 right-0 z-30 pointer-events-none"
        style={{
          height: "180px",
          background: "linear-gradient(to bottom, rgba(255,255,255,0) 0%, rgba(255,255,255,1) 55%)",
          backdropFilter: "blur(8px)",
          WebkitBackdropFilter: "blur(8px)",
          maskImage: "linear-gradient(to bottom, transparent 0%, black 45%)",
          WebkitMaskImage: "linear-gradient(to bottom, transparent 0%, black 45%)",
        }}
      />

      {/* Fixed-bottom pill search bar */}
      <form
        onSubmit={handleSubmit}
        className="fixed bottom-8 left-0 right-0 mx-auto z-40 w-full max-w-[850px] px-6 md:px-0"
      >
        <div
          className="bg-white flex flex-row items-center gap-3 py-[12px] px-[16px] overflow-hidden"
          style={{ border: "1px solid #151515", borderRadius: 9999 }}
        >
          {/* Input + clear */}
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="flex-1 min-w-0">
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder=""
                autoComplete="on"
                autoCorrect="on"
                className="w-full bg-transparent text-[16px] font-sans text-[#000000] uppercase outline-none"
                aria-label="Typeface search"
              />
            </div>
            <AnimatePresence>
              {query && (
                <motion.button
                  key="reset"
                  type="button"
                  onClick={handleReset}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.15 }}
                  aria-label="Clear search"
                  className="flex-shrink-0 text-[#151515]/30 hover:text-[#151515]/70 transition-colors cursor-pointer"
                >
                  <X size={14} weight="regular" aria-hidden="true" />
                </motion.button>
              )}
            </AnimatePresence>
          </div>

          {/* Submit controls */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              type="submit"
              disabled={!query.trim()}
              className="font-sans text-[16px] text-[#151515] uppercase px-[8px] py-[4px] rounded-[2px] cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed transition-colors hover:bg-[#e0ded8]"
              style={{ border: "0.5px solid #151515" }}
            >
              Search
            </button>
            <CtaArrowButton disabled={!query.trim()} />
          </div>
        </div>
      </form>
    </>
  );
}
