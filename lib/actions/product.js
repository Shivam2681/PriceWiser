"use server";

import { connectToDB } from "@/lib/mongoose";
import Product from "@/lib/models/product.models";
import { scrapeProduct } from "@/lib/scraper";
import { getLowestPrice, getHighestPrice, getAveragePrice } from "@/lib/utils";

export async function refreshProductPrice(productId) {
  try {
    await connectToDB();
    
    const product = await Product.findById(productId);
    if (!product) {
      return { success: false, error: "Product not found" };
    }

    console.log(`Refreshing price for: ${product.title}`);
    
    // Scrape the product again
    const scrapedProduct = await scrapeProduct(product.url);
    
    if (!scrapedProduct) {
      return { success: false, error: "Failed to scrape product" };
    }

    // Check if we got a valid price
    if (scrapedProduct.currentPrice === 0) {
      return { success: false, error: "Price still pending - Amazon may be blocking requests" };
    }

    // Update price history if price changed
    const lastPrice = product.priceHistory[product.priceHistory.length - 1]?.price;
    const priceChanged = lastPrice !== scrapedProduct.currentPrice;
    
    const updatedPriceHistory = priceChanged 
      ? [...product.priceHistory, { price: scrapedProduct.currentPrice, date: new Date() }]
      : product.priceHistory;

    // Update product
    const updatedProduct = await Product.findByIdAndUpdate(
      productId,
      {
        currentPrice: scrapedProduct.currentPrice,
        originalPrice: scrapedProduct.originalPrice,
        discountRate: scrapedProduct.discountRate,
        isOutOfStock: scrapedProduct.isOutOfStock,
        priceHistory: updatedPriceHistory,
        lowestPrice: getLowestPrice(updatedPriceHistory),
        highestPrice: getHighestPrice(updatedPriceHistory),
        averagePrice: getAveragePrice(updatedPriceHistory),
      },
      { new: true }
    );

    console.log(`Price updated: ₹${scrapedProduct.currentPrice}`);
    
    // Return plain object instead of Mongoose document to avoid serialization issues
    return { 
      success: true, 
      priceChanged,
      oldPrice: lastPrice,
      newPrice: scrapedProduct.currentPrice,
      productId: productId
    };
  } catch (error) {
    console.error("Refresh product price error:", error);
    return { success: false, error: error.message };
  }
}
