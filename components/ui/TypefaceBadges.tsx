"use client";

import { TextItalic, ArrowsOutLineHorizontal } from "@phosphor-icons/react";
import { FeatureTag, PaidBadge } from "@/components/ui/Tag";

interface TypefaceBadgesProps {
  variableFont: boolean;
  hasItalics: boolean;
  licensing: string;
}

export function TypefaceBadges({ variableFont, hasItalics, licensing }: TypefaceBadgesProps) {
  return (
    <div className="flex items-center gap-2">
      {variableFont && <FeatureTag icon={ArrowsOutLineHorizontal}>Variable</FeatureTag>}
      {hasItalics && <FeatureTag icon={TextItalic}>Italics</FeatureTag>}
      {licensing === "paid" && <PaidBadge variant="dark" />}
    </div>
  );
}
