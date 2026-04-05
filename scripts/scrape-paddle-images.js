/**
 * Scrapes paddle images from Pickleball Studio's website.
 *
 * 1. Fetches the paddle listing pages to get paddle slugs
 * 2. For each paddle, fetches the detail page to get the Sanity CDN image URL
 * 3. Downloads images and saves to public/images/paddles/
 * 4. Updates paddle-data.json with working image URLs
 *
 * Usage: node scripts/scrape-paddle-images.js
 */

const https = require("https");
const http = require("http");
const fs = require("fs");
const path = require("path");

const BASE_URL = "https://pickleballstudio.com";
const IMAGE_DIR = path.join(__dirname, "..", "public", "images", "paddles");
const PADDLE_DATA_PATH = path.join(__dirname, "..", "lib", "paddle-data.json");

// Rate limiting
const DELAY_MS = 500;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function fetch(url) {
  return new Promise((resolve, reject) => {
    const mod = url.startsWith("https") ? https : http;
    mod.get(url, { headers: { "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)" } }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return fetch(res.headers.location).then(resolve).catch(reject);
      }
      const chunks = [];
      res.on("data", (c) => chunks.push(c));
      res.on("end", () => resolve({ status: res.statusCode, body: Buffer.concat(chunks) }));
      res.on("error", reject);
    }).on("error", reject);
  });
}

function slugify(brand, name) {
  return `${brand} ${name}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

async function fetchAllPaddleSlugs() {
  console.log("Fetching paddle slugs from Sanity API...");
  const apiUrl = 'https://ka3o2rwm.api.sanity.io/v2023-08-01/data/query/production?query=' +
    encodeURIComponent('*[_type=="paddle"]{"slug":slug.current,name,"brand":brand->name}|order(name asc)[0...500]');
  const { body } = await fetch(apiUrl);
  const data = JSON.parse(body.toString());
  const results = data.result || [];

  // Deduplicate slugs
  const seen = new Set();
  const slugs = [];
  for (const r of results) {
    if (r.slug && !seen.has(r.slug)) {
      seen.add(r.slug);
      slugs.push({ slug: r.slug, brand: r.brand || "", name: r.name || "" });
    }
  }

  console.log(`Found ${slugs.length} unique paddle slugs from API`);
  return slugs;
}

async function fetchImageUrl(paddleSlug) {
  const url = `${BASE_URL}/paddles/${paddleSlug}`;
  try {
    const { body } = await fetch(url);
    const html = body.toString();

    // Look for Sanity CDN image URLs
    const sanityRegex = /https%3A%2F%2Fcdn\.sanity\.io%2Fimages%2F[^"&]+/g;
    const sanityMatch = sanityRegex.exec(html);
    if (sanityMatch) {
      return decodeURIComponent(sanityMatch[0]).split("&")[0]; // Get base URL without next/image params
    }

    // Also try decoded URLs
    const directRegex = /https:\/\/cdn\.sanity\.io\/images\/[^"'\s]+\.(?:png|jpg|webp)/g;
    const directMatch = directRegex.exec(html);
    if (directMatch) {
      return directMatch[0].split("?")[0];
    }

    return null;
  } catch (err) {
    console.error(`  Error fetching ${paddleSlug}: ${err.message}`);
    return null;
  }
}

async function downloadImage(imageUrl, filename) {
  try {
    // Request a reasonable size
    const sizedUrl = imageUrl.includes("?")
      ? imageUrl + "&w=400&h=400&q=80&auto=format"
      : imageUrl + "?w=400&h=400&q=80&auto=format";

    const { status, body } = await fetch(sizedUrl);
    if (status !== 200) {
      console.error(`  HTTP ${status} for ${filename}`);
      return false;
    }

    const ext = imageUrl.includes(".png") ? ".png" : ".jpg";
    const filepath = path.join(IMAGE_DIR, filename + ext);
    fs.writeFileSync(filepath, body);
    return ext;
  } catch (err) {
    console.error(`  Download error for ${filename}: ${err.message}`);
    return false;
  }
}

function normalizeForMatching(str) {
  return str.toLowerCase().replace(/[^a-z0-9]/g, "");
}

async function main() {
  // Ensure output directory exists
  if (!fs.existsSync(IMAGE_DIR)) {
    fs.mkdirSync(IMAGE_DIR, { recursive: true });
  }

  // Load paddle data
  const paddleData = JSON.parse(fs.readFileSync(PADDLE_DATA_PATH, "utf8"));
  console.log(`Loaded ${paddleData.length} paddles from database`);

  // Step 1: Get all paddle slugs from Sanity API
  const psPaddles = await fetchAllPaddleSlugs();

  // Step 2: For each slug, get the image URL from the detail page
  console.log(`\nFetching image URLs from ${psPaddles.length} paddle pages...`);
  const imageMap = new Map(); // slug -> { imageUrl, brand, name }

  for (let i = 0; i < psPaddles.length; i++) {
    const { slug, brand, name } = psPaddles[i];
    process.stdout.write(`  [${i + 1}/${psPaddles.length}] ${slug}...`);

    const imageUrl = await fetchImageUrl(slug);
    if (imageUrl) {
      imageMap.set(slug, { imageUrl, brand, name });
      console.log(" OK");
    } else {
      console.log(" no image");
    }

    await sleep(DELAY_MS);
  }

  console.log(`\nGot ${imageMap.size} image URLs`);

  // Step 3: Match PS paddles to our data and download
  console.log("\nMatching and downloading images...");
  let matched = 0;
  let downloaded = 0;
  let skipped = 0;

  for (const paddle of paddleData) {
    const ourSlug = slugify(paddle.brand, paddle.name);
    const ourNameNorm = normalizeForMatching(`${paddle.brand}${paddle.name}`);

    // Try multiple matching strategies
    let bestMatch = null;

    for (const [psSlug, psData] of imageMap) {
      const psNameNorm = normalizeForMatching(`${psData.brand}${psData.name}`);

      // Strategy 1: Exact normalized name match
      if (ourNameNorm === psNameNorm) {
        bestMatch = psData.imageUrl;
        break;
      }

      // Strategy 2: PS slug matches our name slug (without brand prefix)
      const ourNameOnly = slugify("", paddle.name).replace(/^-/, "");
      if (psSlug === ourNameOnly || ourNameOnly.includes(psSlug) || psSlug.includes(ourNameOnly)) {
        bestMatch = psData.imageUrl;
        break;
      }

      // Strategy 3: Normalized name containment (longer contains shorter)
      if (ourNameNorm.length > 5 && psNameNorm.length > 5) {
        if (ourNameNorm.includes(psNameNorm) || psNameNorm.includes(ourNameNorm)) {
          bestMatch = psData.imageUrl;
          break;
        }
      }
    }

    if (bestMatch) {
      matched++;
      const filename = ourSlug;

      // Skip if already downloaded
      if (fs.existsSync(path.join(IMAGE_DIR, filename + ".png")) ||
          fs.existsSync(path.join(IMAGE_DIR, filename + ".jpg"))) {
        skipped++;
        continue;
      }

      const ext = await downloadImage(bestMatch, filename);
      if (ext) {
        paddle.image_url = `/images/paddles/${filename}${ext}`;
        downloaded++;
        process.stdout.write(`  Downloaded: ${paddle.brand} ${paddle.name}\n`);
      }

      await sleep(200);
    }
  }

  console.log(`\nMatched: ${matched}/${paddleData.length}`);
  console.log(`Already had: ${skipped}`);
  console.log(`Downloaded: ${downloaded} new images`);

  // Step 4: Save image mapping for reference
  const mappingPath = path.join(__dirname, "..", "paddle-image-map.json");
  const mapping = {};
  for (const [slug, url] of imageMap) {
    mapping[slug] = url;
  }
  fs.writeFileSync(mappingPath, JSON.stringify(mapping, null, 2));
  console.log(`\nSaved image URL mapping to paddle-image-map.json`);

  // Step 5: Update paddle data with new image URLs
  fs.writeFileSync(PADDLE_DATA_PATH, JSON.stringify(paddleData, null, 2));
  console.log("Updated lib/paddle-data.json with image URLs");
}

main().catch(console.error);
