/**
 * PriceWiser Extension - Background Service Worker
 * Handles API communication, authentication, and sync logic
 */

import { trackProduct } from '../utils/api.js';
import { getAuthToken, updateLastSync, saveAuthToken, getUserId, saveUserId } from '../utils/storage.js';

// Retry configuration
const MAX_RETRIES = 3;
const RETRY_DELAY = 2000; // 2 seconds

/**
 * Sleep utility
 * @param {number} ms - Milliseconds to sleep
 * @returns {Promise<void>}
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Sync product data with retry logic
 * @param {Object} productData - Product information
 * @param {number} attempt - Current attempt number
 * @returns {Promise<Object>}
 */
async function syncWithRetry(productData, attempt = 1) {
  try {
    const authToken = await getAuthToken();
    
    if (!authToken) {
      return {
        success: false,
        error: 'Not authenticated. Please login.',
      };
    }
    
    console.log(`[Background] Sync attempt ${attempt}/${MAX_RETRIES}`);
    
    // Call API to track product
    const result = await trackProduct(productData, authToken);
    
    // Update last sync timestamp
    await updateLastSync();
    
    return {
      success: true,
      data: result,
    };
  } catch (error) {
    console.error(`[Background] Sync failed (attempt ${attempt}):`, error.message);
    
    // Retry if attempts remaining
    if (attempt < MAX_RETRIES) {
      console.log(`[Background] Retrying in ${RETRY_DELAY}ms...`);
      await sleep(RETRY_DELAY);
      return syncWithRetry(productData, attempt + 1);
    }
    
    return {
      success: false,
      error: error.message || 'Failed to sync after multiple attempts',
    };
  }
}

/**
 * Handle messages from content script or popup
 */
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('[Background] Received message:', request.action);
  
  // Handle token save request (from popup login)
  if (request.action === 'SAVE_TOKEN') {
    saveAuthToken(request.token)
      .then(() => {
        const promises = [];
        if (request.userId) {
          promises.push(saveUserId(request.userId));
        }
        if (request.email) {
          promises.push(chrome.storage.local.set({ userEmail: request.email }));
        }
        return Promise.all(promises);
      })
      .then(() => {
        // Notify all content scripts that user logged in
        chrome.tabs.query({}, (tabs) => {
          tabs.forEach((tab) => {
            if (tab.url && (tab.url.includes('amazon') || tab.url.includes('flipkart'))) {
              chrome.tabs.sendMessage(tab.id, { action: 'USER_LOGGED_IN' }).catch(() => {
                // Content script might not be loaded, ignore error
              });
            }
          });
        });
        
        sendResponse({ success: true });
      })
      .catch((error) => {
        sendResponse({ success: false, error: error.message });
      });
    
    return true;
  }
  
  // Handle logout request
  if (request.action === 'LOGOUT') {
    chrome.storage.local.clear()
      .then(() => {
        sendResponse({ success: true });
      })
      .catch((error) => {
        sendResponse({ success: false, error: error.message });
      });
    
    return true;
  }
  
  // Handle auth status check
  if (request.action === 'CHECK_AUTH') {
    getAuthToken()
      .then((token) => {
        sendResponse({ 
          isLoggedIn: !!token,
          hasToken: !!token 
        });
      });
    
    return true;
  }
});

/**
 * Handle extension installation
 */
chrome.runtime.onInstalled.addListener((details) => {
  console.log('[Background] Extension installed:', details.reason);
  
  if (details.reason === 'install') {
    // Open welcome page on first install
    chrome.tabs.create({
      url: 'https://pricewiser.com/welcome',
    });
  }
});

/**
 * Log when service worker starts
 */
console.log('[Background] PriceWiser service worker initialized');
