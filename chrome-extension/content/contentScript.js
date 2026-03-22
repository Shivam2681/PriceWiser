/**
 * PriceWiser Extension - Content Script
 * Runs on Amazon and Flipkart product pages to extract and sync data
 */

(function() {
  // Prevent multiple executions if already initialized in this context
  if (window.__PRICEWISER_INITIALIZED__) {
    console.log('[ContentScript] Already initialized, skipping...');
    return;
  }
  window.__PRICEWISER_INITIALIZED__ = true;

  console.log('[ContentScript] Starting content script...');
  console.log('[ContentScript] window.ExtractorFunctions:', typeof window.ExtractorFunctions);
  console.log('[ContentScript] window.PWStorage:', typeof window.PWStorage);

  // Get functions from global window object (loaded by utils scripts)
  const { detectPlatform, isValidProductPage, extractAmazonData, extractFlipkartData } = window.ExtractorFunctions || {};
  const { getAuthToken } = window.PWStorage || {};

  if (!detectPlatform || !getAuthToken) {
    console.error('[ContentScript] ERROR: Dependencies not loaded!');
    console.error('[ContentScript] detectPlatform:', detectPlatform);
    console.error('[ContentScript] getAuthToken:', getAuthToken);
    return; // Exit silently instead of throwing if dependencies aren't ready
  }

  console.log('[ContentScript] ✓ All dependencies loaded successfully');
  
  // Prevent multiple extractions for the same page session
  let hasRun = false;
  const DEBOUNCE_DELAY = 2000; // 2 seconds
  let debounceTimer = null;
  let didNotSyncBecauseNotLoggedIn = false; // Track if we bailed due to no auth

  /**
   * Show visual feedback to user
   * @param {string} message - Message to show
   * @param {'success' | 'error' | 'info'} type - Toast type
   */
  function showToast(message, type = 'info') {
    // Remove existing toast if any
    const existingToast = document.getElementById('pricewiser-toast');
    if (existingToast) {
      existingToast.remove();
    }
    
    // Create toast container
    const toast = document.createElement('div');
    toast.id = 'pricewiser-toast';
    toast.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 16px 24px;
      border-radius: 8px;
      background: ${type === 'success' ? '#10B981' : type === 'error' ? '#EF4444' : '#3B82F6'};
      color: white;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 14px;
      font-weight: 500;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
      z-index: 999999;
      animation: slideIn 0.3s ease-out;
    `;
    toast.textContent = message;
    
    document.body.appendChild(toast);
    
    // Auto-remove after 3 seconds
    setTimeout(() => {
      toast.style.animation = 'slideOut 0.3s ease-in';
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }

  /**
   * Highlight price element briefly
   */
  function highlightPriceElement() {
    const platform = detectPlatform();
    let priceElement = null;
    
    if (platform === 'amazon') {
      priceElement = document.querySelector('.a-price-whole, #priceblock_ourprice, .a-price .a-offscreen');
    } else if (platform === 'flipkart') {
      priceElement = document.querySelector('._30jeq3, ._16JkiX');
    }
    
    if (priceElement) {
      const originalStyle = priceElement.style.cssText;
      priceElement.style.transition = 'all 0.3s ease';
      priceElement.style.background = 'rgba(59, 130, 246, 0.2)';
      priceElement.style.borderRadius = '4px';
      priceElement.style.padding = '4px 8px';
      
      setTimeout(() => {
        priceElement.style.cssText = originalStyle;
      }, 2000);
    }
  }

  /**
   * Extract product data based on platform
   * @returns {Object|null}
   */
  function extractProductData() {
    const platform = detectPlatform();
    
    if (!platform) {
      console.log('[ContentScript] Not on supported platform');
      return null;
    }
    
    console.log(`[ContentScript] Detected platform: ${platform}`);
    
    if (platform === 'amazon') {
      return extractAmazonData();
    } else if (platform === 'flipkart') {
      return extractFlipkartData();
    }
    
    return null;
  }

  /**
   * Send data to background script for syncing
   * @param {Object} productData - Product data
   */
  async function syncProductData(productData) {
    // This function is now deprecated in favor of popup-driven sync
    console.log('[ContentScript] syncProductData is now handled by the popup');
  }

  /**
   * Extract product data
   */
  function handleManualExtraction() {
    // Validate product page
    if (!isValidProductPage()) {
      console.log('[ContentScript] Not a valid product page');
      return null;
    }
    
    try {
      // Extract product data
      const productData = extractProductData();
      
      if (!productData) {
        console.warn('[ContentScript] Failed to extract product data');
        return null;
      }

      return productData;
    } catch (error) {
      console.error('[ContentScript] Extraction error:', error);
      return null;
    }
  }

  /**
   * Initialize content script
   */
  function init() {
    console.log('[ContentScript] PriceWiser extension initialized');
    
    // Listen for messages from popup or background
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      console.log('[ContentScript] Received message:', request.action);
      
      if (request.action === 'EXTRACT_NOW' || request.action === 'GET_PAGE_STATUS') {
        // Always extract fresh data for the popup
        const productData = handleManualExtraction();
        
        const platform = detectPlatform();
        const isValid = isValidProductPage();
        
        sendResponse({ 
          platform, 
          isValid,
          productData 
        });
      }
      
      return true; // Keep channel open for async response
    });
  }

  // Start the extension
  init();
})();
