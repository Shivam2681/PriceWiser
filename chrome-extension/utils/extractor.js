/**
 * PriceWiser Extension - Product Data Extractor
 * Robust extraction for Amazon and Flipkart with multiple fallback selectors
 */

// Expose functions globally for content script access
window.ExtractorFunctions = {};

/**
 * Clean price string to number
 * @param {string} priceStr - Price string
 * @returns {number|null}
 */
function cleanPrice(priceStr) {
  if (!priceStr) return null;
  
  try {
    // Remove currency symbols, commas, spaces
    const cleaned = priceStr
      .replace(/[₹$,£€,¥]/g, '')
      .replace(/,/g, '')
      .replace(/\s+/g, '')
      .trim();
    
    // Parse float
    const price = parseFloat(cleaned);
    
    // Validate price
    if (isNaN(price) || price <= 0) {
      return null;
    }
    
    return price;
  } catch (error) {
    console.error('[Extractor] Price cleaning error:', error);
    return null;
  }
}

/**
 * Extract product ID from URL
 * @param {string} url - Product URL
 * @param {'amazon' | 'flipkart'} source - Source platform
 * @returns {string|null}
 */
function extractProductId(url, source) {
  try {
    if (source === 'amazon') {
      // Amazon ASIN patterns
      const asinPatterns = [
        /\/dp\/([A-Z0-9]{10})/,
        /\/gp\/product\/([A-Z0-9]{10})/,
        /\/exec\/obidos\/ASIN\/([A-Z0-9]{10})/,
        /\/o\/ASIN\/([A-Z0-9]{10})/,
        /\/detail\/([A-Z0-9]{10})/,
      ];
      
      for (const pattern of asinPatterns) {
        const match = url.match(pattern);
        if (match && match[1]) {
          return match[1];
        }
      }
      
      // Try to get from product details meta tag
      const asinMeta = document.querySelector('meta[name="asin"]');
      if (asinMeta) {
        return asinMeta.getAttribute('content');
      }
    } else if (source === 'flipkart') {
      // Flipkart product ID patterns
      const flipkartPatterns = [
        /pid=([A-Za-z0-9]+)/,
        /\/p\/([a-z0-9]+)\?/,
        /\/([a-z0-9]{20,})\?/,
      ];
      
      for (const pattern of flipkartPatterns) {
        const match = url.match(pattern);
        if (match && match[1]) {
          return match[1];
        }
      }
    }
    
    return null;
  } catch (error) {
    console.error('[Extractor] Product ID extraction error:', error);
    return null;
  }
}

/**
 * Extract Amazon product data with robust selectors
 * @returns {Object|null}
 */
function extractAmazonData() {
  try {
    console.log('[Extractor] Attempting Amazon extraction...');
    
    // Extract title
    let title = null;
    const titleSelectors = [
      '#productTitle',
      '#title_feature_div span.a-size-large',
      '.product-title',
      'h1.a-size-large',
      '#ebooksProductTitle',
      '#kindle-label-content-title',
    ];
    
    for (const selector of titleSelectors) {
      const element = document.querySelector(selector);
      if (element && element.textContent.trim()) {
        title = element.textContent.trim().replace(/\s+/g, ' ');
        break;
      }
    }
    
    if (!title) {
      console.warn('[Extractor] Could not find title');
      return null;
    }
    
    // Extract price
    let price = null;
    const priceSelectors = [
      '.a-price-whole',
      '#priceblock_ourprice',
      '#priceblock_dealprice',
      '.a-price .a-offscreen',
      '#corePriceDisplay_desktop_feature_div .a-price .a-offscreen',
      '#newBuyBox_price .a-offscreen',
      '#twister-plus-price-data-price',
      '#kindle-price .a-offscreen',
      '.a-color-price',
      '#price_inside_buybox',
      '#ppd .a-color-price',
      '.apexPriceToPay .a-offscreen',
    ];
    
    for (const selector of priceSelectors) {
      const element = document.querySelector(selector);
      if (element) {
        const priceText = element.textContent || element.getAttribute('aria-label');
        price = cleanPrice(priceText);
        if (price && price > 0) {
          break;
        }
      }
    }
    
    // Get current URL
    const url = window.location.href;
    
    // Extract product ID (ASIN)
    const productId = extractProductId(url, 'amazon');
    
    if (!productId) {
      console.warn('[Extractor] Could not find product ID');
      return null;
    }
    
    const productData = {
      title,
      price: price || 0,
      url,
      productId,
      source: 'amazon',
      timestamp: new Date().toISOString(),
    };
    
    console.log('[Extractor] Amazon data extracted successfully:', productData);
    return productData;
  } catch (error) {
    console.error('[Extractor] Amazon extraction error:', error);
    return null;
  }
}

/**
 * Extract Flipkart product data with robust selectors
 * @returns {Object|null}
 */
function extractFlipkartData() {
  try {
    console.log('[Extractor] Attempting Flipkart extraction...');
    
    // Extract title
    let title = null;
    const titleSelectors = [
      '._35KyD6',
      '.yRaZ8j',
      'h1._9AyC3b',
      '[data-testid="title"]',
      '.dfsgdv',
    ];
    
    for (const selector of titleSelectors) {
      const element = document.querySelector(selector);
      if (element && element.textContent.trim()) {
        title = element.textContent.trim().replace(/\s+/g, ' ');
        break;
      }
    }
    
    if (!title) {
      console.warn('[Extractor] Could not find title');
      return null;
    }
    
    // Extract price
    let price = null;
    const priceSelectors = [
      '._30jeq3',
      '._16JkiX',
      '[data-testid="price"]',
      '.dyC4bf',
      '.cErdHt',
    ];
    
    for (const selector of priceSelectors) {
      const element = document.querySelector(selector);
      if (element) {
        const priceText = element.textContent;
        price = cleanPrice(priceText);
        if (price && price > 0) {
          break;
        }
      }
    }
    
    // Get current URL
    const url = window.location.href;
    
    // Extract product ID
    const productId = extractProductId(url, 'flipkart');
    
    if (!productId) {
      console.warn('[Extractor] Could not find product ID');
      return null;
    }
    
    const productData = {
      title,
      price: price || 0,
      url,
      productId,
      source: 'flipkart',
      timestamp: new Date().toISOString(),
    };
    
    console.log('[Extractor] Flipkart data extracted successfully:', productData);
    return productData;
  } catch (error) {
    console.error('[Extractor] Flipkart extraction error:', error);
    return null;
  }
}

/**
 * Detect platform from URL
 * @returns {'amazon' | 'flipkart' | null}
 */
function detectPlatform() {
  const hostname = window.location.hostname.toLowerCase();
  
  if (hostname.includes('amazon')) {
    return 'amazon';
  } else if (hostname.includes('flipkart')) {
    return 'flipkart';
  }
  
  return null;
}

/**
 * Check if current page is a valid product page
 * @returns {boolean}
 */
function isValidProductPage() {
  const platform = detectPlatform();
  const url = window.location.href;
  
  if (!platform) {
    return false;
  }
  
  if (platform === 'amazon') {
    return url.includes('/dp/') || 
           url.includes('/gp/product/') ||
           url.includes('/exec/obidos/ASIN/');
  }
  
  if (platform === 'flipkart') {
    return url.includes('/p/') || url.includes('pid=');
  }
  
  return false;
}

// Export functions to global window object for content script
window.ExtractorFunctions = {
  detectPlatform,
  isValidProductPage,
  extractAmazonData,
  extractFlipkartData,
};

// Also export for ES6 module usage (if needed by other modules)
export {
  detectPlatform,
  isValidProductPage,
  extractAmazonData,
  extractFlipkartData,
};
