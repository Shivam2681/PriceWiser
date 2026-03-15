"use server";

const axios = require("axios");
const cheerio = require("cheerio");
const { extractCurrency, extractPrice } = require("../utils");
const { scrapeAmazonWithPlaywright } = require("./playwrightAmazon");

function isValidAmazonURL(url) {
  if (!url) return false;

  let targetUrl = url;
  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    targetUrl = `https://${url}`;
  }

  try {
    const parsedURL = new URL(targetUrl);
    const hostname = parsedURL.hostname;
    return (
      hostname.includes("amazon.com") ||
      hostname.includes("amazon.in") ||
      hostname.includes("amazon.co.uk") ||
      hostname.includes("amazon.ca") ||
      hostname.includes("amzn.in") ||
      hostname.includes("amzn.to")
    );
  } catch (error) {
    return false;
  }
}

/** Fallback: scrape with axios + cheerio (e.g. when Playwright fails or no browser). */
async function scrapeAmazonWithAxios(url) {
  const username = String(process.env.BRIGHT_DATA_USERNAME || "");
  const password = String(process.env.BRIGHT_DATA_PASSWORD || "");
  const port = 22225;

  const options = {
    timeout: 20000,
    ...(username && password && {
      auth: {
        username: `${username}-session-${(1000000 * Math.random()) | 0}`,
        password,
      },
      host: "brd.superproxy.io",
      port,
      rejectUnauthorized: false,
    }),
  };

  const response = await axios.get(url, options);
  const $ = cheerio.load(response.data);

  const title = $("#productTitle").text().trim();

  // Selling price — include deal/apex so small products (charger, face wash) get deal price (e.g. ₹698)
  const currentSelectors = [
    "span.apexPriceToPay",
    "#corePrice_desktop .apexPriceToPay",
    "#corePrice_desktop .a-offscreen",
    "#apex_desktop .a-price .a-offscreen",
    ".priceToPay span.a-price-whole",
    ".priceToPay span.a-offscreen",
    "#priceblock_dealprice",
    "#price_inside_buybox",
    "#priceblock_ourprice",
    "#corePrice_feature_div .a-price:not(.a-text-price) .a-offscreen",
    "#corePrice_feature_div .a-price .a-offscreen",
    ".a-price[data-a-color='price'] .a-offscreen",
    "[data-feature-name='corePrice'] .a-price-whole",
    "[data-feature-name='corePrice'] .a-offscreen",
  ];
  const allCurrentNums = [];
  for (const sel of currentSelectors) {
    const text = $(sel).first().text().trim().replace(/[^\d.]/g, "") || "";
    const match = text.match(/\d+\.\d{2}/)?.[0] || text;
    const n = parseFloat(match);
    if (!Number.isNaN(n) && n > 0) allCurrentNums.push(n);
  }
  $("#corePrice_feature_div .a-price:not(.a-text-price) .a-offscreen").each((_, el) => {
    const text = $(el).text().trim().replace(/[^\d.]/g, "") || "";
    const match = text.match(/\d+\.\d{2}/)?.[0] || text;
    const n = parseFloat(match);
    if (!Number.isNaN(n) && n > 0) allCurrentNums.push(n);
  });
  $("#corePrice_desktop .a-offscreen, #corePrice_desktop .apexPriceToPay").each((_, el) => {
    const text = $(el).text().trim().replace(/[^\d.]/g, "") || "";
    const match = text.match(/\d+\.\d{2}/)?.[0] || text;
    const n = parseFloat(match);
    if (!Number.isNaN(n) && n > 0) allCurrentNums.push(n);
  });
  let currentPriceNum = allCurrentNums.length > 0 ? Math.min(...allCurrentNums) : 0;

  // Collect all candidate original prices (M.R.P.); use min of those >= current so we get single-unit MRP (₹399) not bundle (₹3,996)
  const allOriginalNums = [];
  const singleSelectors = [
    "#listPrice .a-offscreen",
    "#corePrice_feature_div .a-text-price .a-offscreen",
  ];
  for (const sel of singleSelectors) {
    const text = $(sel).first().text().trim().replace(/[^\d.]/g, "") || "";
    const match = text.match(/\d+\.\d{2}/)?.[0] || text;
    const n = parseFloat(match);
    if (!Number.isNaN(n) && n > 0) allOriginalNums.push(n);
  }
  $(".a-price.a-text-price span.a-offscreen").each((_, el) => {
    const text = $(el).text().trim().replace(/[^\d.]/g, "") || "";
    const match = text.match(/\d+\.\d{2}/)?.[0] || text;
    const n = parseFloat(match);
    if (!Number.isNaN(n) && n > 0) allOriginalNums.push(n);
  });
  const mrpBlocks = $("#corePrice_feature_div, [data-feature-name='corePrice'], #ppd");
  mrpBlocks.each((_, el) => {
    const text = (($(el).text() || "").replace(/\s+/g, " ") || "");
    const mrpMatch = text.match(/M\.?R\.?P\.?\s*:?\s*[₹$]?\s*([\d,]+\.?\d*)/i);
    if (mrpMatch) {
      const n = parseFloat(mrpMatch[1].replace(/[^\d.]/g, ""));
      if (!Number.isNaN(n) && n > 0) allOriginalNums.push(n);
    }
  });
  const validOriginal = allOriginalNums.filter((n) => n >= currentPriceNum);
  let originalPriceNum = validOriginal.length > 0 ? Math.min(...validOriginal) : currentPriceNum;

  const ratio = currentPriceNum > 0 && originalPriceNum > 0 ? originalPriceNum / currentPriceNum : 0;
  if (currentPriceNum > 0 && originalPriceNum > 0 && currentPriceNum < originalPriceNum * 0.5 && ratio <= 3) {
    currentPriceNum = originalPriceNum;
  }

  const outOfStock =
    $("#availability span").text().trim().toLowerCase() === "currently unavailable";
  const images =
    $("#imgBlkFront").attr("data-a-dynamic-image") ||
    $("#landingImage").attr("data-a-dynamic-image") ||
    "{}";
  const imageUrls = Object.keys(JSON.parse(images));
  const highResImageUrl = imageUrls[0]?.replace(/\._.*_\./, ".") || imageUrls[0];
  const currency = extractCurrency($(".a-price-symbol")) || "₹";
  const savingsText = $(".savingsPercentage").text().replace(/[-%]/g, "") || "0";
  const discountRate = Number(savingsText);

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

  const breadcrumbSel =
    "#wayfinding-breadcrumbs_feature_div ul li:first-child a, #wayfinding-breadcrumbs_feature_div ul li:first-child span";
  const category =
    $(breadcrumbSel).first().text().trim() ||
    $(".a-breadcrumb li:nth-child(2) a, .a-breadcrumb li:nth-child(2) span").first().text().trim() ||
    "Electronics";
  const reviewsText = $("#acrCustomerReviewText, [data-hook='total-review-count']")
    .first()
    .text()
    .trim();
  const reviewsCount = parseInt(reviewsText.replace(/[^0-9]/g, ""), 10) || 0;
  currentPriceNum = currentPriceNum || originalPriceNum;
  originalPriceNum = originalPriceNum || currentPriceNum;
  const highestPriceNum = Math.max(originalPriceNum, currentPriceNum);

  return {
    url,
    currency,
    image: highResImageUrl,
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
}

export async function scrapeAmazonProduct(url) {
  if (!url) return undefined;

  const maxRetries = 2;
  const usePlaywright = true; // primary: real browser for accuracy

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      if (usePlaywright) {
        const proxy =
          process.env.BRIGHT_DATA_USERNAME && process.env.BRIGHT_DATA_PASSWORD
            ? {
                server: "http://brd.superproxy.io:22225",
                username: `${process.env.BRIGHT_DATA_USERNAME}-session-${(1000000 * Math.random()) | 0}`,
                password: process.env.BRIGHT_DATA_PASSWORD,
              }
            : undefined;
        const result = await scrapeAmazonWithPlaywright(url, { proxy });
        if (result) return result;
      }
    } catch (err) {
      console.error(`Amazon Playwright attempt ${attempt + 1}:`, err.message);
    }

    if (attempt < maxRetries) {
      await new Promise((r) => setTimeout(r, 2000));
    }
  }

  // Fallback to axios + cheerio
  try {
    return await scrapeAmazonWithAxios(url);
  } catch (error) {
    console.error("Amazon scraping (axios fallback) error:", error.message);
    return null;
  }
}

export async function scrapeProduct(url) {
  if (!url) return null;
  
  let targetUrl = url;
  
  // Handle Amazon short URLs (amzn.in or amzn.to)
  if (url.includes('amzn.in') || url.includes('amzn.to')) {
    try {
      console.log('Resolving short URL:', url);
      const response = await axios.get(url, { 
        maxRedirects: 5, 
        timeout: 10000,
        // Don't use proxy for resolution
      });
      targetUrl = response.request.res.responseUrl || url;
      console.log('Resolved to:', targetUrl);
    } catch (error) {
      console.error('Error resolving short URL:', error.message);
      // Continue with original URL if resolution fails
    }
  }

  if (!isValidAmazonURL(targetUrl)) {
    console.error('Invalid URL. Only Amazon URLs are supported.');
    throw new Error('Only Amazon product URLs are supported.');
  }
  
  console.log('Scraping Amazon URL:', targetUrl);
  const result = await scrapeAmazonProduct(targetUrl);
  console.log('Amazon scraper result:', result ? 'Success' : 'Failed');
  return result;
}


