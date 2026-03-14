"use server"

const axios = require('axios');
const cheerio = require('cheerio');
const { extractCurrency, extractPrice } = require('../utils');

function isValidAmazonURL(url) {
  if (!url) return false;
  
  let targetUrl = url;
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    targetUrl = `https://${url}`;
  }

  try {
    const parsedURL = new URL(targetUrl);
    const hostname = parsedURL.hostname;
    return hostname.includes('amazon.com') || 
           hostname.includes('amazon.in') || 
           hostname.includes('amazon.co.uk') ||
           hostname.includes('amazon.ca') ||
           hostname.includes('amzn.in') ||
           hostname.includes('amzn.to');
  } catch (error) {
    return false;
  }
}

export async function scrapeAmazonProduct(url) {
    if(!url) return;

    // BrightData proxy configuration
    const username = String(process.env.BRIGHT_DATA_USERNAME);
    const password = String(process.env.BRIGHT_DATA_PASSWORD);
    const port = 22225;
    
    const maxRetries = 2;
    let retryCount = 0;

    while (retryCount <= maxRetries) {
      const session_id = (1000000 * Math.random()) | 0;
    
      const options = {
        auth: {
          username: `${username}-session-${session_id}`,
          password,
        },
        host: 'brd.superproxy.io',
        port,
        rejectUnauthorized: false,
      }

      try{
          const response = await axios.get(url, { ...options, timeout: 20000 }); // 20s timeout for each scrape
          const $ = cheerio.load(response.data);

        const title = $('#productTitle').text().trim();
        
        // Try to get the main price first - prioritize core price elements
        let currentPrice = extractPrice(
            $('#priceblock_dealprice'),
            $('#priceblock_ourprice'),
            $('.priceToPay span.a-price-whole'),
            $('.a-price.a-text-price.a-size-medium.a-color-price span.a-offscreen'),
            $('.a-size-base.a-color-price'),
        );
        
        // Get original/list price
        const originalPrice = extractPrice(
            $('#listPrice'),
            $('#priceblock_ourprice'),
            $('.a-price.a-text-price span.a-offscreen'),
            $('.a-size-base.a-color-price')
        );
        
        // Validate: if scraped current price is suspiciously low compared to original price,
        // it might be an EMI down payment or accessory price - use original price instead
        // This handles cases where scraper picks up ₹3,999 EMI instead of ₹2,15,627 actual price
        let currentPriceNum = Number(currentPrice) || 0;
        let originalPriceNum = Number(originalPrice) || 0;
        
        if (currentPriceNum > 0 && originalPriceNum > 0) {
          // If current price is less than 50% of original, it's likely wrong
          // (A 50%+ discount is rare and usually indicates wrong price extraction)
          if (currentPriceNum < (originalPriceNum * 0.5)) {
            console.log(`Price validation: Current price ₹${currentPriceNum} is less than 50% of original ₹${originalPriceNum}. Likely EMI/accessory price. Using original price.`);
            currentPrice = originalPrice;
            currentPriceNum = originalPriceNum;
          }
        }

        const outOfStock = $('#availability span').text().trim().toLowerCase() === 'currently unavailable';

        const images = 
               $('#imgBlkFront').attr('data-a-dynamic-image') || 
               $('#landingImage').attr('data-a-dynamic-image') ||
              '{}'
    
        const imageUrls = Object.keys(JSON.parse(images));
        const highResImageUrl = imageUrls[0]?.replace(/\._.*_\./, '.') || imageUrls[0];
    
        const currency = extractCurrency($('.a-price-symbol'))
        const discountRate = $('.savingsPercentage').text().replace(/[-%]/g, "");
        
        // Extract category from breadcrumbs
        const category = $('#wayfinding-breadcrumbs_feature_div ul li:first-child a, #wayfinding-breadcrumbs_feature_div ul li:first-child span')
          .first().text().trim() || 
          $('.a-breadcrumb li:nth-child(2) a, .a-breadcrumb li:nth-child(2) span').first().text().trim() ||
          'Electronics';
        
        // Extract reviews count
        const reviewsText = $('#acrCustomerReviewText, [data-hook="total-review-count"]').first().text().trim();
        const reviewsCount = parseInt(reviewsText.replace(/[^0-9]/g, '')) || 0;
    
        // Construct data object with scraped information
        currentPriceNum = Number(currentPrice) || Number(originalPrice);
        originalPriceNum = Number(originalPrice) || Number(currentPrice);
        
        // For highest price, use original price (MRP) if available and higher than current
        const highestPriceNum = originalPriceNum > currentPriceNum ? originalPriceNum : currentPriceNum;
        
        const data = {
          url,
          currency: currency || '₹',
          image: highResImageUrl,
          title,
          currentPrice: currentPriceNum,
          originalPrice: originalPriceNum,
          priceHistory: [
            { price: currentPriceNum, date: new Date() }
          ],
          discountRate: Number(discountRate),
          category: category,
          reviewsCount: reviewsCount,
          isOutOfStock: outOfStock,
          lowestPrice: currentPriceNum,
          highestPrice: highestPriceNum,
          averagePrice: currentPriceNum,
        }

        return data;

      }catch (error) {
        console.error(`Amazon scraping error (Attempt ${retryCount + 1}):`, error.message);
        
        // If it's a 500 error or a timeout, try again
        if (retryCount < maxRetries) {
          retryCount++;
          console.log(`Retrying scraping for: ${url}...`);
          // Wait 2 seconds before retry
          await new Promise(resolve => setTimeout(resolve, 2000));
          continue;
        }
        
        return null;
      }
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


