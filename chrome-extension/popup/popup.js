/**
 * PriceWiser Extension - Popup Script
 * Handles popup UI interactions and displays product information
 */

// Storage functions are available via window.PWStorage (loaded before this script)
const { getAuthToken, logout, getLastSync } = window.PWStorage;

// DOM Elements
const loadingView = document.getElementById('loading-view');
const loginView = document.getElementById('login-view');
const productView = document.getElementById('product-view');
const statusBadge = document.getElementById('status-badge');
const lastSyncEl = document.getElementById('last-sync');
const productTitleEl = document.getElementById('product-title');
const productPriceEl = document.getElementById('product-price');
const originalPriceEl = document.getElementById('original-price');
const discountBadgeEl = document.getElementById('discount-badge');
const productPlatformEl = document.getElementById('product-platform');
const errorContainer = document.getElementById('error-container');
const successContainer = document.getElementById('success-container');
const trackBtn = document.getElementById('track-btn');
const refreshBtn = document.getElementById('refresh-btn');
const redetectBtn = document.getElementById('redetect-btn');
const loginBtn = document.getElementById('login-btn');
const syncTokenBtn = document.getElementById('sync-token-btn');
const tokenStatusEl = document.getElementById('token-status');

let currentProductData = null;
let isTracking = false;
let currentTabUrl = null; // Store current tab URL for redirect

/**
 * Show a specific view
 * @param {'loading' | 'login' | 'product'} viewName
 */
function showView(viewName) {
  loadingView.classList.add('hidden');
  loginView.classList.add('hidden');
  productView.classList.add('hidden');

  if (viewName === 'loading') {
    loadingView.classList.remove('hidden');
  } else if (viewName === 'login') {
    loginView.classList.remove('hidden');
  } else if (viewName === 'product') {
    productView.classList.remove('hidden');
  }
}

/**
 * Update status badge
 * @param {'success' | 'pending' | 'error'} status
 * @param {string} text
 */
function updateStatus(status, text) {
  statusBadge.className = `status-badge ${status}`;
  
  let icon = '';
  if (status === 'success') {
    icon = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <polyline points="20 6 9 17 4 12"/>
    </svg>`;
  } else if (status === 'error') {
    icon = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <circle cx="12" cy="12" r="10"/>
      <line x1="12" y1="8" x2="12" y2="12"/>
      <line x1="12" y1="16" x2="12.01" y2="16"/>
    </svg>`;
  } else {
    icon = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <circle cx="12" cy="12" r="10"/>
      <polyline points="12 6 12 12 16 14"/>
    </svg>`;
  }
  
  statusBadge.innerHTML = `${icon}${text}`;
}

/**
 * Format timestamp to relative time
 * @param {string} timestamp
 * @returns {string}
 */
function formatRelativeTime(timestamp) {
  if (!timestamp) return 'Never';
  
  const now = new Date();
  const past = new Date(timestamp);
  const diffMs = now - past;
  const diffMins = Math.floor(diffMs / 60000);
  
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  
  return past.toLocaleDateString();
}

/**
 * Extract product data from current tab
 */
async function extractProductData() {
  try {
    updateStatus('pending', 'Extracting...');
    
    // Get current tab
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    if (!tab) {
      throw new Error('No active tab found');
    }
    
    // Send message to content script
    chrome.tabs.sendMessage(tab.id, { 
      action: 'EXTRACT_NOW'
    }, (response) => {
      if (chrome.runtime.lastError) {
        console.error('[Popup] Error sending message:', chrome.runtime.lastError);
        updateStatus('error', 'Not on product page');
        showError('Navigate to an Amazon or Flipkart product page');
        return;
      }
      
      if (response && response.success) {
        console.log('[Popup] Extraction triggered');
        // Wait a moment for data to be available
        setTimeout(() => loadProductData(), 500);
      }
    });
  } catch (error) {
    console.error('[Popup] Extraction error:', error);
    updateStatus('error', 'Extraction failed');
    showError('Could not extract product data. Please refresh the page.');
  }
}

/**
 * Load product data from storage or current page
 */
async function loadProductData() {
  try {
    // Get current tab
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    if (!tab) {
      throw new Error('No active tab found');
    }
    
    // Check if we're on a supported page by trying to communicate with content script
    chrome.tabs.sendMessage(tab.id, { action: 'GET_PAGE_STATUS' }, async (response) => {
      if (chrome.runtime.lastError || !response) {
        // ... (existing logic for non-supported pages)
        return;
      }
      
      const { platform, isValid, productData } = response;
      
      if (!isValid || !platform) {
        // ... (existing logic for invalid pages)
        return;
      }
      
      // Update platform display
      productPlatformEl.textContent = platform.charAt(0).toUpperCase() + platform.slice(1);
      
      // Display product data from content script
      if (productData && productData.title) {
        productTitleEl.textContent = productData.title;
        
        // Handle current price display
        if (productData.price && productData.price > 0) {
          productPriceEl.textContent = `₹${productData.price}`;
          productPriceEl.style.color = '#10b981'; // Green for success
        } else {
          productPriceEl.textContent = 'Price not available';
          productPriceEl.style.color = '#ef4444'; // Red for missing
        }
        
        // Show original price and discount if available
        if (productData.originalPrice && productData.originalPrice > productData.price) {
          originalPriceEl.textContent = `₹${productData.originalPrice}`;
          originalPriceEl.classList.remove('hidden');
        } else {
          originalPriceEl.classList.add('hidden');
        }
        
        if (productData.discountPercentage && productData.discountPercentage > 0) {
          discountBadgeEl.textContent = `${productData.discountPercentage}% OFF`;
          discountBadgeEl.classList.remove('hidden');
        } else {
          discountBadgeEl.classList.add('hidden');
        }
      } else {
        productTitleEl.textContent = 'Loading product details...';
        productPriceEl.textContent = '--';
        productPriceEl.style.color = '#10b981';
        originalPriceEl.classList.add('hidden');
        discountBadgeEl.classList.add('hidden');
      }
      
      updateStatus('pending', 'Ready to track');
      
      // Load last sync time
      const lastSync = await getLastSync();
      lastSyncEl.textContent = formatRelativeTime(lastSync);

      // FORCE DEFAULT STATE: Always show "Track This Product" initially
      // We are REMOVING the automatic check against the API on popup load
      // This ensures the user ALWAYS sees the Track button first.
      trackBtn.disabled = false;
      trackBtn.innerHTML = `
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
        Track This Product
      `;
      
      // Show redetect button only if needed
      if (currentTabUrl && !productData) {
        redetectBtn.style.display = 'flex';
      } else {
        redetectBtn.style.display = 'none';
      }
      
    });
  } catch (error) {
    console.error('[Popup] Load error:', error);
    updateStatus('error', 'Load failed');
    showError('Failed to load product information');
  }
}

/**
 * Track current product and redirect to website
 */
async function trackProduct() {
  if (isTracking) return;
  
  console.log('[Popup] trackProduct() called manually');
  
  isTracking = true;
  trackBtn.disabled = true;
  trackBtn.innerHTML = `
    <svg class="animate-spin" width="18" height="18" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" class="opacity-25"/>
      <path fill="currentColor" class="opacity-75" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
    </svg>
    Syncing with Website...
  `;
  
  try {
    // 1. Get current product data from content script
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab) throw new Error('No active tab found');

    const response = await new Promise((resolve) => {
      chrome.tabs.sendMessage(tab.id, { action: 'GET_PAGE_STATUS' }, resolve);
    });

    if (!response || !response.productData) {
      throw new Error('Could not get product data');
    }

    const productData = response.productData;
    const token = await getAuthToken();

    if (!token) {
      showError('Please login to track products');
      showView('login');
      return;
    }

    // 2. Sync with website (backend)
    console.log('[Popup] Syncing product with backend...');
    const trackUrl = 'http://localhost:3000/api/extension/track';
    const syncRes = await fetch(trackUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        ...productData
        // No userEmail needed here, the API handles the redirect flow
      })
    });

    const syncData = await syncRes.json();
    
    if (!syncRes.ok || !syncData.success) {
      throw new Error(syncData.message || 'Failed to sync with website');
    }

    const productIdInDb = syncData.product._id;
    console.log('[Popup] Sync successful, product ID:', productIdInDb);

    updateStatus('success', 'Syncing...');
    showSuccess('Opening product page on PriceWiser...');

    // 3. Redirect active tab to website product page in a NEW TAB
    const websiteProductUrl = `http://localhost:3000/products/${productIdInDb}`;
    
    // Give user a split second to see success message
    setTimeout(async () => {
      try {
        // Create new tab instead of updating existing one
        await chrome.tabs.create({ url: websiteProductUrl });
        window.close(); // Close popup
      } catch (err) {
        console.error('[Popup] Redirect error:', err);
      }
    }, 800);
    
  } catch (error) {
    console.error('[Popup] Track error:', error);
    updateStatus('error', 'Sync failed');
    showError(error.message || 'Failed to sync product');
    
    trackBtn.disabled = false;
    trackBtn.innerHTML = `
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <polyline points="20 6 9 17 4 12"/>
      </svg>
      Track This Product
    `;
  } finally {
    isTracking = false;
  }
}

/**
 * Show error message
 * @param {string} message
 */
function showError(message) {
  errorContainer.textContent = message;
  errorContainer.classList.remove('hidden');
  successContainer.classList.add('hidden');
}

/**
 * Show success message
 * @param {string} message
 */
function showSuccess(message) {
  successContainer.textContent = message;
  successContainer.classList.remove('hidden');
  errorContainer.classList.add('hidden');
}

/**
 * Clear messages
 */
function clearMessages() {
  errorContainer.classList.add('hidden');
  successContainer.classList.add('hidden');
}

/**
 * Open login page
 */
function openLoginPage() {
  // Open dashboard for login, then redirect back to product page
  const returnUrl = currentTabUrl ? encodeURIComponent(currentTabUrl) : '';
  chrome.tabs.create({
    url: `http://localhost:3000/dashboard${returnUrl ? '?returnUrl=' + returnUrl : ''}`,
  });
  window.close();
}

/**
 * Sync token from website
 */
async function syncTokenFromWebsite() {
  try {
    tokenStatusEl.textContent = '⏳ Checking authentication...';
    tokenStatusEl.style.color = '#6b7280';
    
    const authData = await getTokenFromWebsite();
    
    if (authData.token && authData.userId) {
      console.log('[Popup] Got JWT token for user:', authData.email);
      
      // Save the actual JWT token to extension storage
      chrome.runtime.sendMessage({
        action: 'SAVE_TOKEN',
        token: authData.token,
        userId: authData.userId,
        email: authData.email,
      }, (response) => {
        if (chrome.runtime.lastError || !response?.success) {
          console.error('[Popup] Failed to save auth state');
          tokenStatusEl.textContent = '❌ Failed to save auth state';
          tokenStatusEl.style.color = '#ef4444';
          return;
        }
        
        console.log('[Popup] Auth state saved successfully!');
        tokenStatusEl.textContent = '✅ Success! You are logged in.';
        tokenStatusEl.style.color = '#10b981';
        
        // Reload popup after short delay
        setTimeout(() => {
          location.reload();
        }, 1500);
      });
    } else {
      console.warn('[Popup] Not logged in on website');
      tokenStatusEl.textContent = '⚠️ Not logged in. Please login on the website first.';
      tokenStatusEl.style.color = '#f59e0b';
    }
  } catch (error) {
    console.error('[Popup] Sync error:', error);
    tokenStatusEl.textContent = '❌ Error checking authentication';
    tokenStatusEl.style.color = '#ef4444';
  }
}

/**
 * Try to get token from PriceWiser website by calling the auth endpoint
 * @returns {Promise<{token: string|null, userId: string|null}>}
 */
async function getTokenFromWebsite() {
  try {
    // Get current tab
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    if (!tab) {
      console.log('[Popup] No active tab found');
      return { token: null, userId: null };
    }
    
    // Check if tab URL is valid
    const tabUrl = tab.url;
    if (!tabUrl) {
      console.log('[Popup] Tab has no URL');
      return { token: null, userId: null };
    }
    
    const url = new URL(tabUrl);
    
    // Only try if on pricewiser.com or localhost
    const isLocalhost = url.hostname === 'localhost' && url.port === '3000';
    const isPriceWiser = url.hostname.includes('pricewiser');
    
    if (!isLocalhost && !isPriceWiser) {
      console.log('[Popup] Not on PriceWiser domain:', url.hostname);
      return { token: null, userId: null };
    }
    
    // Call the extension auth endpoint to check auth status
    const authCheckUrl = `${url.protocol}//${url.host}/api/auth/extension`;
    
    console.log('[Popup] Checking auth at:', authCheckUrl);
    console.log('[Popup] Current tab URL:', tabUrl);
    console.log('[Popup] Is localhost:', isLocalhost);
    console.log('[Popup] Is PriceWiser:', isPriceWiser);
    
    try {
      const response = await fetch(authCheckUrl, {
        method: 'GET',
        credentials: 'include', // Important: sends cookies
        headers: {
          'Accept': 'application/json',
        },
      });
      
      console.log('[Popup] Auth response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('[Popup] Auth check failed:', response.status, errorText);
        return { token: null, userId: null };
      }
      
      const data = await response.json();
      console.log('[Popup] Auth check result:', data);
      
      if (data.isAuthenticated && data.token) {
        console.log('[Popup] Successfully got JWT token from website');
        return {
          token: data.token, // The actual JWT token
          userId: data.user?.id,
          email: data.user?.email,
        };
      }
      
      return { token: null, userId: null };
    } catch (fetchError) {
      console.error('[Popup] Fetch error:', fetchError);
      return { token: null, userId: null };
    }
  } catch (error) {
    console.error('[Popup] Get website token error:', error);
    return { token: null, userId: null };
  }
}

/**
 * Initialize popup
 */
async function init() {
  try {
    console.log('[Popup] Initializing...');
    
    // Get current tab URL first (before any navigation)
    const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (activeTab && activeTab.url) {
      currentTabUrl = activeTab.url;
      console.log('[Popup] Current tab URL:', currentTabUrl);
    }
    
    // First check extension storage
    let authToken = await getAuthToken();
    console.log('[Popup] Auth token from storage:', authToken ? 'FOUND' : 'NOT FOUND');
    
    if (!authToken) {
      console.log('[Popup] No token in extension storage, trying website...');
      
      // Try to get token from website if user is logged in there
      const websiteToken = await getTokenFromWebsite();
      
      if (websiteToken) {
        console.log('[Popup] Got token from website, saving to extension storage');
        // Save to extension storage for future use
        chrome.runtime.sendMessage({
          action: 'SAVE_TOKEN',
          token: websiteToken.token,
          userId: websiteToken.userId,
        }, () => {
          authToken = websiteToken.token;
          console.log('[Popup] Token saved to storage');
        });
      } else {
        console.log('[Popup] No token from website either');
      }
    }
    
    if (!authToken) {
      console.log('[Popup] User not logged in - showing login view');
      showView('login');
      return;
    }
    
    console.log('[Popup] User is logged in - showing product view');
    showView('product');
    
    // Get current tab to determine what to show
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    if (tab && tab.url) {
      const url = new URL(tab.url);
      const isAmazon = url.hostname.includes('amazon');
      const isFlipkart = url.hostname.includes('flipkart');
      
      if (isAmazon || isFlipkart) {
        // On supported site - load product data
        console.log('[Popup] On e-commerce site, loading product data');
        await loadProductData();
      } else {
        // Not on supported site - show helpful message
        console.log('[Popup] Not on e-commerce site');
        updateStatus('pending', 'Ready to track');
        productTitleEl.textContent = 'Navigate to Amazon or Flipkart to start tracking';
        productPriceEl.textContent = '--';
        productPlatformEl.textContent = '--';
        
        // Still load last sync time
        const lastSync = await getLastSync();
        lastSyncEl.textContent = formatRelativeTime(lastSync);
      }
    }
    
  } catch (error) {
    console.error('[Popup] Init error:', error);
    showView('login');
  }
}

// Event Listeners
loginBtn.addEventListener('click', openLoginPage);
syncTokenBtn.addEventListener('click', syncTokenFromWebsite);
trackBtn.addEventListener('click', trackProduct);
refreshBtn.addEventListener('click', () => {
  clearMessages();
  loadProductData();
});
redetectBtn.addEventListener('click', async () => {
  // Tell content script to re-run extraction
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  chrome.tabs.sendMessage(tab.id, { action: 'EXTRACT_NOW' }, () => {
    console.log('[Popup] Sent extract now command');
    // Refresh the popup data
    clearMessages();
    loadProductData();
  });
});

// Initialize on load
init();
