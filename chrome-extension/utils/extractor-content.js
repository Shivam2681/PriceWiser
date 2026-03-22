/**
 * PriceWiser Extension - Content Script Extractor (NON-MODULE VERSION)
 * For use in content scripts (loaded as regular scripts, not modules)
 */

(function() {
  // Make functions available globally for content script access
  window.ExtractorFunctions = window.ExtractorFunctions || {};

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
          /\/p\/([a-z0-9]+)(\?|$)/,
          /\/([a-z0-9]{20,})(\?|$)/,
        ];
        
        for (const pattern of flipkartPatterns) {
          const match = url.match(pattern);
          if (match && match[1]) {
            return match[1];
          }
        }
        
        // Try to find PID from query params
        try {
          const urlObj = new URL(url);
          const pid = urlObj.searchParams.get('pid');
          if (pid) return pid;
        } catch (e) {}
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
      
      // Extract prices
      let currentPrice = null;
      let originalPrice = null;
      let discountPercentage = 0;

      // 1. Try to get price from common Amazon containers
      const priceContainers = [
        '#corePriceDisplay_desktop_feature_div',
        '#corePrice_feature_div',
        '#corePrice_desktop',
        '#apex_desktop',
        '#booksHeaderSection',
        '#ppd'
      ];

      let priceContainer = null;
      for (const selector of priceContainers) {
        const el = document.querySelector(selector);
        if (el) {
          priceContainer = el;
          break;
        }
      }

      if (priceContainer) {
        // Current price
        const priceSelectors = [
          '.apexPriceToPay .a-offscreen',
          '.a-price.a-text-price.a-size-medium.apexPriceToPay .a-offscreen',
          '.priceToPay .a-offscreen',
          '.a-price .a-offscreen',
          '.a-color-price',
          '.priceToPay'
        ];

        for (const selector of priceSelectors) {
          const el = priceContainer.querySelector(selector);
          if (el) {
            currentPrice = cleanPrice(el.textContent);
            if (currentPrice) break;
          }
        }

        // Original price
        const originalSelectors = [
          '.a-text-price .a-offscreen',
          '.basisPrice .a-offscreen',
          '.a-color-secondary.a-text-strike',
          '#priceblock_listprice'
        ];

        for (const selector of originalSelectors) {
          const el = priceContainer.querySelector(selector);
          if (el) {
            originalPrice = cleanPrice(el.textContent);
            if (originalPrice) break;
          }
        }

        // Discount percentage
        const discountSelectors = [
          '.savingPriceOverride',
          '.savingsPercentage',
          '.a-size-large.a-color-price.savingPriceOverride'
        ];

        for (const selector of discountSelectors) {
          const el = priceContainer.querySelector(selector);
          if (el && el.textContent) {
            const match = el.textContent.match(/(\d+)%/);
            if (match) {
              discountPercentage = parseInt(match[1]);
              break;
            }
          }
        }
      }

      // 2. Global Fallbacks if still missing currentPrice
      if (!currentPrice) {
        const globalFallbacks = [
          '.a-price-whole',
          '#priceblock_ourprice',
          '#priceblock_dealprice',
          '.priceToPay .a-offscreen',
          '.a-offscreen' // Last resort: check all offscreens
        ];

        for (const selector of globalFallbacks) {
          const elements = document.querySelectorAll(selector);
          for (const el of elements) {
            const val = cleanPrice(el.textContent);
            if (val && val > 0) {
              currentPrice = val;
              break;
            }
          }
          if (currentPrice) break;
        }
      }

      if (!originalPrice) {
        const fallbackOriginalSelectors = [
          '.a-price.a-text-price .a-offscreen',
          '#priceblock_listprice',
          '.a-color-secondary.a-text-strike',
        ];
        for (const selector of fallbackOriginalSelectors) {
          const el = document.querySelector(selector);
          if (el) {
            originalPrice = cleanPrice(el.textContent);
            if (originalPrice) break;
          }
        }
      }
      
      // Calculate discount if missing
      if (discountPercentage === 0 && currentPrice && originalPrice && originalPrice > currentPrice) {
        discountPercentage = Math.round(((originalPrice - currentPrice) / originalPrice) * 100);
      }

      // Final sanity check: if currentPrice > originalPrice, they might be swapped
      if (currentPrice && originalPrice && currentPrice > originalPrice) {
        [currentPrice, originalPrice] = [originalPrice, currentPrice];
        discountPercentage = Math.round(((originalPrice - currentPrice) / originalPrice) * 100);
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
        price: currentPrice || 0,
        originalPrice: originalPrice || currentPrice || 0,
        discountPercentage: discountPercentage || 0,
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
        'h1.VU-Z7G', // New Flipkart class
        'h1._9AyC3b',
        '._35KyD6',
        '.yRaZ8j',
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
        // Try to find the h1 that is inside a div with certain properties
        const h1s = document.querySelectorAll('h1');
        for (const h1 of h1s) {
          if (h1.textContent.trim().length > 10) {
            title = h1.textContent.trim().replace(/\s+/g, ' ');
            break;
          }
        }
      }
      
      if (!title) {
        console.warn('[Extractor] Could not find title');
        return null;
      }
      
      // Extract current price
      let price = null;
      const priceSelectors = [
        '.Nx9Z9j', // New Flipkart class
        '._30jeq3',
        '._16JkiX',
        '[data-testid="price"]',
        '.dyC4bf',
        '.cErdHt',
        'div[class*="price"]',
      ];
      
      for (const selector of priceSelectors) {
        const elements = document.querySelectorAll(selector);
        for (const element of elements) {
          const priceText = element.textContent;
          if (priceText && (priceText.includes('₹') || priceText.includes('Rs.'))) {
            price = cleanPrice(priceText);
            if (price && price > 0) {
              break;
            }
          }
        }
        if (price) break;
      }

      // Extract original price
      let originalPrice = null;
      const originalPriceSelectors = [
        '.y9Y9ak',
        '._27M-R_ ._3I9_ca',
        '._3I9_ca',
        '._16JkiX ._3I9_ca',
        'div[class*="strike"]',
      ];

      for (const selector of originalPriceSelectors) {
        const element = document.querySelector(selector);
        if (element) {
          const priceText = element.textContent;
          originalPrice = cleanPrice(priceText);
          if (originalPrice && originalPrice > 0) break;
        }
      }

      // Extract discount percentage
      let discountPercentage = 0;
      const discountSelectors = [
        '.Uk_O3W',
        '._3Ay6u5',
        '._1V76Yf span',
        '.VGSR9_ span',
        'div[class*="discount"] span',
      ];

      for (const selector of discountSelectors) {
        const element = document.querySelector(selector);
        if (element && element.textContent) {
          const match = element.textContent.match(/(\d+)%/);
          if (match && match[1]) {
            discountPercentage = parseInt(match[1]);
            break;
          }
        }
      }

      // Calculate discount if we have prices but no explicit percentage
      if (discountPercentage === 0 && price && originalPrice && originalPrice > price) {
        discountPercentage = Math.round(((originalPrice - price) / originalPrice) * 100);
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
        originalPrice: originalPrice || price || 0,
        discountPercentage: discountPercentage || 0,
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
})();
