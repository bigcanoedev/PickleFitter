/**
 * Scrapes paddle data from The Pickleball Studio's public Notion database.
 *
 * Usage: node scripts/scrape-notion-paddles.js
 *
 * Outputs:
 *   - scraped-paddles-raw.json   (raw Notion data)
 *   - scraped-paddles-clean.json (cleaned, ready for import)
 *   - lib/paddle-data.ts         (updated TypeScript file)
 */

const https = require("https");
const fs = require("fs");
const path = require("path");

const COLLECTION_ID = "3c5f9880-81b2-4ace-b83c-46374c8281c0";
const VIEW_ID = "a5170d43-e5ab-4573-b18f-48c363cce7ec";
const SPACE_ID = "506f2e06-5b8c-449b-8da1-caa63bc40912";
const NOTION_HOST = "thepickleballstudio.notion.site";

// Schema mapping from Notion field IDs to human-readable names
const SCHEMA_MAP = {
  "{S<Z": "paddle_name",
  "o{Nq": "company",
  "`R^P": "price",
  "{@PA": "advertised_weight",
  "Lfds": "swing_weight",
  "KmOn": "twist_weight",
  "PD||": "balance",
  "D>v]": "grams",
  "Sk;V": "face_material",
  "lvSm": "core_material",
  "RLTk": "shape",
  "fSUz": "core_thickness_mm",
  "bEnc": "grip_length",
  "kKLs": "grip_thickness",
  "o>uL": "rpm",
  "lVld": "purchase_link",
  "_b^^": "youtube_review",
  "lZ`G": "discount",
  "tI]y": "discount_code",
  "oeUN": "codes",
  ">g}f": "notes",
  "hCyG": "note",
  "C{vB": "id_number",
  "ASxE": "score",
  "TOIH": "date",
  "cvM}": "head_heavy",
  "Plod": "my_paddles_weight",
};

function fetchJSON(urlPath, body) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const options = {
      hostname: NOTION_HOST,
      path: urlPath,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(data),
      },
    };

    const req = https.request(options, (res) => {
      let chunks = [];
      res.on("data", (chunk) => chunks.push(chunk));
      res.on("end", () => {
        try {
          resolve(JSON.parse(Buffer.concat(chunks).toString()));
        } catch (e) {
          reject(new Error(`JSON parse error: ${e.message}`));
        }
      });
    });
    req.on("error", reject);
    req.write(data);
    req.end();
  });
}

async function getAllBlockIds() {
  console.log("Fetching paddle IDs from collection...");
  const result = await fetchJSON("/api/v3/queryCollection", {
    collection: { id: COLLECTION_ID, spaceId: SPACE_ID },
    collectionView: { id: VIEW_ID, spaceId: SPACE_ID },
    loader: {
      type: "reducer",
      reducers: {
        collection_group_results: { type: "results", limit: 1000 },
      },
      searchQuery: "",
      userTimeZone: "America/New_York",
    },
  });

  const blockIds =
    result?.result?.reducerResults?.collection_group_results?.blockIds || [];
  console.log(`Found ${blockIds.length} paddle entries`);
  return blockIds;
}

async function fetchBlocksBatch(ids) {
  const requests = ids.map((id) => ({ id, table: "block" }));
  const result = await fetchJSON("/api/v3/getRecordValues", { requests });
  return result?.results || [];
}

function extractProperty(props, key) {
  const val = props[key];
  if (!val) return null;
  // Notion stores values as [[value]] or [[value, [["a", url]]]]
  if (Array.isArray(val) && val[0] && Array.isArray(val[0])) {
    return val[0][0] || null;
  }
  return null;
}

function extractUrl(props, key) {
  const val = props[key];
  if (!val) return null;
  if (Array.isArray(val) && val[0] && Array.isArray(val[0])) {
    // Check for URL annotation
    if (val[0][1] && Array.isArray(val[0][1])) {
      for (const annotation of val[0][1]) {
        if (annotation[0] === "a") return annotation[1];
      }
    }
    return val[0][0] || null;
  }
  return null;
}

function parseWeight(weightStr) {
  if (!weightStr) return null;
  // Handle ranges like "7.9-8.3oz" - take the midpoint
  const rangeMatch = weightStr.match(/([\d.]+)\s*-\s*([\d.]+)/);
  if (rangeMatch) {
    return parseFloat(((parseFloat(rangeMatch[1]) + parseFloat(rangeMatch[2])) / 2).toFixed(1));
  }
  const singleMatch = weightStr.match(/([\d.]+)/);
  return singleMatch ? parseFloat(parseFloat(singleMatch[1]).toFixed(1)) : null;
}

function cleanPaddle(props, index) {
  const name = extractProperty(props, "{S<Z");
  const company = extractProperty(props, "o{Nq");
  const priceStr = extractProperty(props, "`R^P");
  const weightStr = extractProperty(props, "{@PA");
  const swStr = extractProperty(props, "Lfds");
  const twStr = extractProperty(props, "KmOn");
  const faceMat = extractProperty(props, "Sk;V");
  const coreMat = extractProperty(props, "lvSm");
  const shape = extractProperty(props, "RLTk");
  const coreThickness = extractProperty(props, "fSUz");
  const gripLength = extractProperty(props, "bEnc");
  const gripThickness = extractProperty(props, "kKLs");
  const rpm = extractProperty(props, "o>uL");
  const balance = extractProperty(props, "PD||");
  const grams = extractProperty(props, "D>v]");
  const purchaseLink = extractUrl(props, "lVld");
  const youtubeReview = extractUrl(props, "_b^^");
  const discount = extractProperty(props, "lZ`G");
  const discountCode = extractProperty(props, "tI]y");

  return {
    id: index + 1,
    name: name || "Unknown Paddle",
    brand: company || "Unknown",
    price: priceStr ? parseFloat(priceStr) : 0,
    weight_oz: parseWeight(weightStr),
    swing_weight: swStr ? parseInt(swStr) : null,
    twist_weight: twStr ? parseFloat(twStr) : null,
    balance: balance ? parseFloat(balance) : null,
    grams: grams ? parseFloat(grams) : null,
    face_material: faceMat || "Unknown",
    core_material: coreMat || null,
    shape: shape || null,
    core_thickness_mm: coreThickness ? parseFloat(coreThickness) : null,
    grip_length: gripLength ? parseFloat(gripLength) : null,
    grip_thickness: gripThickness || null,
    rpm: rpm ? parseInt(rpm) : null,
    purchase_link: purchaseLink,
    youtube_review: youtubeReview,
    discount: discount,
    discount_code: discountCode,
  };
}

function determineBestFor(paddle) {
  if (!paddle.swing_weight) return "Balanced";
  if (paddle.swing_weight >= 120) return "Aggressive";
  if (paddle.swing_weight <= 108) return "Control";
  return "Balanced";
}

function generateDescription(paddle) {
  const parts = [];
  if (paddle.shape) parts.push(`${paddle.shape} shape`);
  if (paddle.core_material) parts.push(`${paddle.core_material} core`);
  if (paddle.core_thickness_mm) parts.push(`${paddle.core_thickness_mm}mm thick`);
  if (paddle.rpm) parts.push(`${paddle.rpm} RPM spin`);
  return parts.length > 0
    ? `${paddle.name} - ${parts.join(", ")}.`
    : `${paddle.name} by ${paddle.brand}.`;
}

function normalizeShape(raw) {
  if (!raw) return null;
  const lower = raw.toLowerCase();
  if (lower.includes("wide")) return "Wide body";
  if (lower.includes("elongated") && lower.includes("extra")) return "Elongated";
  if (lower.includes("elongated")) return "Elongated";
  if (lower.includes("hybrid")) return "Hybrid";
  if (lower.includes("teardrop")) return "Teardrop";
  if (lower.includes("standard")) return "Standard";
  return raw;
}

function toAppFormat(paddle) {
  return {
    id: paddle.id,
    name: paddle.name,
    brand: paddle.brand,
    price: paddle.price || 149.99,
    weight_oz: paddle.weight_oz || 7.8,
    swing_weight: paddle.swing_weight || 115,
    twist_weight: paddle.twist_weight || 6.5,
    face_material: normalizeMaterial(paddle.face_material),
    core_material: paddle.core_material || null,
    shape: normalizeShape(paddle.shape),
    core_thickness_mm: paddle.core_thickness_mm || null,
    rpm: paddle.rpm || null,
    balance: paddle.balance || null,
    grip_length: paddle.grip_length || null,
    grip_thickness: paddle.grip_thickness || null,
    best_for: determineBestFor(paddle),
    description: generateDescription(paddle),
    image_url: `/images/paddles/${paddle.brand.toLowerCase().replace(/\s+/g, "-")}-${paddle.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.jpg`,
    purchase_link: paddle.purchase_link || null,
    youtube_review: paddle.youtube_review || null,
    discount_code: paddle.discount_code || null,
    amazon_link: `https://amazon.com/s?k=${encodeURIComponent(paddle.brand + " " + paddle.name)}&tag=picklefitter-20`,
    generic_affiliate_link: paddle.purchase_link || null,
    preferred_link_type: paddle.purchase_link ? "generic" : "amazon",
  };
}

function normalizeMaterial(raw) {
  if (!raw) return "Composite";
  const lower = raw.toLowerCase();
  if (lower.includes("raw carbon") || lower.includes("toray carbon") || lower.includes("t700"))
    return "Carbon";
  if (lower.includes("fiberglass") && lower.includes("carbon")) return "Hybrid";
  if (lower.includes("fiberglass")) return "Fiberglass";
  if (lower.includes("carbon")) return "Carbon";
  if (lower.includes("graphite")) return "Graphite";
  if (lower.includes("kevlar")) return "Composite";
  return "Composite";
}

async function main() {
  try {
    // Step 1: Get all block IDs
    const blockIds = await getAllBlockIds();

    // Step 2: Fetch blocks in batches of 30
    const BATCH_SIZE = 30;
    const allPaddles = [];

    for (let i = 0; i < blockIds.length; i += BATCH_SIZE) {
      const batch = blockIds.slice(i, i + BATCH_SIZE);
      process.stdout.write(
        `\rFetching batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(blockIds.length / BATCH_SIZE)}...`
      );

      const results = await fetchBlocksBatch(batch);

      for (const result of results) {
        const props = result?.value?.properties;
        if (props) {
          allPaddles.push(cleanPaddle(props, allPaddles.length));
        }
      }

      // Small delay to be nice to the server
      await new Promise((r) => setTimeout(r, 200));
    }

    console.log(`\nFetched ${allPaddles.length} paddles with data`);

    // Step 3: Filter paddles with sufficient data
    const goodPaddles = allPaddles.filter(
      (p) => p.name && p.name !== "Unknown Paddle" && p.swing_weight
    );
    console.log(`${goodPaddles.length} paddles have swing weight data`);

    // Step 4: Save raw data
    fs.writeFileSync(
      "scraped-paddles-raw.json",
      JSON.stringify(allPaddles, null, 2)
    );
    console.log("Saved scraped-paddles-raw.json");

    // Step 5: Convert to app format and save
    const appPaddles = goodPaddles.map((p, i) => ({ ...toAppFormat(p), id: i + 1 }));
    fs.writeFileSync(
      "scraped-paddles-clean.json",
      JSON.stringify(appPaddles, null, 2)
    );
    console.log(`Saved scraped-paddles-clean.json (${appPaddles.length} paddles)`);

    // Step 6: Generate TypeScript file
    const tsContent = `import { Paddle } from "./types";

// Auto-generated from The Pickleball Studio Notion database
// Last scraped: ${new Date().toISOString().split("T")[0]}
// Source: https://thepickleballstudio.notion.site/5bdf3ee752c940eba864a81bc3281164

export const paddleData: Paddle[] = ${JSON.stringify(appPaddles, null, 2)};
`;
    fs.writeFileSync(path.join("lib", "paddle-data.ts"), tsContent);
    console.log(`Updated lib/paddle-data.ts with ${appPaddles.length} paddles`);

    // Summary
    console.log("\n--- Summary ---");
    console.log(`Total scraped: ${allPaddles.length}`);
    console.log(`With swing weight: ${goodPaddles.length}`);
    console.log(`Unique brands: ${new Set(goodPaddles.map((p) => p.brand)).size}`);
    console.log(
      `Price range: $${Math.min(...goodPaddles.filter((p) => p.price > 0).map((p) => p.price))} - $${Math.max(...goodPaddles.map((p) => p.price))}`
    );
    console.log(
      `SW range: ${Math.min(...goodPaddles.map((p) => p.swing_weight))} - ${Math.max(...goodPaddles.map((p) => p.swing_weight))}`
    );

    const brands = {};
    goodPaddles.forEach((p) => {
      brands[p.brand] = (brands[p.brand] || 0) + 1;
    });
    console.log("\nTop brands:");
    Object.entries(brands)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 15)
      .forEach(([brand, count]) => console.log(`  ${brand}: ${count}`));
  } catch (err) {
    console.error("Error:", err.message);
    process.exit(1);
  }
}

main();
