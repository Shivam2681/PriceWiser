const { PriceHistoryItem, Product } = require("@/types");

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

// export const getEmailNotifType = (
//     scrapedProduct: Product,
//     currentProduct: Product
//   ) => {
//     const lowestPrice = getLowestPrice(currentProduct.priceHistory);
//
//     if (scrapedProduct.currentPrice < lowestPrice) {
//       return Notification.LOWEST_PRICE as keyof typeof Notification;
//     }
//     if (!scrapedProduct.isOutOfStock && currentProduct.isOutOfStock) {
//       return Notification.CHANGE_OF_STOCK as keyof typeof Notification;
//     }
//     if (scrapedProduct.discountRate >= THRESHOLD_PERCENTAGE) {
//       return Notification.THRESHOLD_MET as keyof typeof Notification;
//     }
//
//     return null;
// };

export const formatNumber = (num = 0) => {
  return num.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
};
