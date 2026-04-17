"use client";

import { useRef } from "react";
import { motion } from "motion/react";
import {
  ArrowUpRight,
  Barbell,
  TextAa,
  UserFocus,
  PencilCircle,
  TextItalic,
  ArrowsOutLineHorizontal,
  Lock,
} from "@phosphor-icons/react";
import { urlFor } from "@/lib/sanity";
import type { TypefaceResult, WeightName } from "@/lib/types";

// ── Scrollable tag row ────────────────────────────────────────────────────────

function ScrollableTagRow({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const rafRef = useRef(0);

  function onMouseDown(e: React.MouseEvent) {
    if (!ref.current) return;
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const el = ref.current!;

    cancelAnimationFrame(rafRef.current);

    const startX = e.clientX;
    const startLeft = el.scrollLeft;
    let dragged = false;
    let velocity = 0;
    let lastX = e.clientX;
    let lastT = performance.now();

    function onMove(e: MouseEvent) {
      const now = performance.now();
      const dt = now - lastT;
      const dx = e.clientX - startX;
      if (!dragged && Math.abs(dx) > 4) {
        dragged = true;
        el.style.cursor = "grabbing";
      }
      if (dragged) {
        if (dt > 0) velocity = (lastX - e.clientX) / dt;
        el.scrollLeft = startLeft - dx;
        lastX = e.clientX;
        lastT = now;
      }
    }

    function onUp() {
      el.style.cursor = "";
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
      if (!dragged || Math.abs(velocity) < 0.05) return;
      let prev = performance.now();
      function step(now: number) {
        const dt = now - prev;
        prev = now;
        velocity *= 0.93 ** (dt / 16);
        el.scrollLeft += velocity * dt;
        if (Math.abs(velocity) > 0.05) {
          rafRef.current = requestAnimationFrame(step);
        }
      }
      rafRef.current = requestAnimationFrame(step);
    }

    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
  }

  return (
    <div className="relative flex-1 min-w-0">
      <div
        ref={ref}
        onMouseDown={onMouseDown}
        className="flex flex-nowrap items-center gap-2 overflow-x-auto cursor-grab select-none [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {children}
        {/* Trailing spacer so gradient never overlaps the last tag */}
        <div className="min-w-[32px] flex-shrink-0" aria-hidden="true" />
      </div>
      <div
        className="absolute inset-y-0 right-0 w-8 pointer-events-none"
        style={{ background: "linear-gradient(to right, transparent, #f2f1ed)" }}
      />
    </div>
  );
}

// ── Tag components ────────────────────────────────────────────────────────────

/** Sand-filled tag — classification, weight rows */
function SandTag({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="inline-flex items-center px-[8px] py-[4px] rounded-[2px] font-sans text-[0.785rem] text-[#000000] bg-[#e0ded8] uppercase whitespace-nowrap"
      style={{ border: "0.5px solid #151515" }}
    >
      {children}
    </span>
  );
}

/** Lime-filled tag — feature badges (Italics, Variable) */
function FeatureTag({ children, icon: Icon }: { children: React.ReactNode; icon: React.ElementType }) {
  return (
    <span
      className="inline-flex items-center gap-1 pl-[6px] pr-[8px] py-[4px] rounded-[2px] font-sans text-[0.785rem] text-[#000000] bg-[#f4fbd4] uppercase whitespace-nowrap"
      style={{ border: "0.5px solid #151515" }}
    >
      <Icon size={16} weight="regular" aria-hidden={true} />
      {children}
    </span>
  );
}

/** Transparent outline tag — personality, use-case rows */
function OutlineTag({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="inline-flex items-center px-[8px] py-[4px] rounded-[2px] font-sans text-[0.785rem] text-[#151515] bg-transparent uppercase whitespace-nowrap"
      style={{ border: "0.5px solid #151515" }}
    >
      {children}
    </span>
  );
}

/** Paid badge — outline, matches other tag styles */
function PaidBadge() {
  return (
    <span
      className="inline-flex items-center gap-1 pl-[6px] pr-[8px] py-[4px] rounded-[2px] font-sans text-[0.785rem] text-[#151515] bg-transparent uppercase whitespace-nowrap"
      style={{ border: "0.5px solid #151515" }}
    >
      <Lock size={14} weight="regular" aria-hidden="true" />
      Paid
    </span>
  );
}

// ── Row icons ─────────────────────────────────────────────────────────────────

const ROW_ICON_PROPS = {
  size: 20,
  weight: "regular" as const,
  "aria-hidden": true,
  style: { flexShrink: 0, color: "#151515" },
};

function ClassificationIcon() { return <TextAa {...ROW_ICON_PROPS} />; }
function WeightsIcon()        { return <Barbell {...ROW_ICON_PROPS} />; }
function PersonalityIcon()    { return <UserFocus {...ROW_ICON_PROPS} />; }
function UseCaseIcon()        { return <PencilCircle {...ROW_ICON_PROPS} />; }

// ── CTA circle (24px, lives in specimen header) ───────────────────────────────

function CtaCircle() {
  return (
    <div
      className="w-6 h-6 rounded-full bg-[#f4fbd4] flex items-center justify-center flex-shrink-0"
      style={{ border: "0.5px solid #151515" }}
    >
      <motion.div
        variants={{ rest: { rotate: 0 }, hover: { rotate: 45 } }}
        transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
      >
        <ArrowUpRight size={12} weight="regular" color="#151515" aria-hidden="true" />
      </motion.div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

interface TypefaceCardProps {
  typeface: TypefaceResult;
  index: number;
}

const WEIGHT_ORDER: WeightName[] = [
  "thin", "light", "regular", "medium", "semibold", "bold", "extrabold", "black",
];

export function TypefaceCard({ typeface, index }: TypefaceCardProps) {
  const specimenUrl =
    typeface.specimenImage?.asset
      ? urlFor(typeface.specimenImage).width(800).url()
      : null;

  const weights = WEIGHT_ORDER.filter((w) => typeface.weightRange?.includes(w));

  return (
    <motion.article
      variants={{ rest: { opacity: 1, y: 0 }, hover: {} }}
      initial={{ opacity: 0, y: 16 }}
      animate="rest"
      exit={{ opacity: 0, y: 8 }}
      transition={{ delay: index * 0.06, duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
      whileHover="hover"
      aria-label={`${typeface.name} by ${typeface.foundry?.name ?? "Unknown foundry"}`}
      className="relative rounded-[16px] bg-[#f2f1ed] overflow-hidden h-full flex flex-col"
    >
      {/* ── White specimen area ─────────────────────────────────────────────── */}
      <div className="mx-[16px] mt-[16px] rounded-[8px] bg-white overflow-hidden flex-1 flex flex-col justify-between">

        {/* Header row — foundry left, paid badge + arrow right */}
        <div className="flex items-center justify-between px-5 pt-4 pb-3">
          <p className="font-sans text-[0.785rem] text-[#000000] uppercase leading-none">
            {typeface.foundry?.name ?? "Unknown foundry"}
            <span className="mx-[6px] opacity-40">•</span>
            {typeface.name}
          </p>
          <div className="flex items-center gap-2">
            {typeface.licensing === "paid" && <PaidBadge />}
            <CtaCircle />
          </div>
        </div>

        {/* Specimen image */}
        <div className="ml-1 mr-5">
          {specimenUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={specimenUrl}
              alt={`${typeface.name} typeface specimen`}
              style={{ display: "block", width: "auto", height: "auto", maxHeight: "8rem", maxWidth: "100%" }}
            />
          ) : (
            <span className="font-sans text-[56px] font-bold text-[#000000] uppercase leading-none block">
              {typeface.name}
            </span>
          )}
        </div>
      </div>

      {/* ── Navigation link — covers card, above specimen, below tag rows ─────── */}
      {typeface.typefaceURL && (
        <a
          href={typeface.typefaceURL}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Open ${typeface.name} on foundry site`}
          className="absolute inset-0 rounded-[16px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#151515]/30 focus-visible:ring-offset-2 focus-visible:ring-offset-[#f2f1ed] cursor-pointer"
        />
      )}

      {/* ── Metadata section — full width tag rows ──────────────────────────── */}
      <div className="relative z-10 px-[16px] pt-4 pb-4 flex flex-col gap-2">

        {/* Row 1: Classification */}
        {typeface.classification && typeface.classification.length > 0 && (
          <div className="flex items-center gap-3">
            <ClassificationIcon />
            <ScrollableTagRow>
              {typeface.classification.map((c) => (
                <SandTag key={c}>{c}</SandTag>
              ))}
              {typeface.subClassification && (
                <SandTag>{typeface.subClassification}</SandTag>
              )}
            </ScrollableTagRow>
          </div>
        )}

        {/* Row 2: Weight count + feature badges */}
        {weights.length > 0 && (
          <div className="flex items-center gap-3">
            <WeightsIcon />
            <ScrollableTagRow>
              <SandTag>{weights.length} Weight{weights.length !== 1 ? "s" : ""}</SandTag>
              {typeface.hasItalics && (
                <>
                  <span className="font-sans text-[0.785rem] text-[#000000]">·</span>
                  <FeatureTag icon={TextItalic}><span className="sm:hidden">Ital</span><span className="hidden sm:inline">Italics</span></FeatureTag>
                </>
              )}
              {typeface.variableFont && (
                <>
                  <span className="font-sans text-[0.785rem] text-[#000000]">·</span>
                  <FeatureTag icon={ArrowsOutLineHorizontal}><span className="sm:hidden">Var</span><span className="hidden sm:inline">Variable</span></FeatureTag>
                </>
              )}
            </ScrollableTagRow>
          </div>
        )}

        {/* Row 3: Personality */}
        {typeface.personalityTags && typeface.personalityTags.length > 0 && (
          <div className="flex items-center gap-3">
            <PersonalityIcon />
            <ScrollableTagRow>
              {typeface.personalityTags.map((tag) => (
                <OutlineTag key={tag}>{tag}</OutlineTag>
              ))}
            </ScrollableTagRow>
          </div>
        )}

        {/* Row 4: Use cases */}
        {typeface.useCaseTags && typeface.useCaseTags.length > 0 && (
          <div className="flex items-center gap-3">
            <UseCaseIcon />
            <ScrollableTagRow>
              {typeface.useCaseTags.map((tag) => (
                <OutlineTag key={tag}>{tag}</OutlineTag>
              ))}
            </ScrollableTagRow>
          </div>
        )}

      </div>
    </motion.article>
  );
}
