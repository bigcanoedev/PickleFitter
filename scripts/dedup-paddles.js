/**
 * Deduplicates paddle data by normalizing names and merging specs.
 * For true duplicates (same paddle from two sources), averages numeric fields
 * and keeps the best available data for each field.
 *
 * Usage: node scripts/dedup-paddles.js
 */

const fs = require("fs");
const path = require("path");

// Brand aliases: normalize different names for the same company
const BRAND_ALIASES = {
  "selkirk labs": "selkirk",
  "selkirk sport": "selkirk",
  "sixzero": "six zero",
  "6 zero": "six zero",
};

// Common spelling variants in paddle names
const NAME_FIXES = [
  [/boomstik/g, "boomstick"],
  [/hurache/g, "huarache"],
  [/invikta/g, "invicta"],
  [/\s*\(.*?\)\s*/g, " "],       // remove parenthetical like "(16mm)" — thickness is a separate field
  [/\b(\d+)\s*mm\b/g, "$1mm"],   // normalize "16 mm" → "16mm"
  [/\s+/g, " "],
];

function normalizeKey(brand, name) {
  let b = brand.toLowerCase().trim();
  b = BRAND_ALIASES[b] || b;

  let n = name.toLowerCase().trim();
  for (const [pattern, replacement] of NAME_FIXES) {
    n = n.replace(pattern, replacement);
  }

  return (b + " " + n)
    .replace(/[^a-z0-9]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function avg(a, b) {
  if (a != null && b != null) return parseFloat(((a + b) / 2).toFixed(2));
  return a ?? b;
}

function best(a, b) {
  // Pick the non-null / more specific value
  if (a && !b) return a;
  if (b && !a) return b;
  // Prefer longer string (more detail)
  if (typeof a === "string" && typeof b === "string") return a.length >= b.length ? a : b;
  return a;
}

function main() {
  const paddles = JSON.parse(fs.readFileSync("lib/paddle-data.json", "utf8"));
  console.log("Input:", paddles.length, "paddles");

  // Group by normalized key
  const groups = new Map();
  for (const p of paddles) {
    const key = normalizeKey(p.brand, p.name);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(p);
  }

  console.log("Unique keys:", groups.size);
  console.log("Duplicates:", paddles.length - groups.size);

  // Merge each group
  const merged = [];
  for (const [key, group] of groups) {
    if (group.length === 1) {
      merged.push(group[0]);
      continue;
    }

    // Merge: prefer the entry with lab data as base, average numerics, pick best strings
    group.sort((a, b) => (b.power_mph ? 1 : 0) - (a.power_mph ? 1 : 0));
    const base = { ...group[0] };

    for (let i = 1; i < group.length; i++) {
      const other = group[i];

      // Average numeric fields
      base.price = avg(base.price, other.price);
      base.weight_oz = avg(base.weight_oz, other.weight_oz);
      base.swing_weight = Math.round(avg(base.swing_weight, other.swing_weight));
      base.twist_weight = avg(base.twist_weight, other.twist_weight);
      base.core_thickness_mm = avg(base.core_thickness_mm, other.core_thickness_mm);
      base.rpm = avg(base.rpm, other.rpm);
      base.balance = avg(base.balance, other.balance);
      base.grip_length = avg(base.grip_length, other.grip_length);
      base.power_mph = avg(base.power_mph, other.power_mph);
      base.pop_mph = avg(base.pop_mph, other.pop_mph);
      base.spin_rpm = avg(base.spin_rpm, other.spin_rpm);
      base.firepower_z = avg(base.firepower_z, other.firepower_z);

      // Pick best string fields (prefer non-null, longer)
      base.face_material = best(base.face_material, other.face_material);
      base.core_material = best(base.core_material, other.core_material);
      base.shape = best(base.shape, other.shape);
      base.grip_thickness = best(base.grip_thickness, other.grip_thickness);
      base.firepower_tier = best(base.firepower_tier, other.firepower_tier);
      base.paddle_type = best(base.paddle_type, other.paddle_type);
      base.build_style = best(base.build_style, other.build_style);
      base.spin_rating = best(base.spin_rating, other.spin_rating);
      base.power_percentile = best(base.power_percentile, other.power_percentile);
      base.pop_percentile = best(base.pop_percentile, other.pop_percentile);
      base.sw_percentile = best(base.sw_percentile, other.sw_percentile);
      base.tw_percentile = best(base.tw_percentile, other.tw_percentile);
      base.purchase_link = best(base.purchase_link, other.purchase_link);
      base.youtube_review = best(base.youtube_review, other.youtube_review);
      base.discount_code = best(base.discount_code, other.discount_code);
      base.description = best(base.description, other.description);
    }

    merged.push(base);
  }

  // Re-index
  merged.forEach((p, i) => (p.id = i + 1));

  console.log("Output:", merged.length, "paddles (removed", paddles.length - merged.length, "duplicates)");

  // Stats
  const withLab = merged.filter((p) => p.power_mph).length;
  const brands = new Set(merged.map((p) => p.brand)).size;
  console.log("With lab data:", withLab);
  console.log("Brands:", brands);

  // Save
  fs.writeFileSync("lib/paddle-data.json", JSON.stringify(merged));
  fs.writeFileSync("public/paddle-data.json", JSON.stringify(merged));
  console.log("\nSaved lib/paddle-data.json and public/paddle-data.json");
}

main();
