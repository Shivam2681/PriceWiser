"use server"

import { revalidatePath } from "next/cache";
import { cache } from "react";
import Product from "../models/product.models";
import User from "../models/user.model";
import { connectToDB } from "../mongoose";
import { scrapeProduct } from "../scraper";
import { getUpdatedPriceData } from "../utils";
import { generateEmailBody, sendEmail } from "../nodemailer";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth";

export async function scrapeAndStoreProduct(productUrl) {
    if(!productUrl) {
      console.log('No product URL provided');
      return;
    }
  
    try {
      await connectToDB();
      console.log('Scraping URL:', productUrl);
  
      const scrapedProduct = await scrapeProduct(productUrl);
      console.log('Scraped product result:', scrapedProduct ? 'Success' : 'Failed');
  
      if(!scrapedProduct) {
        console.error('Scraping returned null for URL:', productUrl);
        throw new Error('Failed to scrape product data. Please check the URL and try again.');
      }
      
      // Handle fallback data (when scraping fails but we got basic info)
      if (scrapedProduct.currentPrice === 0) {
        console.log('Using fallback data - price will be updated on next cron run');
      }
  
      let product = scrapedProduct;
    
      const existingProduct = await Product.findOne({ url: scrapedProduct.url });
    
      if(existingProduct) {
        // Use shared utility for price history and stats
        const { priceHistory, lowestPrice, highestPrice, averagePrice } = 
          getUpdatedPriceData(existingProduct.priceHistory, scrapedProduct.currentPrice);
            
        product = {
          ...scrapedProduct,
          priceHistory,
          lowestPrice,
          highestPrice,
          averagePrice,
        };
    } else {
        // New product - ensure price history is initialized
        if (!product.priceHistory || product.priceHistory.length === 0) {
          product.priceHistory = [{ price: product.currentPrice, date: new Date() }];
        }
        // Set lowest to current, highest to original (if higher), average to current
        product.lowestPrice = product.currentPrice;
        product.highestPrice = product.originalPrice > product.currentPrice ? product.originalPrice : product.currentPrice;
        product.averagePrice = product.currentPrice;
    }
  
      const newProduct = await Product.findOneAndUpdate(
        { url: scrapedProduct.url },
        product,
        { upsert: true, new: true }
      );
  
      revalidatePath(`/products/${newProduct._id}`);
      
      return JSON.parse(JSON.stringify(newProduct));
    } catch (error) {
      console.error('Error in scrapeAndStoreProduct:', error);
      throw new Error(`Failed to create/update product: ${error.message}`);
    }
}

// Helper function to serialize product for client
function serializeProduct(product) {
  if (!product) return null;
  return {
    ...product,
    _id: product._id?.toString?.() || product._id,
    priceHistory: product.priceHistory?.map(ph => ({
      price: ph.price,
      date: ph.date?.toISOString?.() || new Date().toISOString()
    })) || [],
    // Serialize users array if it exists
    users: product.users?.map(u => ({
      email: u.email,
      _id: u._id?.toString?.() || u._id
    })) || [],
    createdAt: product.createdAt?.toISOString?.(),
    updatedAt: product.updatedAt?.toISOString?.(),
  };
}

export const getProductById = cache(async (productId) => {
    try {
      await connectToDB();
  
      const product = await Product.findOne({ _id: productId }).lean();
  
      if(!product) return null;
  
      return serializeProduct(product);
    } catch (error) {
      console.error('Error fetching product:', error);
      return null;
    }
});

export const getAllProducts = cache(async (limit = 20, skip = 0) => {
    try {
      await connectToDB();
  
      const products = await Product.find()
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip(skip)
        .lean();
  
      return products.map(serializeProduct);
    } catch (error) {
      console.error('Error fetching products:', error);
      return [];
    }
});

export const getSimilarProducts = cache(async (productId) => {
    try {
      await connectToDB();
  
      const currentProduct = await Product.findById(productId).lean();
  
      if(!currentProduct) return [];
  
      const similarProducts = await Product.find({
        _id: { $ne: productId },
        category: currentProduct.category,
      })
        .limit(4)
        .lean();
  
      return similarProducts;
    } catch (error) {
      console.error('Error fetching similar products:', error);
      return [];
    }
});


export async function addUserEmailToProduct(productId, userEmail, userId) {
  try {
    await connectToDB();
    
    const product = await Product.findById(productId);

    if (!product) {
      console.error('Product not found:', productId);
      return;
    }

    const userExists = product.users.some((user) => user.email === userEmail);

    if (!userExists) {
      product.users.push({ email: userEmail });
      await product.save();

      // If user is logged in, also add to their tracked products
      if (userId) {
        const user = await User.findById(userId);
        if (user) {
          const alreadyTracking = user.trackedProducts.some(
            (tp) => tp.product.toString() === productId
          );
          if (!alreadyTracking) {
            user.trackedProducts.push({
              product: productId,
              notifyEmail: userEmail,
            });
            await user.save();
          }
        }
      }

      const emailContent = await generateEmailBody(product, "WELCOME");
      
      console.log('Sending welcome email to:', userEmail);
      await sendEmail(emailContent, [userEmail]);
      console.log('Welcome email sent successfully to:', userEmail);
    } else {
      console.log('User already exists for this product:', userEmail);
    }
  } catch (error) {
    console.error('Error in addUserEmailToProduct:', error);
    throw error;
  }
}

export async function deleteProduct(productId) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user.isAdmin) {
      throw new Error('Unauthorized: Admin access required');
    }

    await connectToDB();
    
    const deletedProduct = await Product.findByIdAndDelete(productId);
    
    if (!deletedProduct) {
      throw new Error('Product not found');
    }
    
    revalidatePath('/');
    return { success: true, message: 'Product deleted successfully' };
  } catch (error) {
    console.error('Error deleting product:', error);
    throw error;
  }
}

export async function unsubscribeFromProduct(productId, userEmail) {
  try {
    await connectToDB();
    
    const product = await Product.findById(productId);
    
    if (!product) {
      throw new Error('Product not found');
    }
    
    product.users = product.users.filter(user => user.email !== userEmail);
    await product.save();
    
    return { success: true, message: 'Unsubscribed successfully' };
  } catch (error) {
    console.error('Error unsubscribing:', error);
    throw error;
  }
}

export async function clearAllProducts() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user.isAdmin) {
      throw new Error('Unauthorized: Admin access required');
    }

    await connectToDB();
    
    const result = await Product.deleteMany({});
    
    console.log(`Deleted ${result.deletedCount} products from database`);
    return { success: true, deletedCount: result.deletedCount };
  } catch (error) {
    console.error('Error clearing products:', error);
    throw error;
  }
}
