import { PriceHistoryItem, Product } from "@/types";

const Notification = {
  WELCOME: 'WELCOME',
  CHANGE_OF_STOCK: 'CHANGE_OF_STOCK',
  LOWEST_PRICE: 'LOWEST_PRICE',
  THRESHOLD_MET: 'THRESHOLD_MET',
};

const THRESHOLD_PERCENTAGE = 10; // Discount threshold for email alerts (10%)
// Extracts and returns the price from a list of possible elements.
export function extractPrice(...elements) {
  for (const element of elements) {
    const priceText = element.text().trim();

    if (priceText) {
      const cleanPrice = priceText.replace(/[^\d.]/g, '');

      let firstPrice;

      if (cleanPrice) {
        firstPrice = cleanPrice.match(/\d+\.\d{2}/)?.[0];
      }

      return firstPrice || cleanPrice;
    }
  }

  return '';
}

// Extracts and returns the currency symbol from an element.
export function extractCurrency(element) {
  const currencyText = element.text().trim().slice(0, 1);
  return currencyText ? currencyText : "";
}

export function getHighestPrice(priceList) {
  let highestPrice = priceList[0];

  for (let i = 0; i < priceList.length; i++) {
    if (priceList[i].price > highestPrice.price) {
      highestPrice = priceList[i];
    }
  }

  return highestPrice.price;
}

export function getLowestPrice(priceList) {
  let lowestPrice = priceList[0];

  for (let i = 0; i < priceList.length; i++) {
    if (priceList[i].price < lowestPrice.price) {
      lowestPrice = priceList[i];
    }
  }

  return lowestPrice.price;
}

export function getAveragePrice(priceList) {
  const sumOfPrices = priceList.reduce((acc, curr) => acc + curr.price, 0);
  const averagePrice = sumOfPrices / priceList.length || 0;

  return averagePrice;
}

export const getEmailNotifType = (scrapedProduct, currentProduct) => {
  const lowestPrice = getLowestPrice(currentProduct.priceHistory);

  if (scrapedProduct.currentPrice < lowestPrice) {
    return Notification.LOWEST_PRICE;
  }
  if (!scrapedProduct.isOutOfStock && currentProduct.isOutOfStock) {
    return Notification.CHANGE_OF_STOCK;
  }
  if (scrapedProduct.discountRate >= THRESHOLD_PERCENTAGE) {
    return Notification.THRESHOLD_MET;
  }

  return null;
};

export const formatNumber = (num = 0) => {
  return num.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
};

/**
 * Calculates updated price history and statistics for a product.
 * @param {Array} currentPriceHistory - Current price history array.
 * @param {number} newPrice - The newly scraped price.
 * @returns {Object} Updated price history and statistics.
 */
export function getUpdatedPriceData(currentPriceHistory, newPrice) {
  const lastPrice = currentPriceHistory[currentPriceHistory.length - 1]?.price;
  const priceChanged = lastPrice !== newPrice;

  const updatedPriceHistory = priceChanged
    ? [...currentPriceHistory, { price: newPrice, date: new Date() }]
    : currentPriceHistory;

  return {
    priceHistory: updatedPriceHistory,
    lowestPrice: getLowestPrice(updatedPriceHistory),
    highestPrice: getHighestPrice(updatedPriceHistory),
    averagePrice: getAveragePrice(updatedPriceHistory),
    priceChanged,
  };
}

/**
 * Debounces a function call.
 * @param {Function} func - The function to debounce.
 * @param {number} wait - Wait time in milliseconds.
 * @returns {Function} Debounced function.
 */
export function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}
