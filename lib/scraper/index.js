"use server"

const axios = require('axios');
const cheerio = require('cheerio');
const { extractCurrency, extractPrice } = require('../utils');

function isValidAmazonURL(url) {
  try {
    const parsedURL = new URL(url);
    const hostname = parsedURL.hostname;
    return hostname.includes('amazon.com') || 
           hostname.includes('amazon.in') || 
           hostname.includes('amazon.co.uk') ||
           hostname.includes('amazon.ca');
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
        const response = await axios.get(url, options);
        const $ = cheerio.load(response.data);

        const title = $('#productTitle').text().trim();
        const currentPrice = extractPrice(
            $('.priceToPay span.a-price-whole'),
            $('.a.size.base.a-color-price'),
            $('.a-button-selected .a-color-base'),
        );

        const originalPrice = extractPrice(
            $('#priceblock_ourprice'),
            $('.a-price.a-text-price span.a-offscreen'),
            $('#listPrice'),
            $('#priceblock_dealprice'),
            $('.a-size-base.a-color-price')
        );

        const outOfStock = $('#availability span').text().trim().toLowerCase() === 'currently unavailable';

        const images = 
               $('#imgBlkFront').attr('data-a-dynamic-image') || 
               $('#landingImage').attr('data-a-dynamic-image') ||
              '{}'
    
        const imageUrls = Object.keys(JSON.parse(images));
    
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
        
        // Extract star rating
        const starsText = $('#acrPopover .a-icon-alt, [data-hook="average-star-rating"] .a-icon-alt').first().text().trim();
        const stars = parseFloat(starsText.split(' ')[0]) || 4.5;
    
        // Construct data object with scraped information
        const currentPriceNum = Number(currentPrice) || Number(originalPrice);
        const originalPriceNum = Number(originalPrice) || Number(currentPrice);
        
        // For highest price, use original price (MRP) if available and higher than current
        const highestPriceNum = originalPriceNum > currentPriceNum ? originalPriceNum : currentPriceNum;
        
        const data = {
          url,
          currency: currency || '₹',
          image: imageUrls[0],
          title,
          currentPrice: currentPriceNum,
          originalPrice: originalPriceNum,
          priceHistory: [
            { price: currentPriceNum, date: new Date() }
          ],
          discountRate: Number(discountRate),
          category: category,
          reviewsCount: reviewsCount,
          stars: stars,
          isOutOfStock: outOfStock,
          lowestPrice: currentPriceNum,
          highestPrice: highestPriceNum,
          averagePrice: currentPriceNum,
        }

        return data;

    }catch (error) {
      console.error('Amazon scraping error:', error);
      return null;
    }
}

export async function scrapeProduct(url) {
  if (!isValidAmazonURL(url)) {
    console.error('Invalid URL. Only Amazon URLs are supported.');
    throw new Error('Only Amazon product URLs are supported.');
  }
  
  console.log('Scraping Amazon URL:', url);
  const result = await scrapeAmazonProduct(url);
  console.log('Amazon scraper result:', result ? 'Success' : 'Failed');
  return result;
}

