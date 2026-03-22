/**
 * PriceWiser Extension - API Utilities
 * Handles communication with PriceWiser backend
 */

import { getAuthToken } from './storage.js';

// Get the base API URL from environment or use default
const getBaseURL = () => {
  // For development, use localhost
  // For production, use your actual domain
  return 'http://localhost:3000';
};

/**
 * Get authorization headers for API requests
 * @returns {Promise<Object>} Headers object
 */
async function getAuthHeaders() {
  const token = await getAuthToken();
  
  // If using cookie-based auth (token is 'cookie-auth')
  if (token === 'cookie-auth') {
    return {
      // No Authorization header needed - cookies will be sent automatically
      // when request comes from the same origin
    };
  }
  
  // Traditional JWT token auth
  if (token) {
    return {
      'Authorization': `Bearer ${token}`,
    };
  }
  
  return {};
}

/**
 * Send tracking data to PriceWiser backend
 * @param {Object} productData - Product information
 * @param {string} productData.title - Product title
 * @param {number} productData.price - Current price
 * @param {string} productData.url - Product URL
 * @param {string} productData.productId - Product ID (ASIN for Amazon)
 * @param {'amazon' | 'flipkart'} productData.source - Source platform
 * @param {string} productData.timestamp - ISO timestamp
 * @param {string} authToken - JWT authentication token
 * @returns {Promise<Object>} API response
 */
export async function trackProduct(productData, authToken) {
  const url = `${getBaseURL()}/api/extension/track`;
  
  try {
    console.log('[API] Sending tracking data:', productData);
    
    // Get proper auth headers
    const authHeaders = await getAuthHeaders();
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders,
      },
      body: JSON.stringify(productData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
      
      // Handle 401 unauthorized
      if (response.status === 401) {
        throw new Error('Authentication failed. Please login again.');
      }
      
      throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('[API] Tracking successful:', data);
    
    return data;
  } catch (error) {
    console.error('[API] Tracking failed:', error.message);
    throw error;
  }
}

/**
 * Check if product is already being tracked
 * @param {string} productId - Product ID
 * @param {string} authToken - JWT token
 * @returns {Promise<boolean>}
 */
export async function isProductTracked(productId, authToken) {
  const url = `${getBaseURL()}/api/extension/check/${productId}`;
  
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${authToken}`,
      },
    });

    if (!response.ok) {
      return false;
    }

    const data = await response.json();
    return data.isTracked || false;
  } catch (error) {
    console.error('[API] Check failed:', error.message);
    return false;
  }
}

/**
 * Verify authentication token
 * @param {string} token - JWT token
 * @returns {Promise<Object|null>} User data or null
 */
export async function verifyToken(token) {
  const url = `${getBaseURL()}/api/auth/verify`;
  
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data.user || null;
  } catch (error) {
    console.error('[API] Token verification failed:', error.message);
    return null;
  }
}
