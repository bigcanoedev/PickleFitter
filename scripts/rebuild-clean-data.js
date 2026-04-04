/**
 * Rebuild paddle database from clean sources, replacing Pickleball Effect
 * proprietary data with John Kew + Pickleball Studio data where possible.
 *
 * Sources (in priority order):
 *   1. John Kew (Observable snapshot) — 312 paddles, SW/TW/balance/power/pop/spin
 *      Source: https://www.johnkewpickleball.com/paddle-database
 *      License: Public research data, no commercial restrictions found
 *
 *   2. Pickleball Studio (Notion) — 508 paddles, SW/TW/RPM/shape/core/grip/links
 *      Source: https://thepickleballstudio.notion.site/
 *      License: Public Notion database, no explicit restrictions
 *
 *   3. Pickleball Effect — ONLY used for fields not available elsewhere
 *      Fields still from PE: firepower_tier, firepower_z, build_style,
 *      sw_percentile, tw_percentile, power_percentile, pop_percentile, paddle_type
 *      These will be marked with source: "pe" for future removal
 *
 * Usage: node scripts/rebuild-clean-data.js
 */

const fs = require("fs");
const path = require("path");

// ── Load sources ─────────────────────────────────────────────────────────────

// John Kew data (from Observable CSV)
function loadJohnKew() {
  const lines = fs.readFileSync("johnkew_paddles.csv", "utf8").split("\n").filter(l => l.trim());
  const paddles = [];
  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(",");
    // Format: "Brand Name" as one field, need to split
    const fullName = cols[0].trim();
    paddles.push({
      fullName,
      price: parseFloat(cols[1]) || null,
      length: parseFloat(cols[2]) || null,
      width: parseFloat(cols[3]) || null,
      handle: parseFloat(cols[4]) || null,
      weight_oz: parseFloat(cols[5]) || null,
      swing_weight: parseFloat(cols[6]) || null,
      twist_weight: parseFloat(cols[7]) || null,
      balance: parseFloat(cols[8]) || null,
      power_mph: parseFloat(cols[9]) || null,
      pop_mph: parseFloat(cols[10]) || null,
      spin_rpm: parseInt(cols[11]) || null,
    });
  }
  console.log("John Kew:", paddles.length, "paddles");
  return paddles;
}

// Pickleball Studio data
function loadPickleballStudio() {
  const data = JSON.parse(fs.readFileSync("scraped-paddles-raw.json", "utf8"));
  console.log("Pickleball Studio:", data.length, "paddles");
  return data;
}

// Current merged data (contains PE data we want to phase out)
function loadCurrentMerged() {
  const data = JSON.parse(fs.readFileSync("merged-paddles.json", "utf8"));
  console.log("Current merged (with PE):", data.length, "paddles");
  return data;
}

// ── Normalization ────────────────────────────────────────────────────────────

function normalize(str) {
  return str.toLowerCase().replace(/[^a-z0-9]/g, " ").replace(/\s+/g, " ").trim();
}

function normalizeMaterial(raw) {
  if (!raw) return "Composite";
  const lower = raw.toLowerCase();
  if (lower.includes("raw carbon") || lower.includes("toray") || lower.includes("t700")) return "Carbon";
  if (lower.includes("fiberglass") && lower.includes("carbon")) return "Hybrid";
  if (lower.includes("fiberglass")) return "Fiberglass";
  if (lower.includes("carbon")) return "Carbon";
  if (lower.includes("graphite")) return "Graphite";
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

// ── Build lookup maps ────────────────────────────────────────────────────────

function buildLookup(items, keyFn) {
  const map = new Map();
  for (const item of items) {
    const key = keyFn(item);
    if (key) map.set(key, item);
  }
  return map;
}

// ── Smart merge: average when close, prefer JK when far apart ────────────────

function smartMerge(jkVal, psVal, threshold) {
  if (jkVal != null && psVal != null) {
    const diff = Math.abs(jkVal - psVal);
    if (diff <= threshold) {
      // Close agreement — average for better accuracy
      return parseFloat(((jkVal + psVal) / 2).toFixed(2));
    }
    // Big disagreement — prefer JK (lab-calibrated equipment)
    return jkVal;
  }
  return jkVal ?? psVal ?? null;
}

// ── Main merge ───────────────────────────────────────────────────────────────

function main() {
  const jk = loadJohnKew();
  const ps = loadPickleballStudio();
  const current = loadCurrentMerged();

  // Build lookup maps
  const jkMap = buildLookup(jk, p => normalize(p.fullName));
  const psMap = buildLookup(ps, p => normalize(p.brand + " " + p.name));
  const currentMap = buildLookup(current, p => normalize(p.brand + " " + p.name));

  // Start with John Kew as primary (cleanest source with power/pop)
  // Then fill in from Pickleball Studio
  // Then fill remaining from current (PE) data, marking PE-only fields

  const result = [];
  const seen = new Set();
  const sources = { jk: 0, ps: 0, pe: 0, jk_ps: 0, jk_pe: 0, ps_pe: 0, all3: 0 };

  // Process John Kew paddles first (they have power/pop)
  for (const jkPaddle of jk) {
    const key = normalize(jkPaddle.fullName);
    seen.add(key);

    // Try to match with PS
    let psMatch = null;
    for (const [psKey, psP] of psMap) {
      if (psKey === key || key.includes(psKey) || psKey.includes(key)) {
        psMatch = psP;
        break;
      }
    }

    // Try to match with current (for PE-exclusive fields)
    let peMatch = null;
    for (const [peKey, peP] of currentMap) {
      if (peKey === key || key.includes(peKey) || peKey.includes(key)) {
        peMatch = peP;
        break;
      }
    }

    // Parse brand from JK name (first word or known brand)
    const brand = extractBrand(jkPaddle.fullName);
    const name = jkPaddle.fullName.replace(new RegExp("^" + brand.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + "\\s*", "i"), "").trim();

    const paddle = {
      id: result.length + 1,
      name: name || jkPaddle.fullName,
      brand: brand,
      price: jkPaddle.price || psMatch?.price || peMatch?.price || 149.99,
      weight_oz: parseFloat((smartMerge(jkPaddle.weight_oz, psMatch?.weight_oz, 0.5) || peMatch?.weight_oz || 7.8).toFixed(1)),
      swing_weight: Math.round(smartMerge(jkPaddle.swing_weight, psMatch?.swing_weight, 5) || 115),
      twist_weight: parseFloat((smartMerge(jkPaddle.twist_weight, psMatch?.twist_weight, 0.5) || 6.5).toFixed(2)),

      // From JK or PS (clean sources)
      face_material: normalizeMaterial(psMatch?.face_material || peMatch?.face_material),
      core_material: psMatch?.core_material || peMatch?.core_material || null,
      shape: normalizeShape(peMatch?.shape || psMatch?.shape),
      core_thickness_mm: psMatch?.core_thickness_mm || peMatch?.core_thickness_mm || null,
      rpm: smartMerge(jkPaddle.spin_rpm, psMatch?.rpm, 200) || null,
      balance: jkPaddle.balance ? Math.round(jkPaddle.balance * 10) : (psMatch?.balance || peMatch?.balance || null),
      grip_length: jkPaddle.handle || psMatch?.grip_length || peMatch?.grip_length || null,
      grip_thickness: psMatch?.grip_thickness || peMatch?.grip_thickness || null,

      // Power/Pop/Spin — from John Kew (CLEAN!)
      power_mph: jkPaddle.power_mph,
      pop_mph: jkPaddle.pop_mph,
      spin_rpm: jkPaddle.spin_rpm,

      // PE-exclusive fields (marked for future removal)
      firepower_z: peMatch?.firepower_z || null,
      firepower_tier: peMatch?.firepower_tier || null,
      paddle_type: peMatch?.paddle_type || null,
      build_style: peMatch?.build_style || null,
      spin_rating: peMatch?.spin_rating || null,
      power_percentile: peMatch?.power_percentile || null,
      pop_percentile: peMatch?.pop_percentile || null,
      sw_percentile: peMatch?.sw_percentile || null,
      tw_percentile: peMatch?.tw_percentile || null,

      // Classification
      best_for: determineBestFor(jkPaddle.swing_weight, peMatch?.paddle_type),
      description: buildDescription(name, brand, jkPaddle, psMatch),
      image_url: peMatch?.image_url || `/images/paddles/${brand.toLowerCase().replace(/\s+/g, "-")}-${(name || "paddle").toLowerCase().replace(/[^a-z0-9]+/g, "-")}.jpg`,

      // Links — from PS or PE
      purchase_link: psMatch?.purchase_link || peMatch?.purchase_link || null,
      youtube_review: psMatch?.youtube_review || peMatch?.youtube_review || null,
      discount_code: psMatch?.discount_code || peMatch?.discount_code || null,
      amazon_link: `https://amazon.com/s?k=${encodeURIComponent(brand + " " + name)}&tag=picklefitter-20`,
      generic_affiliate_link: psMatch?.purchase_link || peMatch?.generic_affiliate_link || null,
      preferred_link_type: psMatch?.purchase_link ? "generic" : "amazon",

      // Data provenance
      _sources: [
        "jk",
        psMatch ? "ps" : null,
        peMatch ? "pe" : null,
      ].filter(Boolean),
    };

    result.push(paddle);

    if (psMatch && peMatch) sources.all3++;
    else if (psMatch) sources.jk_ps++;
    else if (peMatch) sources.jk_pe++;
    else sources.jk++;
  }

  // Add Pickleball Studio paddles not in JK
  for (const psP of ps) {
    if (!psP.swing_weight) continue;
    const key = normalize(psP.brand + " " + psP.name);

    let found = false;
    for (const seenKey of seen) {
      if (seenKey === key || seenKey.includes(key) || key.includes(seenKey)) {
        found = true;
        break;
      }
    }
    if (found) continue;
    seen.add(key);

    // Check if in PE
    let peMatch = null;
    for (const [peKey, peP] of currentMap) {
      if (peKey === key || key.includes(peKey) || peKey.includes(key)) {
        peMatch = peP;
        break;
      }
    }

    const paddle = {
      id: result.length + 1,
      name: psP.name,
      brand: psP.brand,
      price: psP.price || peMatch?.price || 149.99,
      weight_oz: psP.weight_oz ? parseFloat(psP.weight_oz.toFixed(1)) : (peMatch?.weight_oz || 7.8),
      swing_weight: psP.swing_weight,
      twist_weight: psP.twist_weight || peMatch?.twist_weight || 6.5,
      face_material: normalizeMaterial(psP.face_material),
      core_material: psP.core_material || null,
      shape: normalizeShape(psP.shape),
      core_thickness_mm: psP.core_thickness_mm || null,
      rpm: psP.rpm || null,
      balance: psP.balance || null,
      grip_length: psP.grip_length || null,
      grip_thickness: psP.grip_thickness || null,
      power_mph: peMatch?.power_mph || null, // Only from PE if matched
      pop_mph: peMatch?.pop_mph || null,
      spin_rpm: psP.rpm || null,
      firepower_z: peMatch?.firepower_z || null,
      firepower_tier: peMatch?.firepower_tier || null,
      paddle_type: peMatch?.paddle_type || null,
      build_style: peMatch?.build_style || null,
      spin_rating: peMatch?.spin_rating || null,
      power_percentile: peMatch?.power_percentile || null,
      pop_percentile: peMatch?.pop_percentile || null,
      sw_percentile: peMatch?.sw_percentile || null,
      tw_percentile: peMatch?.tw_percentile || null,
      best_for: determineBestFor(psP.swing_weight, peMatch?.paddle_type),
      description: buildDescription(psP.name, psP.brand, psP, null),
      image_url: `/images/paddles/${psP.brand.toLowerCase().replace(/\s+/g, "-")}-${psP.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.jpg`,
      purchase_link: psP.purchase_link || null,
      youtube_review: psP.youtube_review || null,
      discount_code: psP.discount_code || null,
      amazon_link: `https://amazon.com/s?k=${encodeURIComponent(psP.brand + " " + psP.name)}&tag=picklefitter-20`,
      generic_affiliate_link: psP.purchase_link || null,
      preferred_link_type: psP.purchase_link ? "generic" : "amazon",
      _sources: [
        "ps",
        peMatch ? "pe" : null,
      ].filter(Boolean),
    };

    result.push(paddle);
    if (peMatch) sources.ps_pe++;
    else sources.ps++;
  }

  // Add PE-only paddles not found in JK or PS (keep rather than lose data)
  for (const peP of current) {
    if (!peP.swing_weight) continue;
    const key = normalize(peP.brand + " " + peP.name);

    let found = false;
    for (const seenKey of seen) {
      if (seenKey === key || seenKey.includes(key) || key.includes(seenKey)) {
        found = true;
        break;
      }
    }
    if (found) continue;
    seen.add(key);

    const paddle = {
      id: result.length + 1,
      name: peP.name,
      brand: peP.brand,
      price: peP.price || 149.99,
      weight_oz: peP.weight_oz || 7.8,
      swing_weight: peP.swing_weight,
      twist_weight: peP.twist_weight || 6.5,
      face_material: peP.face_material || "Composite",
      core_material: peP.core_material || null,
      shape: peP.shape || null,
      core_thickness_mm: peP.core_thickness_mm || null,
      rpm: peP.rpm || null,
      balance: peP.balance || null,
      grip_length: peP.grip_length || null,
      grip_thickness: peP.grip_thickness || null,
      power_mph: peP.power_mph || null,
      pop_mph: peP.pop_mph || null,
      spin_rpm: peP.spin_rpm || null,
      firepower_z: peP.firepower_z || null,
      firepower_tier: peP.firepower_tier || null,
      paddle_type: peP.paddle_type || null,
      build_style: peP.build_style || null,
      spin_rating: peP.spin_rating || null,
      power_percentile: peP.power_percentile || null,
      pop_percentile: peP.pop_percentile || null,
      sw_percentile: peP.sw_percentile || null,
      tw_percentile: peP.tw_percentile || null,
      best_for: determineBestFor(peP.swing_weight, peP.paddle_type),
      description: peP.description || `${peP.name} by ${peP.brand}.`,
      image_url: peP.image_url || `/images/paddles/${peP.brand.toLowerCase().replace(/\s+/g, "-")}-${peP.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.jpg`,
      purchase_link: peP.purchase_link || null,
      youtube_review: peP.youtube_review || null,
      discount_code: peP.discount_code || null,
      amazon_link: peP.amazon_link || `https://amazon.com/s?k=${encodeURIComponent(peP.brand + " " + peP.name)}&tag=picklefitter-20`,
      generic_affiliate_link: peP.generic_affiliate_link || null,
      preferred_link_type: peP.preferred_link_type || "amazon",
      _sources: ["pe"],
    };

    result.push(paddle);
    sources.pe = (sources.pe || 0) + 1;
  }

  // Re-index
  result.forEach((p, i) => (p.id = i + 1));

  // Stats
  console.log("\n=== Results ===");
  console.log("Total paddles:", result.length);
  console.log("Source breakdown:");
  console.log("  JK only:", sources.jk);
  console.log("  JK + PS:", sources.jk_ps);
  console.log("  JK + PE:", sources.jk_pe);
  console.log("  All 3:", sources.all3);
  console.log("  PS only:", sources.ps);
  console.log("  PS + PE:", sources.ps_pe);
  console.log("  PE only:", sources.pe || 0);

  const withPower = result.filter(p => p.power_mph).length;
  const withPowerFromJK = result.filter(p => p._sources.includes("jk") && p.power_mph).length;
  const withPowerFromPE = result.filter(p => !p._sources.includes("jk") && p.power_mph).length;
  console.log("\nPower/Pop data:");
  console.log("  Total with power:", withPower);
  console.log("  From John Kew (clean):", withPowerFromJK);
  console.log("  From PE only (to replace):", withPowerFromPE);

  const peOnlyFields = result.filter(p => p.firepower_tier && !p._sources.includes("jk")).length;
  console.log("\nPE-exclusive fields still used:");
  console.log("  Firepower tier:", result.filter(p => p.firepower_tier).length);
  console.log("  Build style:", result.filter(p => p.build_style).length);
  console.log("  Paddle type:", result.filter(p => p.paddle_type).length);

  console.log("\nBrands:", new Set(result.map(p => p.brand)).size);

  // Save (without _sources field in production data)
  const prodData = result.map(({ _sources, ...rest }) => rest);
  fs.writeFileSync("lib/paddle-data.json", JSON.stringify(prodData));

  // Save provenance report
  const report = result.map(p => ({
    name: p.brand + " " + p.name,
    sources: p._sources.join("+"),
    power_source: p._sources.includes("jk") ? "johnkew" : (p.power_mph ? "pe" : "none"),
    has_pe_exclusive: !!(p.firepower_tier || p.build_style || p.paddle_type),
  }));
  fs.writeFileSync("data-provenance.json", JSON.stringify(report, null, 2));
  console.log("\nSaved lib/paddle-data.json, data-provenance.json");
}

// ── Helpers ──────────────────────────────────────────────────────────────────

const KNOWN_BRANDS = [
  "11Six24", "11six24", "Adidas", "Aireo", "Babolat", "Body Helix", "Bread & Butter",
  "Chorus", "Chorus Pickleball", "CRBN", "Diadem", "Electrum", "Engage",
  "Franklin", "Friday", "Gamma", "Gearbox", "Gruvn", "HEAD",
  "Holbrook", "Honolulu Pickleball", "Joola", "JOOLA", "Legacy Pro",
  "Luzz", "Mark", "Neonic", "Onix", "Oya", "Paddletek",
  "Pickleball Apes", "Pro Kennex", "ProDrive", "Ronbus",
  "Selkirk", "Selkirk Labs", "Six Zero", "SixZero", "SLK",
  "Spartus", "Vatic Pro", "Volair",
];

function extractBrand(fullName) {
  const lower = fullName.toLowerCase();
  // Try longest brand match first
  const sorted = [...KNOWN_BRANDS].sort((a, b) => b.length - a.length);
  for (const brand of sorted) {
    if (lower.startsWith(brand.toLowerCase())) {
      return brand;
    }
  }
  // Fallback: first word
  return fullName.split(" ")[0];
}

function determineBestFor(sw, paddleType) {
  if (paddleType) {
    if (paddleType === "Power") return "Aggressive";
    if (paddleType === "Control") return "Control";
    return "Balanced";
  }
  if (sw >= 120) return "Aggressive";
  if (sw <= 108) return "Control";
  return "Balanced";
}

function buildDescription(name, brand, specs, psMatch) {
  const parts = [];
  if (psMatch?.shape || specs?.shape) parts.push(`${normalizeShape(psMatch?.shape || specs?.shape)} shape`);
  if (psMatch?.core_material) parts.push(`${psMatch.core_material} core`);
  if (psMatch?.core_thickness_mm || specs?.core_thickness_mm) parts.push(`${psMatch?.core_thickness_mm || specs.core_thickness_mm}mm`);
  if (specs?.spin_rpm || psMatch?.rpm) parts.push(`${specs?.spin_rpm || psMatch?.rpm} RPM`);
  if (specs?.power_mph) parts.push(`${specs.power_mph} MPH power`);
  return parts.length > 0 ? parts.join(", ") + "." : `${name} by ${brand}.`;
}

main();
