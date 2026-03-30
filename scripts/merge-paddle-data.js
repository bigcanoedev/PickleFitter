/**
 * Merges paddle data from two sources:
 *   1. Pickleball Studio (Notion) - 495 paddles with SW, TW, price, shape, core, RPM
 *   2. Pickleball Effect (Google Sheets) - 437 paddles with lab-tested Power, Pop, Spin, Firepower
 *
 * Priority: Pickleball Effect lab data > Pickleball Studio data > defaults
 *
 * Usage: node scripts/merge-paddle-data.js
 */

const fs = require("fs");
const path = require("path");

// ── Parse Pickleball Effect CSV ──────────────────────────────────────────────

function parseCSV(text) {
  const lines = text.split("\n").filter((l) => l.trim());
  const header = parseCSVLine(lines[0]);
  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const cols = parseCSVLine(lines[i]);
    const row = {};
    header.forEach((h, idx) => {
      row[h.trim()] = (cols[idx] || "").trim();
    });
    rows.push(row);
  }
  return rows;
}

function parseCSVLine(line) {
  const result = [];
  let current = "";
  let inQuotes = false;
  for (const ch of line) {
    if (ch === '"') {
      inQuotes = !inQuotes;
    } else if (ch === "," && !inQuotes) {
      result.push(current);
      current = "";
    } else {
      current += ch;
    }
  }
  result.push(current);
  return result;
}

// ── Normalize names for matching ─────────────────────────────────────────────

function normalizeName(brand, name) {
  return (brand + " " + name)
    .toLowerCase()
    .replace(/[^a-z0-9]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

// ── Material normalization ───────────────────────────────────────────────────

function normalizeMaterial(raw) {
  if (!raw) return "Composite";
  const lower = raw.toLowerCase();
  if (lower.includes("raw carbon") || lower.includes("toray") || lower.includes("t700"))
    return "Carbon";
  if (lower.includes("fiberglass") && lower.includes("carbon")) return "Hybrid";
  if (lower.includes("fiberglass")) return "Fiberglass";
  if (lower.includes("carbon")) return "Carbon";
  if (lower.includes("graphite")) return "Graphite";
  if (lower.includes("kevlar")) return "Composite";
  return "Composite";
}

function normalizeShape(raw) {
  if (!raw) return null;
  const lower = raw.toLowerCase();
  if (lower.includes("wide")) return "Wide body";
  if (lower.includes("elongated")) return "Elongated";
  if (lower.includes("hybrid")) return "Hybrid";
  if (lower.includes("teardrop")) return "Teardrop";
  if (lower.includes("standard")) return "Standard";
  return raw;
}

// ── Determine paddle classification ──────────────────────────────────────────

function determineBestFor(paddle) {
  // Use Pickleball Effect classification if available
  if (paddle.paddle_type) {
    if (paddle.paddle_type === "Power") return "Aggressive";
    if (paddle.paddle_type === "Control") return "Control";
    return "Balanced";
  }
  // Fallback to swing weight
  if (paddle.swing_weight >= 120) return "Aggressive";
  if (paddle.swing_weight <= 108) return "Control";
  return "Balanced";
}

function generateDescription(paddle) {
  const parts = [];
  if (paddle.shape) parts.push(`${paddle.shape} shape`);
  if (paddle.core_thickness_mm) parts.push(`${paddle.core_thickness_mm}mm core`);
  if (paddle.build_style) parts.push(paddle.build_style);
  if (paddle.power_mph) parts.push(`${paddle.power_mph} MPH power`);
  if (paddle.pop_mph) parts.push(`${paddle.pop_mph} MPH pop`);
  if (paddle.spin_rpm) parts.push(`${paddle.spin_rpm} RPM spin`);
  return parts.length > 0 ? parts.join(", ") + "." : `${paddle.name} by ${paddle.brand}.`;
}

// ── Main merge ───────────────────────────────────────────────────────────────

function main() {
  // Load Pickleball Effect data
  const peCSV = fs.readFileSync("pickleball_effect_db.csv", "utf8");
  const peRows = parseCSV(peCSV);
  console.log(`Pickleball Effect: ${peRows.length} paddles`);

  // Load Pickleball Studio data
  const psRaw = JSON.parse(fs.readFileSync("scraped-paddles-raw.json", "utf8"));
  console.log(`Pickleball Studio: ${psRaw.length} paddles`);

  // Build PE lookup by normalized name
  const peLookup = new Map();
  for (const row of peRows) {
    const key = normalizeName(row["Brand"], row["Paddle Name"]);
    peLookup.set(key, row);
  }

  // Start with Pickleball Effect as primary source (has lab data)
  const merged = [];
  const seen = new Set();
  let peOnly = 0, matched = 0, psOnly = 0;

  // Process PE paddles first
  for (const pe of peRows) {
    const sw = parseFloat(pe["Swingweight"]);
    if (!sw || isNaN(sw)) continue;

    const key = normalizeName(pe["Brand"], pe["Paddle Name"]);
    seen.add(key);

    // Try to find matching PS paddle
    let psMatch = null;
    for (const ps of psRaw) {
      const psKey = normalizeName(ps.brand, ps.name);
      if (psKey === key || key.includes(psKey) || psKey.includes(key)) {
        psMatch = ps;
        break;
      }
    }

    const paddle = {
      id: merged.length + 1,
      name: pe["Paddle Name"],
      brand: pe["Brand"],
      price: parseFloat(pe["Price"].replace("$", "")) || 149.99,
      weight_oz: parseFloat(pe["Weight (oz)"]) || (psMatch?.weight_oz || 7.8),
      swing_weight: sw,
      twist_weight: parseFloat(pe["Twistweight"]) || (psMatch?.twist_weight || 6.5),
      face_material: normalizeMaterial(pe["Face Material"]),
      core_material: null,
      shape: normalizeShape(pe["Shape"]),
      core_thickness_mm: parseFloat(pe["Core Thickness (mm)"]) || null,
      rpm: parseInt(pe["Spin (RPM)"]) || (psMatch?.rpm || null),
      balance: parseFloat(pe["Balance Point (mm)"]) || (psMatch?.balance || null),
      grip_length: parseFloat(pe["Grip Length (in)"]) || null,
      grip_thickness: pe["Grip Size (in)"] || null,
      // Lab-tested performance data (Pickleball Effect exclusive)
      power_mph: parseFloat(pe["Power (MPH)"]) || null,
      pop_mph: parseFloat(pe["Pop (MPH)"]) || null,
      spin_rpm: parseInt(pe["Spin (RPM)"]) || null,
      firepower_z: parseFloat(pe["Firepower Z"]) || null,
      firepower_tier: pe["Firepower Z Tier"] || null,
      paddle_type: pe["Paddle Type"] || null,
      build_style: pe["Build Style"] || null,
      spin_rating: pe["Spin Rating"] || null,
      power_percentile: pe["Power Percentile"]?.replace("%", "") || null,
      pop_percentile: pe["Pop Percentile"]?.replace("%", "") || null,
      sw_percentile: pe["Swingweight Percentile"]?.replace("%", "") || null,
      tw_percentile: pe["Twistweight Percentile"]?.replace("%", "") || null,
      // Links
      best_for: "",
      description: "",
      image_url: "",
      purchase_link: pe["Link to Paddle"] || (psMatch?.purchase_link || null),
      youtube_review: psMatch?.youtube_review || null,
      discount_code: pe["Discount Code"] || (psMatch?.discount_code || null),
      amazon_link: `https://amazon.com/s?k=${encodeURIComponent(pe["Brand"] + " " + pe["Paddle Name"])}&tag=paddlefinder-20`,
      generic_affiliate_link: pe["Link to Paddle"] || null,
      preferred_link_type: pe["Link to Paddle"] ? "generic" : "amazon",
    };

    paddle.best_for = determineBestFor(paddle);
    paddle.description = generateDescription(paddle);
    paddle.image_url = `/images/paddles/${paddle.brand.toLowerCase().replace(/\s+/g, "-")}-${paddle.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.jpg`;

    merged.push(paddle);
    if (psMatch) matched++;
    else peOnly++;
  }

  // Add PS paddles not in PE
  for (const ps of psRaw) {
    if (!ps.swing_weight) continue;
    const key = normalizeName(ps.brand, ps.name);

    // Check if already added from PE
    let found = false;
    for (const seenKey of seen) {
      if (seenKey === key || seenKey.includes(key) || key.includes(seenKey)) {
        found = true;
        break;
      }
    }
    if (found) continue;

    const paddle = {
      id: merged.length + 1,
      name: ps.name,
      brand: ps.brand,
      price: ps.price || 149.99,
      weight_oz: ps.weight_oz ? parseFloat(ps.weight_oz.toFixed(1)) : 7.8,
      swing_weight: ps.swing_weight,
      twist_weight: ps.twist_weight || 6.5,
      face_material: normalizeMaterial(ps.face_material),
      core_material: ps.core_material || null,
      shape: normalizeShape(ps.shape),
      core_thickness_mm: ps.core_thickness_mm || null,
      rpm: ps.rpm || null,
      balance: ps.balance || null,
      grip_length: ps.grip_length || null,
      grip_thickness: ps.grip_thickness || null,
      power_mph: null,
      pop_mph: null,
      spin_rpm: ps.rpm || null,
      firepower_z: null,
      firepower_tier: null,
      paddle_type: null,
      build_style: null,
      spin_rating: null,
      power_percentile: null,
      pop_percentile: null,
      sw_percentile: null,
      tw_percentile: null,
      best_for: "",
      description: "",
      image_url: "",
      purchase_link: ps.purchase_link || null,
      youtube_review: ps.youtube_review || null,
      discount_code: ps.discount_code || null,
      amazon_link: `https://amazon.com/s?k=${encodeURIComponent(ps.brand + " " + ps.name)}&tag=paddlefinder-20`,
      generic_affiliate_link: ps.purchase_link || null,
      preferred_link_type: ps.purchase_link ? "generic" : "amazon",
    };

    paddle.best_for = determineBestFor(paddle);
    paddle.description = generateDescription(paddle);
    paddle.image_url = `/images/paddles/${paddle.brand.toLowerCase().replace(/\s+/g, "-")}-${paddle.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.jpg`;

    merged.push(paddle);
    psOnly++;
  }

  console.log(`\nMerge results:`);
  console.log(`  PE only: ${peOnly}`);
  console.log(`  Matched (both sources): ${matched}`);
  console.log(`  PS only: ${psOnly}`);
  console.log(`  Total: ${merged.length}`);

  // Stats
  const withPower = merged.filter((p) => p.power_mph).length;
  const withFirepower = merged.filter((p) => p.firepower_tier).length;
  const brands = new Set(merged.map((p) => p.brand)).size;
  console.log(`  With lab power data: ${withPower}`);
  console.log(`  With firepower tier: ${withFirepower}`);
  console.log(`  Unique brands: ${brands}`);

  // Re-index
  merged.forEach((p, i) => (p.id = i + 1));

  // Save
  fs.writeFileSync("merged-paddles.json", JSON.stringify(merged, null, 2));
  console.log("\nSaved merged-paddles.json");

  // Generate TypeScript
  const tsContent = `import { Paddle } from "./types";

// Merged paddle database from:
//   - Pickleball Effect (lab-tested Power, Pop, Spin, Firepower)
//   - Pickleball Studio (specs, purchase links, discount codes)
// Last merged: ${new Date().toISOString().split("T")[0]}

export const paddleData: Paddle[] = ${JSON.stringify(merged, null, 2)};
`;
  fs.writeFileSync(path.join("lib", "paddle-data.ts"), tsContent);
  console.log(`Updated lib/paddle-data.ts with ${merged.length} paddles`);
}

main();
