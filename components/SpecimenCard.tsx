"use client";

import { useState } from "react";

interface SpecimenCardProps {
  name: string;
  foundryName: string;
  regularUrl: string | null;
  heavyUrl: string | null;
  weightCount: number;
}

export function SpecimenCard({ name, foundryName, regularUrl, heavyUrl, weightCount }: SpecimenCardProps) {
  const [isHeavy, setIsHeavy] = useState(false);
  const hasHeavy = !!heavyUrl;

  return (
    <div
      className="rounded-[12px] bg-[#f2f1ed] overflow-hidden"
      onMouseEnter={() => hasHeavy && setIsHeavy(true)}
      onMouseLeave={() => hasHeavy && setIsHeavy(false)}
    >
      <div className="m-4 rounded-[6px] bg-white overflow-hidden">

        {/* Header row — centred */}
        <div className="flex items-center justify-center px-6 pt-[18px] pb-[14px]">
          <p className="font-sans text-[12px] text-[#000000] uppercase tracking-[.02em] leading-none">
            {foundryName}
            <span className="mx-2 opacity-40">•</span>
            {name}
            {weightCount > 0 && (
              <>
                <span className="mx-2 opacity-40">•</span>
                <span style={{ color: "rgba(21,21,21,0.35)" }}>{weightCount} weights</span>
              </>
            )}
          </p>
        </div>

        {/* Specimen image — crossfades between regular and heavy */}
        <div
          className="px-6 py-10 min-h-[240px]"
          style={{ display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}
        >
          {regularUrl ? (
            <>
              {/* Regular */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={regularUrl}
                alt={`${name} specimen`}
                style={{
                  maxWidth: "86%",
                  maxHeight: "180px",
                  height: "auto",
                  display: "block",
                  position: hasHeavy ? "absolute" : "relative",
                  opacity: isHeavy ? 0 : 1,
                  transition: "opacity 0.3s ease",
                }}
              />
              {/* Heavy */}
              {heavyUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={heavyUrl}
                  alt={`${name} specimen — heavy weight`}
                  style={{
                    maxWidth: "86%",
                    maxHeight: "180px",
                    height: "auto",
                    display: "block",
                    position: "absolute",
                    opacity: isHeavy ? 1 : 0,
                    transition: "opacity 0.3s ease",
                  }}
                />
              )}
            </>
          ) : (
            <span className="font-sans text-[56px] font-bold text-[#000000] uppercase leading-none">
              {name}
            </span>
          )}
        </div>

        {/* Weight toggle — centred below specimen, only when heavy exists */}
        {hasHeavy && (
          <div className="flex justify-center pb-6">
            <div
              className="relative flex items-center rounded-[2px] overflow-hidden flex-shrink-0"
              style={{ border: "0.5px solid #151515" }}
            >
              {/* Sliding pill background */}
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  width: "50%",
                  background: "#151515",
                  transform: isHeavy ? "translateX(100%)" : "translateX(0)",
                  transition: "transform 0.22s cubic-bezier(0.25, 0.1, 0.25, 1)",
                  pointerEvents: "none",
                }}
              />
              {/* REG */}
              <button
                onClick={() => setIsHeavy(false)}
                className="relative z-10 flex items-center gap-[5px] px-[8px] py-[5px] cursor-pointer"
                style={{
                  color: isHeavy ? "rgba(21,21,21,0.35)" : "#ffffff",
                  transition: "color 0.22s ease",
                }}
                aria-label="Show regular weight"
              >
                <span
                  style={{
                    width: 9,
                    height: 9,
                    borderRadius: "50%",
                    border: `1px solid ${isHeavy ? "rgba(21,21,21,0.35)" : "#ffffff"}`,
                    display: "inline-block",
                    flexShrink: 0,
                    transition: "border-color 0.22s ease",
                  }}
                />
                <span className="font-sans text-[10px] uppercase tracking-[.08em]">Reg</span>
              </button>
              {/* HVY */}
              <button
                onClick={() => setIsHeavy(true)}
                className="relative z-10 flex items-center gap-[5px] px-[8px] py-[5px] cursor-pointer"
                style={{
                  color: isHeavy ? "#ffffff" : "rgba(21,21,21,0.35)",
                  transition: "color 0.22s ease",
                }}
                aria-label="Show heavy weight"
              >
                <span
                  style={{
                    width: 9,
                    height: 9,
                    borderRadius: "50%",
                    border: `4px solid ${isHeavy ? "#ffffff" : "rgba(21,21,21,0.35)"}`,
                    display: "inline-block",
                    flexShrink: 0,
                    transition: "border-color 0.22s ease",
                  }}
                />
                <span className="font-sans text-[10px] uppercase tracking-[.08em]">Hvy</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
