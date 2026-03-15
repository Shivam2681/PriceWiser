"use server";

import { connectToDB } from "@/lib/mongoose";
import Product from "@/lib/models/product.models";
import { scrapeProduct } from "@/lib/scraper";
import { getUpdatedPriceData } from "@/lib/utils";

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

    // Use shared utility for price history and stats
    const { priceHistory, lowestPrice, highestPrice, averagePrice, priceChanged } = 
      getUpdatedPriceData(product.priceHistory, scrapedProduct.currentPrice);

    console.log(`Price stats - Lowest: ₹${lowestPrice}, Highest: ₹${highestPrice}, Avg: ₹${averagePrice}`);
    console.log(`Previous lowest was: ₹${product.lowestPrice || 'N/A'}`);

    // Update product with validation
    const updateData = {
      currentPrice: scrapedProduct.currentPrice,
      originalPrice: scrapedProduct.originalPrice,
      discountRate: scrapedProduct.discountRate,
      isOutOfStock: scrapedProduct.isOutOfStock,
      priceHistory,
    };
    
    // Only update price stats if we have valid prices
    if (lowestPrice > 0) {
      updateData.lowestPrice = lowestPrice;
      updateData.highestPrice = highestPrice;
      updateData.averagePrice = averagePrice;
    } else if (product.lowestPrice && product.lowestPrice > 0) {
      // Keep existing stats if new scrape returned zero
      updateData.lowestPrice = product.lowestPrice;
      updateData.highestPrice = product.highestPrice;
      updateData.averagePrice = product.averagePrice;
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      productId,
      updateData,
      { new: true }
    );

    console.log(`Price updated: ₹${scrapedProduct.currentPrice}`);
    
    // Return plain object instead of Mongoose document to avoid serialization issues
    return { 
      success: true, 
      priceChanged,
      oldPrice: product.priceHistory[product.priceHistory.length - 1]?.price,
      newPrice: scrapedProduct.currentPrice,
      productId: productId
    };
  } catch (error) {
    console.error("Refresh product price error:", error);
    return { success: false, error: error.message };
  }
}
