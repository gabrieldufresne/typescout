"use client";

import { useState, useRef, useEffect, FormEvent } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ArrowUpRight, X } from "@phosphor-icons/react";
import { TypefaceCard } from "@/components/TypefaceCard";
import type { TypefaceResult, SearchStatus } from "@/lib/types";

// ── Animated placeholder prompts ─────────────────────────────────────────────

const PROMPTS = [
  "A typeface that feels like a modernist Swiss pharmaceutical brand",
  "Something warm and editorial for a food magazine",
  "Bold and geometric for a Berlin techno club poster",
  "Elegant serif for a luxury perfume label",
  "Friendly grotesque for a children's app",
  "High contrast display for a fashion editorial",
  "Condensed sans for a sports brand with attitude",
  "Something that looks like it belongs in a 70s Italian film title",
  "Clean monospace for developer documentation",
  "Expressive script for a Brooklyn coffee shop",
  "Neutral and functional for a medical information portal",
  "Slab serif that reads like a vintage newspaper",
  "Minimal and architectural for a gallery catalogue",
  "Something quirky and playful for a podcast brand",
  "A grotesque that feels distinctly Parisian",
  "Heavy blackletter for a metal band merchandise line",
  "Variable font that works from caption to headline",
  "Humanist sans for a non-profit annual report",
  "Geometric display with a retro-futurist feel",
  "Something that whispers rather than shouts — refined, quiet, confident",
];

// ── Loading dots ──────────────────────────────────────────────────────────────

function LoadingDots() {
  return (
    <div className="flex items-center justify-center gap-1.5 py-20" aria-label="Searching…">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="block w-1.5 h-1.5 rounded-full"
          style={{ background: "rgba(21,21,21,0.40)" }}
          animate={{ opacity: [0.2, 1, 0.2] }}
          transition={{
            duration: 1.2,
            repeat: Infinity,
            delay: i * 0.2,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

// ── No results state ──────────────────────────────────────────────────────────

function NoResults({ query }: { query: string }) {
  return (
    <motion.div
      key="no-results"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      className="text-center py-20"
    >
      <p
        className="font-sans text-[14px] uppercase"
        style={{ color: "rgba(21,21,21,0.40)" }}
      >
        No matches for{" "}
        <span className="text-[#151515]">&ldquo;{query}&rdquo;</span>
      </p>
      <p
        className="font-sans text-xs mt-2 uppercase"
        style={{ color: "rgba(21,21,21,0.40)" }}
      >
        Try describing the mood, use case, or contrast level differently.
      </p>
    </motion.div>
  );
}

// ── Error state ───────────────────────────────────────────────────────────────

function ErrorState({ message }: { message: string }) {
  return (
    <motion.div
      key="error"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      className="text-center py-20"
    >
      <p className="font-sans text-[14px] text-[#000000] uppercase">
        Something went wrong.
      </p>
      <p
        className="font-sans text-xs mt-2 max-w-md mx-auto"
        style={{ color: "rgba(21,21,21,0.40)" }}
      >
        {message}
      </p>
    </motion.div>
  );
}

// ── Animated placeholder ──────────────────────────────────────────────────────

function AnimatedPlaceholder({ visible }: { visible: boolean }) {
  const [index, setIndex] = useState(0);
  const [displayed, setDisplayed] = useState("");
  const [phase, setPhase] = useState<"typing" | "holding" | "clearing">("typing");

  useEffect(() => {
    if (!visible) return;
    const prompt = PROMPTS[index];

    if (phase === "typing") {
      if (displayed.length < prompt.length) {
        const t = setTimeout(() => setDisplayed(prompt.slice(0, displayed.length + 1)), 35);
        return () => clearTimeout(t);
      } else {
        setPhase("holding");
      }
    }

    if (phase === "holding") {
      const t = setTimeout(() => setPhase("clearing"), 2200);
      return () => clearTimeout(t);
    }

    if (phase === "clearing") {
      setDisplayed("");
      setIndex((i) => (i + 1) % PROMPTS.length);
      setPhase("typing");
    }
  }, [visible, phase, displayed, index]);

  useEffect(() => {
    if (visible) {
      setDisplayed("");
      setPhase("typing");
    }
  }, [visible]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.span
          key="animated-placeholder"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="absolute inset-0 flex items-center pointer-events-none font-sans text-[16px] normal-case"
          style={{ color: "rgba(21,21,21,0.40)" }}
          aria-hidden="true"
        >
          {displayed}
          <motion.span
            animate={{ opacity: [1, 0] }}
            transition={{ duration: 0.6, repeat: Infinity, repeatType: "reverse" }}
            className="inline-block w-[1px] h-[1em] ml-[1px] align-middle"
            style={{ background: "rgba(21,21,21,0.40)" }}
          />
        </motion.span>
      )}
    </AnimatePresence>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function HomePage() {
  const [query, setQuery] = useState("");
  const [submittedQuery, setSubmittedQuery] = useState("");
  const [status, setStatus] = useState<SearchStatus>("idle");
  const [results, setResults] = useState<TypefaceResult[]>([]);
  const [errorMessage, setErrorMessage] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // ── Search handler ──────────────────────────────────────────────────────────
  async function runSearch(q: string) {
    const trimmed = q.trim();
    if (!trimmed) return;

    setSubmittedQuery(trimmed);
    setStatus("loading");
    setResults([]);
    setErrorMessage("");

    try {
      const res = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: trimmed }),
      });

      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        throw new Error(data.error ?? `HTTP ${res.status}`);
      }

      const data = (await res.json()) as { results: TypefaceResult[]; tags?: unknown };
      console.log("[TypeScout] tags extracted by Claude:", data.tags);
      setResults(data.results ?? []);
      setStatus("success");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      setErrorMessage(msg);
      setStatus("error");
    }
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    void runSearch(query);
  }

  function handleReset() {
    setQuery("");
    setSubmittedQuery("");
    setStatus("idle");
    setResults([]);
    setErrorMessage("");
    inputRef.current?.focus();
  }

  const isIdle = status === "idle";

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-[100dvh] flex flex-col">

      {/* ── Main — flex-1 so taglines below are pinned to bottom ───────────── */}
      <main
        className={`flex-1 flex flex-col px-6 w-full ${
          isIdle
            ? "items-center justify-center gap-8"
            : "pt-16"
        }`}
      >

        {/* ── TYPESCOUT wordmark (idle only) ──────────────────────────────── */}
        <AnimatePresence>
          {isIdle && (
            <motion.img
              key="wordmark"
              src="/typescout-logo.svg"
              alt="TypeScout"
              className="mix-blend-multiply w-auto max-w-[360px] pointer-events-none select-none"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
            />
          )}
        </AnimatePresence>

        {/* ── Search card ─────────────────────────────────────────────────── */}
        <motion.form
          onSubmit={handleSubmit}
          layout="position"
          transition={{ duration: 0.45, ease: [0.25, 0.1, 0.25, 1] }}
          className="w-full max-w-[850px] mx-auto"
        >
          <div
            className="rounded-[24px] bg-white flex flex-col justify-between p-[24px] min-h-[200px]"
            style={{ border: "1px solid #E0DED8" }}
          >
            {/* Row 1 — Input (anchored to top) */}
            <div className="flex items-center gap-3">
              <div className="relative flex-1">
                <input
                  ref={inputRef}
                  autoFocus
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder=""
                  className="w-full bg-transparent text-[16px] font-sans text-[#000000] uppercase outline-none"
                  aria-label="Typeface search"
                  disabled={status === "loading"}
                />
                <AnimatedPlaceholder visible={query.length === 0 && status === "idle"} />
              </div>
              <AnimatePresence>
                {(query || status !== "idle") && (
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

            {/* Row 2 — Action bar (anchored to bottom via justify-between) */}
            <div className="flex items-center justify-between">
              <span className="font-sans text-[14px] font-semibold text-[#000000] uppercase">
                V.1.0
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="submit"
                  disabled={status === "loading" || !query.trim()}
                  className="font-sans text-[14px] text-[#151515] uppercase px-[8px] py-[4px] rounded-[2px] cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed transition-colors hover:bg-[#e0ded8]"
                  style={{ border: "0.5px solid #151515" }}
                >
                  Search
                </button>
                <button
                  type="submit"
                  disabled={status === "loading" || !query.trim()}
                  aria-label="Search"
                  className="w-6 h-6 rounded-full bg-[#f4fbd4] flex items-center justify-center flex-shrink-0 text-[#151515] disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-opacity hover:opacity-80"
                  style={{ border: "0.5px solid #151515" }}
                >
                  <ArrowUpRight size={12} weight="regular" aria-hidden="true" />
                </button>
              </div>
            </div>
          </div>
        </motion.form>

        {/* ── Results area (active state) ──────────────────────────────────── */}
        {!isIdle && (
          <section aria-live="polite" aria-label="Search results" className="mt-10 w-full">
            <AnimatePresence mode="wait">

              {status === "loading" && (
                <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <LoadingDots />
                </motion.div>
              )}

              {status === "error" && (
                <ErrorState key="error-state" message={errorMessage} />
              )}

              {status === "success" && results.length > 0 && (
                <motion.div
                  key="results"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <p
                    className="font-sans text-xs mb-6 uppercase tracking-[0.05em]"
                    style={{ color: "rgba(21,21,21,0.50)" }}
                  >
                    {results.length} typeface{results.length !== 1 ? "s" : ""} matched
                    {submittedQuery ? (
                      <>
                        {" "}for{" "}
                        <span className="text-[#151515]">&ldquo;{submittedQuery}&rdquo;</span>
                      </>
                    ) : null}
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    {results.map((typeface, i) => (
                      <TypefaceCard key={typeface._id} typeface={typeface} index={i} />
                    ))}
                  </div>
                </motion.div>
              )}

              {status === "success" && results.length === 0 && (
                <NoResults key="no-results-state" query={submittedQuery} />
              )}

            </AnimatePresence>
          </section>
        )}

      </main>

      {/* ── Taglines + attribution — bottom of viewport (idle only) ────────── */}
      <AnimatePresence>
        {isIdle && (
          <motion.div
            key="taglines"
            className="px-6 pb-8 text-center flex flex-col gap-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
          >
            <p className="font-sans text-[14px] text-[#000000] uppercase">
              Type for people who describe fonts like wine.
            </p>
            <p className="font-sans text-[14px] text-[#000000] uppercase">
              Search by feeling, not by checkbox.
            </p>
            <p
              className="font-sans text-[14px] uppercase mt-2"
              style={{ color: "rgba(21,21,21,0.50)" }}
            >
              Made by:{" "}
              <span className="underline underline-offset-2">August Strategy</span>
            </p>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
