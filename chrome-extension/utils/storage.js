/**
 * PriceWiser Extension - Storage Utilities
 * Thin module wrapper around the shared storage core.
 */

import './storage-core.js';

const storageCore = globalThis.PriceWiserStorageCore;

if (!storageCore) {
  throw new Error('PriceWiser storage core failed to initialize');
}

const {
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
} = storageCore;

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

export default storageCore;
