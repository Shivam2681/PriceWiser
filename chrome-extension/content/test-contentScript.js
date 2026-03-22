/**
 * SIMPLE TEST - Just to verify content script loads and extracts data
 * NO AUTHENTICATION REQUIRED
 */

console.log('🎯 CONTENT SCRIPT LOADED SUCCESSFULLY!');
console.log('Current URL:', window.location.href);

// Check if we're on Amazon or Flipkart
const hostname = window.location.hostname.toLowerCase();
let platform = null;

if (hostname.includes('amazon')) {
  platform = 'amazon';
  console.log('✅ On Amazon');
} else if (hostname.includes('flipkart')) {
  platform = 'flipkart';
  console.log('✅ On Flipkart');
} else {
  console.log('ℹ️ Not on supported site');
}

// Track state for popup
let hasRun = true; // Mark as executed
let didNotSyncBecauseNotLoggedIn = false;
let extractedProductData = null; // Store extracted data

if (platform) {
  // Try to extract product title
  let title = null;
  let price = null;
  
  if (platform === 'amazon') {
    const titleEl = document.querySelector('#productTitle');
    if (titleEl) {
      title = titleEl.textContent.trim().replace(/\s+/g, ' ');
    }
    
    // Try to extract price
    const priceEl = document.querySelector('.a-price-whole, #priceblock_ourprice, .a-price .a-offscreen');
    if (priceEl) {
      const priceText = priceEl.textContent || priceEl.getAttribute('aria-label');
      price = priceText ? parseFloat(priceText.replace(/[₹$,]/g, '').trim()) : null;
    }
  } else if (platform === 'flipkart') {
    const titleEl = document.querySelector('._35KyD6, .yRaZ8j');
    if (titleEl) {
      title = titleEl.textContent.trim();
    }
    
    const priceEl = document.querySelector('._30jeq3, ._16JkiX');
    if (priceEl) {
      const priceText = priceEl.textContent;
      price = priceText ? parseFloat(priceText.replace(/[₹,]/g, '').trim()) : null;
    }
  }
  
  // Store extracted data
  extractedProductData = {
    title,
    price: price || 0,
    url: window.location.href,
    productId: window.location.href.split('/dp/')[1]?.split('?')[0] || 'unknown',
    source: platform,
    timestamp: new Date().toISOString(),
  };
  
  console.log('📦 Product Data:', extractedProductData);
  
  // Show visual indicator
  const indicator = document.createElement('div');
  indicator.style.cssText = `
    position: fixed;
    top: 10px;
    left: 50%;
    transform: translateX(-50%);
    background: #10B981;
    color: white;
    padding: 12px 24px;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 600;
    z-index: 999999;
    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
  `;
  indicator.textContent = `✓ PriceWiser Active - ${platform.toUpperCase()} - ${title ? 'Product Detected' : 'No Product'}`;
  document.body.appendChild(indicator);
  
  // Auto-remove after 5 seconds
  setTimeout(() => {
    indicator.remove();
  }, 5000);
}

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('[ContentScript] Received message:', request.action);
  
  if (request.action === 'GET_PAGE_STATUS') {
    // Return current page status to popup
    sendResponse({ 
      platform, 
      isValid: !!platform,
      hasRun,
      didNotSyncBecauseNotLoggedIn,
      productData: extractedProductData // Send extracted data
    });
    console.log('[ContentScript] Sent page status:', { platform, isValid: !!platform, hasRun, hasData: !!extractedProductData });
  }
  
  if (request.action === 'GET_PRODUCT_DATA') {
    // Return full product data
    sendResponse({ 
      success: true,
      productData: extractedProductData 
    });
  }
  
  return true; // Keep channel open
});
