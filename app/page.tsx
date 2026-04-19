"use client";

import { useState, useRef, useEffect, FormEvent } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ArrowUpRight, X } from "@phosphor-icons/react";
import { TypefaceCard } from "@/components/TypefaceCard";
import { GlobeBackground } from "@/components/GlobeBackground";
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
          className="col-start-1 row-start-1 flex items-start pointer-events-none font-sans text-[16px] normal-case"
          style={{ color: "rgba(21,21,21,0.40)" }}
          aria-hidden="true"
        >
          <motion.span
            animate={{ opacity: [1, 1, 0, 0] }}
            transition={{ duration: 1, repeat: Infinity, repeatType: "loop", times: [0, 0.5, 0.5, 1], ease: "linear" }}
            className="inline-block w-[1px] h-[1em] mr-[2px] mt-[0.15em] flex-shrink-0"
            style={{ background: "rgba(21,21,21,0.40)" }}
          />
          {displayed}
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

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const q = params.get("q");
    if (q) {
      setQuery(q);
      void runSearch(q);
      window.history.replaceState({}, "", "/");
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
  const isLoading = status === "loading";

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="relative min-h-[100dvh] flex flex-col">

      {/* ── Main — flex-1 so taglines below are pinned to bottom ───────────── */}
      <main
        className={`flex-1 flex flex-col px-6 w-full ${
          isIdle
            ? "items-center justify-center"
            : "pt-16"
        }`}
      >

        {/* ── Globe background (idle only) ─────────────────────────────────── */}
        <AnimatePresence>
          {isIdle && (
            <motion.div
              key="globe"
              className="absolute inset-0 w-full h-full"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
              style={{ zIndex: -1 }}
            >
              <GlobeBackground query={query} dissolving={isLoading} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── TYPESCOUT wordmark (idle only) — pinned to top ─────────────── */}
        <AnimatePresence>
          {isIdle && (
            <motion.div
              key="wordmark"
              className="absolute top-0 left-0 right-0 flex justify-center px-6 pt-8 pointer-events-none select-none"
              style={{ zIndex: 1 }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
              aria-label="TypeScout"
            >
              <svg className="h-10 w-auto" viewBox="0 0 338 62" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M320.181 46.872C319.533 46.872 318.885 46.584 318.381 46.08L312.765 40.464C312.405 40.104 312.117 39.6 312.117 39.024V18.072H318.669V40.392L333.285 25.776L337.821 30.24L321.981 46.08C321.477 46.584 320.829 46.872 320.181 46.872ZM312.117 7.344V0H318.669V8.928C318.669 9.792 319.389 10.512 320.325 10.512H337.173V16.992H321.117C320.037 16.992 319.605 16.56 318.885 15.84L313.269 10.224C312.477 9.432 312.117 8.424 312.117 7.344Z" fill="#151515"/>
                <path d="M279.048 46.872C278.4 46.872 277.752 46.584 277.248 46.08L271.632 40.464C271.272 40.104 270.984 39.6 270.984 39.024V10.512H277.536V40.392L292.152 25.776L296.688 30.24L280.848 46.08C280.344 46.584 279.696 46.872 279.048 46.872ZM298.344 46.872V10.512H304.896V46.872H298.344Z" fill="#151515"/>
                <path d="M238.795 46.872C237.715 46.872 236.707 46.44 235.987 45.72L230.371 40.104C229.579 39.312 229.219 38.304 229.219 37.224V20.16C229.219 19.08 229.579 18.072 230.371 17.28L235.987 11.664C236.707 10.944 237.715 10.512 238.795 10.512H254.203C255.283 10.512 256.291 10.944 257.011 11.664L262.627 17.28C263.419 18.072 263.779 19.08 263.779 20.16V37.224C263.779 38.304 263.419 39.312 262.627 40.104L257.011 45.72C256.291 46.44 255.283 46.872 254.203 46.872H238.795ZM235.771 38.808C235.771 39.672 236.491 40.392 237.427 40.392H255.571C256.507 40.392 257.227 39.672 257.227 38.808V18.576C257.227 17.712 256.507 16.992 255.571 16.992H237.427C236.491 16.992 235.771 17.712 235.771 18.576V38.808Z" fill="#151515"/>
                <path d="M201.388 46.872C200.308 46.872 199.3 46.44 198.58 45.72L192.964 40.104C192.172 39.312 191.812 38.304 191.812 37.224V20.16C191.812 19.08 192.172 18.072 192.964 17.28L198.58 11.664C199.3 10.944 200.308 10.512 201.388 10.512H222.772V16.992H200.02C199.084 16.992 198.364 17.712 198.364 18.576V38.808C198.364 39.672 199.084 40.392 200.02 40.392H222.772V46.872H201.388Z" fill="#151515"/>
                <path d="M185.653 44.64C185.653 45.216 185.365 45.792 184.933 46.152C184.501 46.584 183.853 46.872 183.133 46.872H153.757V40.392H181.549L169.885 28.728L174.349 24.264L184.933 34.848C185.365 35.28 185.653 35.928 185.653 36.576V44.64ZM154.117 20.88V12.744C154.117 12.168 154.405 11.592 154.837 11.232C155.269 10.8 155.917 10.512 156.637 10.512H186.013V16.992H158.149L169.885 28.728L165.421 33.192L154.837 22.608C154.405 22.176 154.117 21.528 154.117 20.88Z" fill="#151515"/>
                <path d="M125.099 46.872C124.019 46.872 123.011 46.44 122.291 45.72L116.675 40.104C115.883 39.312 115.523 38.304 115.523 37.224V20.16C115.523 19.08 115.883 18.072 116.675 17.28L122.291 11.664C123.011 10.944 124.019 10.512 125.099 10.512H140.867C141.443 10.512 141.947 10.8 142.307 11.16L147.923 16.776C148.427 17.28 148.715 17.928 148.715 18.576C148.715 19.224 148.427 19.872 147.923 20.376L131.003 37.296L126.467 32.832L142.307 16.992H123.731C122.795 16.992 122.075 17.712 122.075 18.576V38.808C122.075 39.672 122.795 40.392 123.731 40.392H147.059V46.872H125.099Z" fill="#151515"/>
                <path d="M72.5625 20.16C72.5625 19.08 72.9225 18.072 73.7145 17.28L79.3305 11.664C80.0505 10.944 81.0585 10.512 82.1385 10.512H98.7705C99.8505 10.512 100.858 10.944 101.578 11.664L107.195 17.28C107.987 18.072 108.347 19.08 108.347 20.16V39.024C108.347 39.6 108.059 40.104 107.699 40.464L102.083 46.08C101.579 46.584 100.931 46.872 100.283 46.872C99.6345 46.872 98.9865 46.584 98.4825 46.08L81.4905 29.088L86.0265 24.624L101.795 40.392V18.576C101.795 17.712 101.075 16.992 100.139 16.992H80.7705C79.8345 16.992 79.1145 17.712 79.1145 18.576V61.272H72.5625V20.16Z" fill="#151515"/>
                <path d="M34.0937 61.272V54.792H57.0617C57.9977 54.792 58.7897 54.072 58.7897 53.208V10.512H65.3417V51.624C65.3417 52.704 64.9817 53.712 64.1897 54.504L58.5737 60.12C57.8537 60.84 56.8457 61.272 55.7657 61.272H34.0937ZM31.4297 39.024V10.512H37.9817V40.392L52.5977 25.776L57.1337 30.24L41.2937 46.08C40.7897 46.584 40.1417 46.872 39.4937 46.872C38.8457 46.872 38.1977 46.584 37.6937 46.08L32.0777 40.464C31.7177 40.104 31.4297 39.6 31.4297 39.024Z" fill="#151515"/>
                <path d="M8.064 46.872C7.416 46.872 6.768 46.584 6.264 46.08L0.648 40.464C0.288 40.104 0 39.6 0 39.024V18.072H6.552V40.392L21.168 25.776L25.704 30.24L9.864 46.08C9.36 46.584 8.712 46.872 8.064 46.872ZM0 7.344V0H6.552V8.928C6.552 9.792 7.272 10.512 8.208 10.512H25.056V16.992H9C7.92 16.992 7.488 16.56 6.768 15.84L1.152 10.224C0.36 9.432 0 8.424 0 7.344Z" fill="#151515"/>
              </svg>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Search card ─────────────────────────────────────────────────── */}
        <motion.form
          onSubmit={handleSubmit}
          layout="position"
          transition={{ duration: 0.45, ease: [0.25, 0.1, 0.25, 1] }}
          className="w-full max-w-[850px] mx-auto"
        >
          <motion.div
            layout="position"
            transition={{ duration: 0.45, ease: [0.25, 0.1, 0.25, 1] }}
            className={
              isIdle
                ? "rounded-[4px] bg-white flex flex-col justify-between p-[16px] min-h-[100px]"
                : "rounded-[4px] bg-white flex flex-row items-center gap-3 py-[12px] px-[16px]"
            }
            style={{ border: "1px solid #151515" }}
          >
            {/* Row 1 — Input (anchored to top) */}
            <motion.div layout className="flex items-center gap-3 flex-1 min-w-0">
              <div className="grid flex-1 min-w-0">
                <input
                  ref={inputRef}
                  autoFocus
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder=""
                  className="col-start-1 row-start-1 w-full bg-transparent text-[16px] font-sans text-[#000000] uppercase outline-none"
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
            </motion.div>

            {/* Row 2 — Action bar (idle only) */}
            <AnimatePresence>
              {isIdle && (
                <motion.div
                  key="action-bar"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15, ease: [0.25, 0.1, 0.25, 1] }}
                  className="flex items-end justify-between pt-2"
                >
                  <span className="font-sans text-[14px] font-light uppercase" style={{ color: "rgba(21,21,21,0.50)" }}>
                    V.{process.env.NEXT_PUBLIC_APP_VERSION}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="submit"
                      disabled={!query.trim()}
                      className="font-sans text-[14px] text-[#151515] uppercase px-[8px] py-[4px] rounded-[2px] cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed transition-colors hover:bg-[#e0ded8]"
                      style={{ border: "0.5px solid #151515" }}
                    >
                      Search
                    </button>
                    <button
                      type="submit"
                      disabled={!query.trim()}
                      aria-label="Search"
                      className="w-6 h-6 rounded-full bg-[#f4fbd4] flex items-center justify-center flex-shrink-0 text-[#151515] disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-opacity hover:opacity-80"
                      style={{ border: "0.5px solid #151515" }}
                    >
                      <ArrowUpRight size={12} weight="regular" aria-hidden="true" />
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Compact submit — active state only */}
            <AnimatePresence>
              {!isIdle && (
                <motion.button
                  key="compact-submit"
                  type="submit"
                  disabled={status === "loading" || !query.trim()}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.15, ease: [0.25, 0.1, 0.25, 1] }}
                  aria-label="Search"
                  className="w-6 h-6 rounded-full bg-[#f4fbd4] flex items-center justify-center flex-shrink-0 text-[#151515] disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-opacity hover:opacity-80"
                  style={{ border: "0.5px solid #151515" }}
                >
                  <ArrowUpRight size={12} weight="regular" aria-hidden="true" />
                </motion.button>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.form>

        {/* ── Results area (active state) ──────────────────────────────────── */}
        {!isIdle && (
          <section aria-live="polite" aria-label="Search results" className="mt-10 w-full">

            {/* Loading bar — sweeps full-width at 2px, fades out when results arrive */}
            <AnimatePresence>
              {status === "loading" && (
                <motion.div
                  key="loading-bar"
                  className="w-full overflow-hidden mb-4"
                  style={{ height: "2px" }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <motion.div
                    className="h-full w-full bg-[#151515]"
                    animate={{ x: ["-100%", "100%"] }}
                    transition={{ duration: 0.9, ease: "linear", repeat: Infinity }}
                  />
                </motion.div>
              )}
            </AnimatePresence>

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
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {results.map((typeface, i) => (
                      <TypefaceCard key={typeface._id} typeface={typeface} index={i} score={submittedQuery ? (typeface._score ?? 0) : 0} />
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
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Footer — always visible ──────────────────────────────────────────── */}
      <footer className={`px-6 pb-8 text-center${isIdle ? "" : " mt-16"}`}>
        <p
          className="font-sans text-[14px] uppercase"
          style={{ color: "rgba(21,21,21,0.50)" }}
        >
          Made by:{" "}
          <a
            href="https://auguststrategy.com"
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-2 hover:opacity-70 transition-opacity"
          >
            August Strategy
          </a>
        </p>
      </footer>

    </div>
  );
}
