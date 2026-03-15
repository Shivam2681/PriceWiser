"use server";

/**
 * Playwright-based Amazon product scraper.
 * Uses a real browser for accurate extraction and to avoid bot blocks.
 */

const { chromium } = require("playwright");

// ——— Price/currency helpers (same logic as lib/utils.js but for raw strings) ———
function extractPriceFromStrings(...texts) {
  for (const raw of texts) {
    const priceText = (raw || "").trim();
    if (!priceText) continue;
    const cleanPrice = priceText.replace(/[^\d.]/g, "");
    if (!cleanPrice) continue;
    const withCents = cleanPrice.match(/\d+\.\d{2}/)?.[0];
    return withCents || cleanPrice;
  }
  return "";
}

/** Extract all numeric prices from texts (for choosing true MRP vs per-unit price). */
function extractAllPricesFromStrings(...texts) {
  const prices = [];
  for (const raw of texts) {
    const priceText = (raw || "").trim();
    if (!priceText) continue;
    const cleanPrice = priceText.replace(/[^\d.]/g, "");
    if (!cleanPrice) continue;
    const withCents = cleanPrice.match(/\d+\.\d{2}/)?.[0];
    const num = parseFloat(withCents || cleanPrice);
    if (!Number.isNaN(num) && num > 0) prices.push(num);
  }
  return prices;
}

/**
 * Pick single-unit M.R.P.: smallest price >= current (avoids bundle/list totals like ₹3,996 when real MRP is ₹399).
 */
function chooseOriginalPrice(allOriginalPrices, currentPriceNum) {
  const valid = allOriginalPrices.filter((p) => p >= currentPriceNum);
  if (valid.length > 0) return Math.min(...valid);
  return currentPriceNum;
}

/**
 * Selling price = minimum of current candidates (avoids using M.R.P. ₹999 as current when ₹249 is the real price).
 */
function chooseCurrentPrice(allCurrentPrices) {
  return allCurrentPrices.length > 0 ? Math.min(...allCurrentPrices) : 0;
}

function extractCurrencyFromText(text) {
  const t = (text || "").trim();
  return t.slice(0, 1) || "";
}

// ——— Amazon selectors (multiple per field for robustness across locales/layouts) ———
const SELECTORS = {
  title: [
    "#productTitle",
    "#title",
    "h1#title",
    "[data-feature-name='title'] #productTitle",
  ],
  // Selling price — include deal/today's price; we take min so single-unit price (e.g. ₹299) wins over bundle (₹999)
  currentPrice: [
    "span.apexPriceToPay",
    "#corePrice_desktop .apexPriceToPay",
    "#corePrice_desktop .a-offscreen",
    "#apex_desktop .a-price .a-offscreen",
    ".priceToPay .a-price-whole",
    ".priceToPay span.a-offscreen",
    "#priceblock_dealprice",
    "#price_inside_buybox",
    "#priceblock_ourprice",
    "#corePrice_feature_div .a-price:not(.a-text-price) .a-offscreen",
    "#corePriceDisplay_desktop_feature_div .a-price:not(.a-text-price) .a-offscreen",
    "#corePrice_feature_div .a-price .a-offscreen",
    "#corePriceDisplay_desktop_feature_div .a-price .a-offscreen",
    ".a-price[data-a-color='price'] .a-offscreen",
    "span.a-price-whole",
    "[data-feature-name='corePrice'] .a-price-whole",
    "[data-feature-name='corePrice'] .a-offscreen",
  ],
  // List/original price (M.R.P.) — order matters: prefer explicit MRP/list price blocks
  originalPrice: [
    "#corePrice_feature_div .a-text-price .a-offscreen",
    "#corePriceDisplay_desktop_feature_div .a-text-price .a-offscreen",
    "#listPrice .a-offscreen",
    "#priceblock_saleprice",
    ".a-price.a-text-price span.a-offscreen",
    ".a-text-price.a-size-medium .a-offscreen",
    ".basisPrice .a-offscreen",
    "span[data-a-strike='true'].a-offscreen",
  ],
  availability: [
    "#availability span",
    "#availability",
    "#availability .a-color-success",
    "#availability .a-color-price",
  ],
  image: [
    "#landingImage",
    "#imgBlkFront",
    "#main-image",
    ".a-dynamic-image",
  ],
  breadcrumb: [
    "#wayfinding-breadcrumbs_feature_div ul li a",
    ".a-breadcrumb li a",
  ],
  reviewsCount: [
    "#acrCustomerReviewText",
    "[data-hook='total-review-count']",
    "#acrCustomerReviewText",
  ],
  discount: [
    ".savingsPercentage",
    ".a-size-large.a-color-price.savingsPercentage",
    "#regularPriceSavings .a-offscreen",
  ],
  currency: [
    ".a-price-symbol",
    ".priceToPay .a-price-symbol",
  ],
};

const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

const DEFAULT_NAV_TIMEOUT = 35000;
const DEFAULT_SELECTOR_TIMEOUT = 15000;

/**
 * Try multiple selectors; return the first non-empty text.
 */
async function getFirstText(page, selectors, options = {}) {
  const timeout = options.timeout ?? 2000;
  for (const sel of selectors) {
    try {
      const el = await page.$(sel);
      if (!el) continue;
      const text = await el.textContent();
      await el.dispose?.();
      if (text && text.trim()) return text.trim();
    } catch {
      // selector failed, try next
    }
  }
  return "";
}

/**
 * Get text from first selector that exists (no strict timeout for each).
 */
async function getFirstTextQuick(page, selectors) {
  for (const sel of selectors) {
    try {
      const el = await page.$(sel);
      if (!el) continue;
      const text = await el.textContent();
      await el.dispose?.();
      if (text != null) return text.trim();
    } catch {
      // ignore
    }
  }
  return "";
}

/**
 * Get attribute (e.g. src or data-a-dynamic-image) from first matching element.
 */
async function getFirstAttr(page, selectors, attr) {
  for (const sel of selectors) {
    try {
      const el = await page.$(sel);
      if (!el) continue;
      const value = await el.getAttribute(attr);
      await el.dispose?.();
      if (value) return value;
    } catch {
      // ignore
    }
  }
  return "";
}

/**
 * Scrape Amazon product page with Playwright.
 * @param {string} url - Full Amazon product URL
 * @param {{ proxy?: { server: string, username?: string, password?: string } }} options
 * @returns {Promise<import('../types').Product | null>} Same shape as existing scraper, or null on failure
 */
async function scrapeAmazonWithPlaywright(url, options = {}) {
  let browser = null;

  try {
    const launchOptions = {
      headless: true,
      args: [
        "--disable-blink-features=AutomationControlled",
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-accelerated-2d-canvas",
        "--disable-gpu",
      ],
    };

    if (options.proxy?.server) {
      launchOptions.proxy = options.proxy;
    }

    browser = await chromium.launch(launchOptions);

    const context = await browser.newContext({
      userAgent: USER_AGENT,
      viewport: { width: 1920, height: 1080 },
      locale: "en-IN",
      ignoreHTTPSErrors: true,
    });

    // Reduce detection surface
    await context.addInitScript(() => {
      Object.defineProperty(navigator, "webdriver", { get: () => undefined });
    });

    const page = await context.newPage();

    // Block heavy resources only (keep CSS so layout/selectors stay valid)
    await page.route("**/*", (route) => {
      const type = route.request().resourceType();
      if (["media", "font"].includes(type)) route.abort();
      else route.continue();
    });

    await page.goto(url, {
      waitUntil: "domcontentloaded",
      timeout: DEFAULT_NAV_TIMEOUT,
    });

    const titleOrPrice = await Promise.race([
      page.waitForSelector("#productTitle, #title, .priceToPay, #priceblock_ourprice, #priceblock_dealprice, .a-price", {
        timeout: DEFAULT_SELECTOR_TIMEOUT,
      }),
      page.waitForSelector("form#captchacharacters, #captchacharacters", { timeout: 5000 }).then(() => "captcha"),
    ]).catch(() => null);

    if (titleOrPrice === "captcha" || !titleOrPrice) {
      console.warn("Playwright: captcha or product content not found for", url);
      return null;
    }

    // Wait for deal/today's price to load (e.g. ₹698 vs list ₹2,999)
    await page.waitForLoadState("networkidle", { timeout: 8000 }).catch(() => {});
    await new Promise((r) => setTimeout(r, 2000));

    const title = await getFirstTextQuick(page, SELECTORS.title);
    if (!title) {
      console.warn("Playwright: could not extract title for", url);
    }

    // Collect EVERY price from all price blocks (deal + buybox + core) — small products often show deal in different block
    const { sellingPrices, originalPrices } = await page.evaluate(() => {
      const parsePrice = (text) => {
        if (!text || typeof text !== "string") return 0;
        const clean = text.replace(/[^\d.]/g, "");
        const m = clean.match(/\d+\.?\d{0,2}/);
        const n = parseFloat(m ? m[0] : clean);
        return Number.isNaN(n) ? 0 : n;
      };
      const selling = [];
      const original = [];
      const roots = [
        document.getElementById("ppd"),
        document.getElementById("corePrice_desktop"),
        document.getElementById("corePrice_feature_div"),
        document.getElementById("apex_desktop"),
        document.querySelector("[data-feature-name='corePrice']"),
      ].filter(Boolean);
      const scan = (root) => {
        if (!root) return;
        root.querySelectorAll(".a-price .a-offscreen, .a-price-whole").forEach((el) => {
          const text = (el.textContent || "").trim();
          const num = parsePrice(text);
          if (num <= 0) return;
          const isStrike = el.closest(".a-text-price") || el.closest("[data-a-strike='true']");
          if (isStrike) original.push(num);
          else selling.push(num);
        });
        root.querySelectorAll(".priceToPay .a-offscreen, .priceToPay .a-price-whole").forEach((el) => {
          const num = parsePrice((el.textContent || "").trim());
          if (num > 0) selling.push(num);
        });
        root.querySelectorAll(".apexPriceToPay").forEach((el) => {
          const num = parsePrice((el.textContent || "").trim());
          if (num > 0) selling.push(num);
        });
        root.querySelectorAll(".a-text-price .a-offscreen").forEach((el) => {
          const num = parsePrice((el.textContent || "").trim());
          if (num > 0) original.push(num);
        });
      };
      roots.forEach(scan);
      if (selling.length === 0 && original.length === 0) scan(document.getElementById("ppd") || document);
      // Explicitly find "M.R.P.: ₹999" / "MRP: 999" in price blocks (Amazon IN often shows MRP this way)
      const priceBlocks = document.querySelectorAll("#corePrice_feature_div, [data-feature-name='corePrice'], #corePrice_desktop, #ppd");
      priceBlocks.forEach((block) => {
        const text = (block.innerText || block.textContent || "").replace(/\s+/g, " ");
        const mrpMatch = text.match(/M\.?R\.?P\.?\s*:?\s*[₹$]?\s*([\d,]+\.?\d*)/i);
        if (mrpMatch) {
          const num = parsePrice(mrpMatch[1]);
          if (num > 0) original.push(num);
        }
      });
      return { sellingPrices: [...new Set(selling)], originalPrices: [...new Set(original)] };
    });

    let currentPriceNum = 0;
    let originalPriceNum = 0;
    if (sellingPrices && sellingPrices.length > 0) {
      currentPriceNum = chooseCurrentPrice(sellingPrices);
      if (originalPrices && originalPrices.length > 0) {
        originalPriceNum = chooseOriginalPrice(originalPrices, currentPriceNum);
      }
    }
    const currentPriceTexts = await Promise.all(
      SELECTORS.currentPrice.map(async (sel) => {
        try {
          const el = await page.$(sel);
          return el ? (await el.textContent()) || "" : "";
        } catch { return ""; }
      })
    );
    const originalPriceTexts = await Promise.all(
      SELECTORS.originalPrice.map(async (sel) => {
        try {
          const el = await page.$(sel);
          return el ? (await el.textContent()) || "" : "";
        } catch { return ""; }
      })
    );
    const fallbackCurrent = extractAllPricesFromStrings(...currentPriceTexts);
    const fallbackOriginal = extractAllPricesFromStrings(...originalPriceTexts);
    if (currentPriceNum === 0 && fallbackCurrent.length) currentPriceNum = chooseCurrentPrice(fallbackCurrent);
    if (originalPriceNum === 0 && fallbackOriginal.length) originalPriceNum = chooseOriginalPrice(fallbackOriginal, currentPriceNum);
    if (currentPriceNum > 0 && fallbackCurrent.length && Math.min(...fallbackCurrent) < currentPriceNum) {
      currentPriceNum = Math.min(...fallbackCurrent);
      if (fallbackOriginal.length) originalPriceNum = chooseOriginalPrice(fallbackOriginal, currentPriceNum);
    }

    // Only treat as EMI when ratio is ~2x (e.g. 3999 vs 7998). Don't override real deals (e.g. 698 vs 2999 = 4x+)
    const ratio = currentPriceNum > 0 && originalPriceNum > 0 ? originalPriceNum / currentPriceNum : 0;
    if (currentPriceNum > 0 && originalPriceNum > 0 && currentPriceNum < originalPriceNum * 0.5 && ratio <= 3) {
      console.log(
        `Playwright price validation: current ₹${currentPriceNum} < 50% of original ₹${originalPriceNum} (ratio ${ratio.toFixed(1)}), using original.`
      );
      currentPriceNum = originalPriceNum;
    }
    if (currentPriceNum === 0 && originalPriceNum > 0) currentPriceNum = originalPriceNum;
    if (originalPriceNum === 0 && currentPriceNum > 0) originalPriceNum = currentPriceNum;

    const availabilityText = await getFirstTextQuick(page, SELECTORS.availability);
    const outOfStock =
      /currently unavailable|out of stock|sold out|unavailable/i.test(availabilityText) &&
      !/in stock|available/i.test(availabilityText);

    // Image: prefer data-a-dynamic-image (JSON map of URLs), else src
    let imageUrl = "";
    const dynamicJson = await getFirstAttr(page, ["#landingImage", "#imgBlkFront"], "data-a-dynamic-image");
    if (dynamicJson) {
      try {
        const urls = Object.keys(JSON.parse(dynamicJson));
        imageUrl = urls[0]?.replace(/\._.*_\./, ".") || urls[0] || "";
      } catch {
        // ignore
      }
    }
    if (!imageUrl) {
      imageUrl = await getFirstAttr(page, SELECTORS.image, "src");
    }

    const currencyText = await getFirstTextQuick(page, SELECTORS.currency);
    const currency = extractCurrencyFromText(currencyText) || "₹";

    const discountText = await getFirstTextQuick(page, SELECTORS.discount);
    let discountRate = Number((discountText || "").replace(/[^\d.]/g, "")) || 0;

    // If original equals current but page shows a discount, derive original from discount %
    // Cap at 2x current so we don't show inflated values (e.g. 249 + 75% → 996 is often wrong; cap to 498)
    if (
      currentPriceNum > 0 &&
      originalPriceNum === currentPriceNum &&
      discountRate > 0 &&
      discountRate < 100
    ) {
      const derivedOriginal = Math.round(currentPriceNum / (1 - discountRate / 100));
      const capped = Math.min(derivedOriginal, Math.round(currentPriceNum * 2));
      if (capped > currentPriceNum) originalPriceNum = capped;
    }

    const categoryText = await getFirstTextQuick(page, SELECTORS.breadcrumb);
    const category = categoryText || "Electronics";

    const reviewsText = await getFirstTextQuick(page, SELECTORS.reviewsCount);
    const reviewsCount = parseInt((reviewsText || "").replace(/\D/g, ""), 10) || 0;

    const highestPriceNum = Math.max(originalPriceNum, currentPriceNum);

    const data = {
      url,
      currency,
      image: imageUrl,
      title: title || "Unknown Product",
      currentPrice: currentPriceNum,
      originalPrice: originalPriceNum,
      priceHistory: [{ price: currentPriceNum, date: new Date() }],
      discountRate,
      category,
      reviewsCount,
      isOutOfStock: outOfStock,
      lowestPrice: currentPriceNum,
      highestPrice: highestPriceNum,
      averagePrice: currentPriceNum,
    };

    return data;
  } catch (err) {
    console.error("Playwright Amazon scrape error:", err.message);
    return null;
  } finally {
    if (browser) await browser.close();
  }
}

module.exports = { scrapeAmazonWithPlaywright };
