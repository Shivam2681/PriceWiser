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

    // Update product
    const updatedProduct = await Product.findByIdAndUpdate(
      productId,
      {
        currentPrice: scrapedProduct.currentPrice,
        originalPrice: scrapedProduct.originalPrice,
        discountRate: scrapedProduct.discountRate,
        isOutOfStock: scrapedProduct.isOutOfStock,
        priceHistory,
        lowestPrice,
        highestPrice,
        averagePrice,
      },
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
