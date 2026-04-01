/**
 * Deduplicates paddle data with two passes:
 *   Pass 1: Exact normalized key match (brand + name after normalization)
 *   Pass 2: Fuzzy match within same brand (containment check with safety guards)
 *
 * Usage: node scripts/dedup-paddles.js
 */

const fs = require("fs");

// Brand aliases
const BRAND_ALIASES = {
  "selkirk labs": "selkirk",
  "selkirk sport": "selkirk",
  "sixzero": "six zero",
  "6 zero": "six zero",
  "gruvn": "gruvn",
};

// Spelling fixes
const NAME_FIXES = [
  [/boomstik/g, "boomstick"],
  [/hurache/g, "huarache"],
  [/invikta/g, "invicta"],
  [/\s*\(.*?\)\s*/g, " "],
  [/\b(\d+)\s*mm\b/g, "$1mm"],
  [/\s+/g, " "],
];

function normalizeBrand(brand) {
  const b = brand.toLowerCase().trim();
  return BRAND_ALIASES[b] || b;
}

function normalizeName(name) {
  let n = name.toLowerCase().trim();
  for (const [pattern, replacement] of NAME_FIXES) {
    n = n.replace(pattern, replacement);
  }
  return n.replace(/[^a-z0-9]/g, " ").replace(/\s+/g, " ").trim();
}

function normalizeKey(brand, name) {
  return normalizeBrand(brand) + " " + normalizeName(name);
}

/** Extract core thickness from name like "14mm" or "16mm" */
function extractThickness(name) {
  const m = name.match(/(\d{2})mm/i);
  return m ? parseInt(m[1]) : null;
}

function avg(a, b) {
  if (a != null && b != null) return parseFloat(((a + b) / 2).toFixed(2));
  return a ?? b;
}

function best(a, b) {
  if (a && !b) return a;
  if (b && !a) return b;
  if (typeof a === "string" && typeof b === "string") return a.length >= b.length ? a : b;
  return a;
}

/** Merge paddle B into paddle A (mutates A) */
function mergePaddle(base, other) {
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
  // Prefer the longer/more specific name
  base.name = best(base.name, other.name);
}

function main() {
  const paddles = JSON.parse(fs.readFileSync("lib/paddle-data.json", "utf8"));
  console.log("Input:", paddles.length, "paddles");

  // ── Pass 1: Exact key match ──────────────────────────────────────────────
  const groups = new Map();
  for (const p of paddles) {
    const key = normalizeKey(p.brand, p.name);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(p);
  }

  let pass1 = [];
  let pass1Removed = 0;
  for (const [key, group] of groups) {
    // Sort: prefer entries with lab data
    group.sort((a, b) => (b.power_mph ? 1 : 0) - (a.power_mph ? 1 : 0));
    const base = { ...group[0] };
    for (let i = 1; i < group.length; i++) {
      mergePaddle(base, group[i]);
      pass1Removed++;
    }
    pass1.push(base);
  }
  console.log("Pass 1 (exact key):", paddles.length, "→", pass1.length, "(removed", pass1Removed + ")");

  // ── Pass 2: Fuzzy match within same brand ────────────────────────────────
  // Group by normalized brand
  const byBrand = new Map();
  for (const p of pass1) {
    const b = normalizeBrand(p.brand);
    if (!byBrand.has(b)) byBrand.set(b, []);
    byBrand.get(b).push(p);
  }

  const pass2 = [];
  let pass2Removed = 0;
  const mergedLog = [];

  for (const [brand, brandPaddles] of byBrand) {
    const absorbed = new Set(); // indices that got merged into another

    for (let i = 0; i < brandPaddles.length; i++) {
      if (absorbed.has(i)) continue;

      for (let j = i + 1; j < brandPaddles.length; j++) {
        if (absorbed.has(j)) continue;

        const a = brandPaddles[i];
        const b = brandPaddles[j];
        const nameA = normalizeName(a.name);
        const nameB = normalizeName(b.name);

        // Check containment (one name contains the other)
        const aContainsB = nameA.includes(nameB);
        const bContainsA = nameB.includes(nameA);

        if (!aContainsB && !bContainsA) continue;

        // Safety: core thickness must match (don't merge 14mm with 16mm)
        const thickA = extractThickness(a.name) || a.core_thickness_mm;
        const thickB = extractThickness(b.name) || b.core_thickness_mm;
        if (thickA && thickB && thickA !== thickB) continue;

        // Safety: SW must be within 8 points
        if (a.swing_weight && b.swing_weight) {
          if (Math.abs(a.swing_weight - b.swing_weight) > 8) continue;
        }

        // Merge! Prefer the one with more data
        const aScore = (a.power_mph ? 2 : 0) + (a.purchase_link ? 1 : 0);
        const bScore = (b.power_mph ? 2 : 0) + (b.purchase_link ? 1 : 0);

        if (bScore > aScore) {
          // Merge A into B, keep B
          mergePaddle(b, a);
          absorbed.add(i);
          mergedLog.push(`  ${brand}: "${a.name}" + "${b.name}" → "${b.name}"`);
        } else {
          // Merge B into A, keep A
          mergePaddle(a, b);
          absorbed.add(j);
          mergedLog.push(`  ${brand}: "${a.name}" + "${b.name}" → "${a.name}"`);
        }
        pass2Removed++;
        break; // Move to next i after a merge
      }
    }

    // Collect non-absorbed paddles
    for (let i = 0; i < brandPaddles.length; i++) {
      if (!absorbed.has(i)) pass2.push(brandPaddles[i]);
    }
  }

  console.log("Pass 2 (fuzzy):", pass1.length, "→", pass2.length, "(removed", pass2Removed + ")");
  if (mergedLog.length > 0) {
    console.log("Fuzzy merges:");
    mergedLog.forEach((l) => console.log(l));
  }

  // Re-index
  pass2.forEach((p, i) => (p.id = i + 1));

  console.log("\nOutput:", pass2.length, "paddles");
  console.log("With lab data:", pass2.filter((p) => p.power_mph).length);
  console.log("Brands:", new Set(pass2.map((p) => p.brand)).size);

  // Save
  fs.writeFileSync("lib/paddle-data.json", JSON.stringify(pass2));
  fs.writeFileSync("public/paddle-data.json", JSON.stringify(pass2));
  console.log("\nSaved lib/paddle-data.json and public/paddle-data.json");
}

main();
