// News Image (news-image-20261126) — entry program, Node 22, standard library only.
//
// The entry is one image: a newspaper front page summing up Thursday
// 26 November 2026, in the "The World in One Day" style — 29 stories
// from 7 regions, all from this one day. The program copies entry.png
// from this repository to /output/entry.png, where the gate reads it.
// The program runs twice and both runs must write the same bytes, so
// it does nothing but copy.
//
// What the image shows, and why:
//   Lead — the first generic HIV drug reaches Africa. Lenacapavir, a
//   twice-yearly HIV prevention injection, arrives as a generic: the
//   Global Fund announces 189,000 first doses across 10 countries, a
//   3-million-dose target by 2028. The day's biggest story, so it
//   leads the page with the largest illustration (an African map with
//   medicine crates and a vial).
//   Rupiah at a record low — the rupiah trades past 18,300 per dollar,
//   its weakest ever, as Asian equities slide on chipmaker losses.
//   (The breach itself is not a 26 November event: it was first
//   crossed days earlier, so the page says "record low" and nothing
//   about a first-time breach.)
//   Korea set for a rate hike — the Bank of Korea's final 2026
//   meeting is expected to lift rates to 3.25%; 32 of 34 economists
//   in a Reuters poll say so. The decision window opens on the day,
//   so the story is marked ONGOING, not decided.
//   Also featured — a Bank of Japan hawk signals more hikes, the
//   Saudi coalition claims two Houthi missiles bound for Riyadh were
//   intercepted (one side's claim, marked CLAIM), South Africa's
//   central bank flags AI risks, Thanksgiving shuts US markets, the
//   UN opens a minority-rights forum, Indonesia's ex-police chief
//   faces an ethics hearing, cyber attacks halt New Zealand papers,
//   RNZ staff picket over job cuts, and the Europa League's Thursday
//   fixtures. Sixteen more stories run in the "ALSO ON" list, a
//   UTC timeline runs the day's moments, "THE DAY IN NUMBERS"
//   carries six figures, and a red DATE CHECK box names the
//   earlier-day stories deliberately left out.
//
// How it was made, in this session: the day's news was researched
// with a Deep Research report on 26 November's events, cross-checked
// against live news sources; twelve flat-drawn illustration panels
// were generated in this session with an image model and a thirteenth
// (a football pitch) was drawn by hand; the front page — masthead,
// date, headlines, captions, timeline and numbers panel — was composed
// here with a Python/Pillow script so every word is exact and legible.
// The judge has no news feed, so the image itself carries the news.
//
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { copyFileSync, mkdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
const source = new URL("./entry.png", import.meta.url);

// The gate takes a whole PNG or JPEG of at most 1 MiB and 1024 by 1024
// pixels: refuse a file that breaks those limits here instead of handing
// the gate an image it would score 0.
const bytes = readFileSync(source);
const isPng = bytes.length > 24 && bytes.subarray(0, 8).toString("hex") === "89504e470d0a1a0a";
if (!isPng) {
  console.error("entry.png is not a PNG");
  process.exit(1);
}
const width = bytes.readUInt32BE(16);
const height = bytes.readUInt32BE(20);
const size = statSync(source).size;
if (width > 1024 || height > 1024 || size > 1024 * 1024) {
  console.error(`entry.png is ${width}x${height}, ${size} bytes: over the 1024x1024 / 1 MiB gate`);
  process.exit(1);
}
// The gate also requires a whole image: a PNG must end with its IEND
// chunk, so refuse a truncated file instead of handing the gate bytes
// it would score 0.
const iend = bytes.subarray(size - 12);
if (iend.readUInt32BE(0) !== 0 || iend.toString("ascii", 4, 8) !== "IEND") {
  console.error("entry.png is truncated: no IEND chunk at the end");
  process.exit(1);
}

mkdirSync(outDir, { recursive: true });
copyFileSync(source, join(outDir, "entry.png"));
console.log(`entry.png copied: ${width}x${height}, ${size} bytes`);
