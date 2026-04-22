import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import {
  ArrowUpRight,
  Globe,
  ArrowsOutLineHorizontal,
  Ruler,
  CircleHalf,
  TextItalic,
  SlidersHorizontal,
  TextAa,
  UserFocus,
  Shapes,
  Calendar,
} from "@phosphor-icons/react/dist/ssr";
import { client, urlFor } from "@/lib/sanity";
import type { TypefaceDetail, RelatedTypeface, WeightName } from "@/lib/types";
import { DetailSearchBar } from "@/components/DetailSearchBar";
import { SandTag, OutlineTag, PaidBadge, FreeBadge } from "@/components/ui/Tag";

// ── GROQ queries ──────────────────────────────────────────────────────────────

const DETAIL_QUERY = `*[_type == "typeface" && slug.current == $slug][0] {
  _id,
  name,
  "slug": slug.current,
  "foundry": foundry->{ _id, name, slug, location, website, description },
  specimenImage,
  specimenImageHeavy,
  editorialNote,
  classification,
  subClassification,
  personalityTags,
  useCaseTags,
  weightRange,
  contrast,
  era,
  width,
  xHeight,
  licensing,
  platforms,
  variableFont,
  hasItalics,
  multilingualSupport,
  typefaceURL,
  rawKeywords
}`;

const RELATED_QUERY = `*[_type == "typeface" && foundry._ref == $foundryRef && _id != $id][0..2] {
  _id,
  name,
  "slug": slug.current,
  "foundry": foundry->{ name },
  specimenImage,
  classification
}`;

const WEIGHT_ORDER: WeightName[] = [
  "thin", "light", "regular", "medium", "semibold", "bold", "extrabold", "black",
];

// ── Metadata ──────────────────────────────────────────────────────────────────

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const tf = await client.fetch<TypefaceDetail | null>(
    DETAIL_QUERY,
    { slug },
    { next: { revalidate: 3600 } }
  );
  if (!tf) return { title: "Not Found — TypeScout" };
  return {
    title: `${tf.name} by ${tf.foundry.name} — TypeScout`,
    description:
      tf.editorialNote ??
      `Discover ${tf.name} by ${tf.foundry.name} on TypeScout.`,
  };
}

// ── Section wrapper ───────────────────────────────────────────────────────────

function Section({
  label,
  count,
  children,
}: {
  label: string;
  count: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <div
        className="flex items-baseline justify-between pb-[10px] font-sans text-[12px] uppercase tracking-[.12em] text-[rgba(21,21,21,0.5)]"
        style={{ borderBottom: "0.5px solid #151515" }}
      >
        <span>{label}</span>
        <span style={{ color: "rgba(21,21,21,0.25)" }}>{count}</span>
      </div>
      <div className="pt-[18px]">{children}</div>
    </section>
  );
}

// ── Characteristics list ──────────────────────────────────────────────────────

function CharRowFull({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <div
      className="flex items-center justify-between gap-3 py-[14px] font-sans text-[12px] uppercase tracking-[.04em]"
      style={{ borderBottom: "0.5px solid #e0ded8" }}
    >
      <span
        className="flex items-center gap-[8px]"
        style={{ color: "rgba(21,21,21,0.5)" }}
      >
        {icon}
        {label}
      </span>
      <span className="text-[#000000]">{value}</span>
    </div>
  );
}

// ── Wordmark SVG ──────────────────────────────────────────────────────────────

function Wordmark() {
  return (
    <svg
      style={{ height: "40px", width: "auto", display: "block" }}
      viewBox="0 0 338 62"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
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
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function TypefacePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const tf = await client.fetch<TypefaceDetail | null>(
    DETAIL_QUERY,
    { slug },
    { next: { revalidate: 3600 } }
  );
  if (!tf) notFound();

  const related = tf.foundry?._id
    ? await client.fetch<RelatedTypeface[]>(
        RELATED_QUERY,
        { foundryRef: tf.foundry._id, id: tf._id },
        { next: { revalidate: 3600 } }
      )
    : [];

  const specimenSource = tf.specimenImage?.asset
    ? tf.specimenImage
    : tf.specimenImageHeavy?.asset
      ? tf.specimenImageHeavy
      : null;
  const specimenUrl = specimenSource ? urlFor(specimenSource).width(1200).url() : null;

  const weights = WEIGHT_ORDER.filter((w) => tf.weightRange?.includes(w));
  const classTags = [...(tf.classification ?? []), tf.subClassification].filter(Boolean);
  const googleFonts = tf.platforms === "google-fonts" || tf.platforms === "both";
  const adobeFonts = tf.platforms === "adobe-fonts" || tf.platforms === "both";

  return (
    <div className="min-h-[100dvh] flex flex-col bg-white">

      {/* ── Nav ──────────────────────────────────────────────────────────────── */}
      <header className="w-full max-w-[1180px] mx-auto px-6 lg:px-10 pt-7 pb-5 flex flex-col gap-5">
        <Link href="/" aria-label="TypeScout home" className="self-center">
          <Wordmark />
        </Link>
        <DetailSearchBar />
      </header>

      {/* ── Main container ────────────────────────────────────────────────────── */}
      <div className="flex-1 w-full max-w-[1180px] mx-auto px-6 lg:px-10 pb-20">

        {/* ── Specimen card ─────────────────────────────────────────────────── */}
        <div className="rounded-[12px] bg-[#f2f1ed] overflow-hidden">
          <div className="m-4 rounded-[6px] bg-white overflow-hidden">

            {/* Header row */}
            <div className="flex items-center justify-between px-6 pt-[18px] pb-[14px]">
              <p className="font-sans text-[12px] text-[#000000] uppercase tracking-[.02em] leading-none">
                {tf.foundry?.name}
                <span className="mx-2 opacity-40">•</span>
                {tf.name}
              </p>
            </div>

            {/* Specimen image */}
            <div className="px-6 py-10 pb-16 flex items-center justify-center min-h-[240px]">
              {specimenUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={specimenUrl}
                  alt={`${tf.name} specimen`}
                  style={{ maxWidth: "86%", maxHeight: "180px", height: "auto", display: "block" }}
                />
              ) : (
                <span className="font-sans text-[56px] font-bold text-[#000000] uppercase leading-none">
                  {tf.name}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* ── Availability strip ───────────────────────────────────────────────── */}
        <div className="mt-4 rounded-[12px] bg-[#f2f1ed] overflow-hidden">
          <div className="m-4 rounded-[6px] bg-white px-5 py-[14px] flex items-center gap-4 flex-wrap">

            {/* Paid / Free */}
            {tf.licensing === "paid" ? <PaidBadge variant="dark" /> : <FreeBadge />}

            {/* Google Fonts — only shown when available */}
            {googleFonts && (
              <>
                <div className="w-px h-[14px] bg-[#e0ded8] flex-shrink-0" />
                <span className="inline-flex items-center gap-[6px] font-sans text-[12px] uppercase tracking-[.06em]">
                  {/* Google G — four-colour mark */}
                  <svg width="13" height="13" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  <span style={{ color: '#4285F4' }}>Google Fonts</span>
                </span>
              </>
            )}

            {/* Adobe Fonts — only shown when available */}
            {adobeFonts && (
              <>
                <div className="w-px h-[14px] bg-[#e0ded8] flex-shrink-0" />
                <span className="inline-flex items-center gap-[6px] font-sans text-[12px] uppercase tracking-[.06em]">
                  {/* Adobe A mark */}
                  <svg width="13" height="13" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M13.966 22.624l-1.69-4.401H8.01l3.234-8.733 5.256 13.134zM8.86 4.56L0 22.624h3.771l1.803-4.555h5.584L8.86 4.56zM19.638 1.76L24 22.624h-3.562l-4.402-20.864z" fill="#FA0F00"/>
                  </svg>
                  <span style={{ color: '#FA0F00' }}>Adobe Fonts</span>
                </span>
              </>
            )}

            {/* CTA — pushed to the right */}
            {tf.typefaceURL && (
              <>
                <div className="flex-1" />
                <a
                  href={tf.typefaceURL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-[10px] font-sans text-[13px] uppercase tracking-[.02em] text-[#151515] bg-[#f4fbd4] px-[14px] py-[8px] rounded-[2px] hover:bg-[#ecf5bf] transition-colors flex-shrink-0"
                  style={{ border: "0.5px solid #151515" }}
                >
                  <span>Get {tf.name}</span>
                  <span className="w-[20px] h-[20px] rounded-full bg-[#151515] flex items-center justify-center flex-shrink-0">
                    <ArrowUpRight size={9} color="#f4fbd4" aria-hidden="true" />
                  </span>
                </a>
              </>
            )}

          </div>
        </div>

        {/* ── Two-column body ───────────────────────────────────────────────── */}
        <div className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-[1.25fr_1fr] lg:gap-14">

          {/* LEFT column */}
          <div className="flex flex-col gap-10">

            {/* §01 About */}
            {tf.editorialNote && (
              <Section label="About" count="01">
                <p
                  className="font-sans text-[15px] leading-[1.6] text-[#000000] m-0"
                  style={{ textTransform: "none", letterSpacing: ".005em" }}
                >
                  {tf.editorialNote}
                </p>
              </Section>
            )}

            {/* §02 Characteristics */}
            <Section label="Characteristics" count="02">
              <div className="-mt-[10px]">
                <CharRowFull
                  label="Width"
                  value={tf.width ?? "—"}
                  icon={<ArrowsOutLineHorizontal size={14} aria-hidden="true" />}
                />
                <CharRowFull
                  label="x-Height"
                  value={tf.xHeight ?? "—"}
                  icon={<Ruler size={14} aria-hidden="true" />}
                />
                <CharRowFull
                  label="Contrast"
                  value={(tf.contrast ?? []).join(", ") || "—"}
                  icon={<CircleHalf size={14} aria-hidden="true" />}
                />
                <CharRowFull
                  label="Italics"
                  value={tf.hasItalics ? "Yes" : "No"}
                  icon={<TextItalic size={14} aria-hidden="true" />}
                />
                <CharRowFull
                  label="Variable"
                  value={tf.variableFont ? "Yes — 1 axis" : "No"}
                  icon={<SlidersHorizontal size={14} aria-hidden="true" />}
                />
                <CharRowFull
                  label="Multilingual"
                  value={tf.multilingualSupport ? "Extended Latin" : "Latin"}
                  icon={<Globe size={14} aria-hidden="true" />}
                />
              </div>
            </Section>

            {/* §03 Weights */}
            {weights.length > 0 && (
              <Section label="Weights" count="03">
                <div className="flex flex-wrap gap-2">
                  {weights.map((w) => (
                    <OutlineTag key={w}>{w}</OutlineTag>
                  ))}
                </div>
              </Section>
            )}

            {/* §04 Tags */}
            <Section label="Tags" count="04">
              <div className="flex flex-col gap-[18px]">
                {classTags.length > 0 && (
                  <div>
                    <p
                      className="flex items-center gap-[6px] font-sans text-[12px] uppercase tracking-[.12em] mb-[10px]"
                      style={{ color: "rgba(21,21,21,0.5)" }}
                    >
                      <TextAa size={13} aria-hidden="true" />
                      Classification
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {classTags.map((t) => (
                        <SandTag key={t}>{t}</SandTag>
                      ))}
                    </div>
                  </div>
                )}
                {tf.personalityTags?.length > 0 && (
                  <div>
                    <p
                      className="flex items-center gap-[6px] font-sans text-[12px] uppercase tracking-[.12em] mb-[10px]"
                      style={{ color: "rgba(21,21,21,0.5)" }}
                    >
                      <UserFocus size={13} aria-hidden="true" />
                      Personality
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {tf.personalityTags.map((t) => (
                        <OutlineTag key={t}>{t}</OutlineTag>
                      ))}
                    </div>
                  </div>
                )}
                {tf.useCaseTags?.length > 0 && (
                  <div>
                    <p
                      className="flex items-center gap-[6px] font-sans text-[12px] uppercase tracking-[.12em] mb-[10px]"
                      style={{ color: "rgba(21,21,21,0.5)" }}
                    >
                      <Shapes size={13} aria-hidden="true" />
                      Use cases
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {tf.useCaseTags.map((t) => (
                        <OutlineTag key={t}>{t}</OutlineTag>
                      ))}
                    </div>
                  </div>
                )}
                {tf.era?.length > 0 && (
                  <div>
                    <p
                      className="flex items-center gap-[6px] font-sans text-[12px] uppercase tracking-[.12em] mb-[10px]"
                      style={{ color: "rgba(21,21,21,0.5)" }}
                    >
                      <Calendar size={13} aria-hidden="true" />
                      Era
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {tf.era.map((t) => (
                        <OutlineTag key={t}>{t}</OutlineTag>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </Section>
          </div>

          {/* RIGHT column */}
          <div className="flex flex-col gap-10">

            {/* §05 Foundry */}
            <Section label="Foundry" count="05">
              <div className="rounded-[6px] bg-[#f2f1ed] p-[22px]">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-sans text-[22px] uppercase tracking-[-.005em] text-[#000000] leading-none m-0">
                      {tf.foundry?.name}
                    </p>
                    <p
                      className="font-sans text-[12px] uppercase tracking-[.04em] mt-1 m-0"
                      style={{ color: "rgba(21,21,21,0.5)" }}
                    >
                      {tf.foundry?.location}
                    </p>
                  </div>
                </div>
                {tf.foundry?.description && (
                  <p
                    className="font-sans text-[13px] leading-[1.6] text-[#000000] mt-4 m-0"
                    style={{ textTransform: "none" }}
                  >
                    {tf.foundry.description}
                  </p>
                )}
                {tf.foundry?.website && (
                  <a
                    href={tf.foundry.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 mt-[18px] font-sans text-[12px] uppercase tracking-[.06em] text-[#000000] hover:opacity-70 transition-opacity"
                    style={{ borderBottom: "0.5px solid #151515", paddingBottom: "2px" }}
                  >
                    <span>Visit foundry site</span>
                    <ArrowUpRight size={11} aria-hidden="true" />
                  </a>
                )}
              </div>
            </Section>

          </div>
        </div>

        {/* ── Related typefaces ─────────────────────────────────────────────── */}
        {related.length > 0 && (
          <div className="mt-16">
            <div
              className="pb-3 flex items-baseline justify-between font-sans text-[12px] uppercase tracking-[.12em]"
              style={{
                borderBottom: "0.5px solid #151515",
                color: "rgba(21,21,21,0.5)",
              }}
            >
              <span>More from {tf.foundry?.name}</span>
              <span style={{ color: "rgba(21,21,21,0.25)" }}>
                {String(related.length).padStart(2, "0")}
              </span>
            </div>
            <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {related.map((r) => {
                const relSpecimenUrl = r.specimenImage?.asset
                  ? urlFor(r.specimenImage).width(400).url()
                  : null;
                return (
                  <Link
                    key={r._id}
                    href={`/typeface/${r.slug}`}
                    className="rounded-[12px] bg-[#f2f1ed] overflow-hidden flex flex-col group transition-transform duration-200 hover:-translate-y-[3px]"
                    aria-label={`${r.name} by ${r.foundry?.name}`}
                  >
                    <div className="m-3 rounded-[6px] bg-white p-[14px] flex flex-col gap-3 flex-1">
                      <div className="flex items-center justify-between font-sans text-[11px] uppercase tracking-[.02em]">
                        <span>
                          <span className="text-[#000000]">{r.foundry?.name}</span>
                          <span className="opacity-40 mx-[6px]">•</span>
                          <span className="text-[#000000]">{r.name}</span>
                        </span>
                        <span
                          className="w-[22px] h-[22px] rounded-full bg-[#f4fbd4] flex items-center justify-center flex-shrink-0"
                          style={{ border: "0.5px solid #151515" }}
                        >
                          <ArrowUpRight size={9} aria-hidden="true" />
                        </span>
                      </div>
                      <div className="min-h-[70px] flex items-center justify-center">
                        {relSpecimenUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={relSpecimenUrl}
                            alt={`${r.name} specimen`}
                            style={{ maxWidth: "80%", maxHeight: "70px", height: "auto", display: "block" }}
                          />
                        ) : (
                          <span className="font-sans text-[24px] font-bold text-[#000000] uppercase leading-none">
                            {r.name}
                          </span>
                        )}
                      </div>
                    </div>
                    {r.classification?.length > 0 && (
                      <div className="px-3 pb-[14px] flex flex-wrap gap-[6px]">
                        {r.classification.slice(0, 2).map((c) => (
                          <span
                            key={c}
                            className="inline-flex items-center px-[6px] py-[3px] rounded-[2px] font-sans text-[11px] text-[#000000] bg-[#e0ded8] uppercase tracking-[.02em]"
                            style={{ border: "0.5px solid #151515" }}
                          >
                            {c}
                          </span>
                        ))}
                      </div>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Raw keywords ─────────────────────────────────────────────────── */}
        {tf.rawKeywords?.length > 0 && (
          <div
            className="mt-12 pt-6 flex items-start gap-6"
            style={{ borderTop: "0.5px solid #e0ded8" }}
          >
            <p
              className="font-sans text-[11px] uppercase tracking-[.12em] flex-shrink-0 pt-[3px] m-0"
              style={{ color: "rgba(21,21,21,0.5)", minWidth: "160px" }}
            >
              Other keywords
            </p>
            <div className="flex flex-wrap">
              {tf.rawKeywords.map((k, i) => (
                <span
                  key={k}
                  className="font-sans text-[11px] uppercase tracking-[.06em] whitespace-nowrap mr-[14px]"
                  style={{ color: "rgba(21,21,21,0.4)" }}
                >
                  {k}
                  {i < tf.rawKeywords.length - 1 && (
                    <span className="ml-[14px]" style={{ color: "rgba(21,21,21,0.25)" }}>·</span>
                  )}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Footer ───────────────────────────────────────────────────────────── */}
      <footer
        className="px-10 py-6 text-center"
        style={{ borderTop: "0.5px solid #151515" }}
      >
        <p
          className="font-sans text-[13px] uppercase tracking-[.02em] m-0"
          style={{ color: "rgba(21,21,21,0.5)" }}
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
