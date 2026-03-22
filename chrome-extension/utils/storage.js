/**
 * PriceWiser Extension - Storage Utilities
 * Handles Chrome storage for auth tokens and user preferences
 */

// Check if we're in a browser context with window object
const isBrowserContext = typeof window !== 'undefined';

// Make functions available globally for popup use only
if (isBrowserContext) {
  window.PWStorage = {};
}

const STORAGE_KEYS = {
  AUTH_TOKEN: 'authToken',
  USER_ID: 'userId',
  IS_LOGGED_IN: 'isLoggedIn',
  TRACKING_ENABLED: 'trackingEnabled',
  LAST_SYNC: 'lastSync'
};

/**
 * Save data to Chrome storage
 * @param {string} key - Storage key
 * @param {any} value - Value to store
 * @returns {Promise<void>}
 */
async function saveToStorage(key, value) {
  try {
    await chrome.storage.local.set({ [key]: value });
    console.log(`[Storage] Saved: ${key}`, value);
  } catch (error) {
    console.error('[Storage] Error saving:', error);
    throw error;
  }
}

/**
 * Get data from Chrome storage
 * @param {string} key - Storage key
 * @returns {Promise<any>}
 */
async function getFromStorage(key) {
  try {
    const result = await chrome.storage.local.get([key]);
    return result[key];
  } catch (error) {
    console.error('[Storage] Error getting:', error);
    return null;
  }
}

/**
 * Remove data from Chrome storage
 * @param {string} key - Storage key
 * @returns {Promise<void>}
 */
async function removeFromStorage(key) {
  try {
    await chrome.storage.local.remove([key]);
    console.log(`[Storage] Removed: ${key}`);
  } catch (error) {
    console.error('[Storage] Error removing:', error);
    throw error;
  }
}

/**
 * Clear all extension storage
 * @returns {Promise<void>}
 */
async function clearAllStorage() {
  try {
    await chrome.storage.local.clear();
    console.log('[Storage] Cleared all storage');
  } catch (error) {
    console.error('[Storage] Error clearing:', error);
    throw error;
  }
}

/**
 * Get authentication token
 * @returns {Promise<string|null>}
 */
async function getAuthToken() {
  return await getFromStorage(STORAGE_KEYS.AUTH_TOKEN);
}

/**
 * Save authentication token
 * @param {string} token - JWT token
 * @returns {Promise<void>}
 */
async function saveAuthToken(token) {
  await saveToStorage(STORAGE_KEYS.AUTH_TOKEN, token);
  await saveToStorage(STORAGE_KEYS.IS_LOGGED_IN, true);
}

/**
 * Check if user is logged in
 * @returns {Promise<boolean>}
 */
async function isLoggedIn() {
  return await getFromStorage(STORAGE_KEYS.IS_LOGGED_IN) === true;
}

/**
 * Logout user
 * @returns {Promise<void>}
 */
async function logout() {
  await removeFromStorage(STORAGE_KEYS.AUTH_TOKEN);
  await removeFromStorage(STORAGE_KEYS.USER_ID);
  await removeFromStorage(STORAGE_KEYS.IS_LOGGED_IN);
}

/**
 * Get user ID
 * @returns {Promise<string|null>}
 */
async function getUserId() {
  return await getFromStorage(STORAGE_KEYS.USER_ID);
}

/**
 * Save user ID
 * @param {string} userId - User ID
 * @returns {Promise<void>}
 */
async function saveUserId(userId) {
  await saveToStorage(STORAGE_KEYS.USER_ID, userId);
}

/**
 * Get last sync timestamp
 * @returns {Promise<string|null>}
 */
async function getLastSync() {
  return await getFromStorage(STORAGE_KEYS.LAST_SYNC);
}

/**
 * Update last sync timestamp
 * @returns {Promise<void>}
 */
async function updateLastSync() {
  await saveToStorage(STORAGE_KEYS.LAST_SYNC, new Date().toISOString());
}

// Export all functions to window for use in popup (only in browser context)
if (isBrowserContext) {
  window.PWStorage = {
    saveToStorage,
    getFromStorage,
    removeFromStorage,
    clearAllStorage,
    getAuthToken,
    saveAuthToken,
    isLoggedIn,
    logout,
    getUserId,
    saveUserId,
    getLastSync,
    updateLastSync,
  };
}

// Also export for ES6 module usage (background script)
export {
  saveToStorage,
  getFromStorage,
  removeFromStorage,
  clearAllStorage,
  getAuthToken,
  saveAuthToken,
  isLoggedIn,
  logout,
  getUserId,
  saveUserId,
  getLastSync,
  updateLastSync,
};
