import { NextResponse } from "next/server";

import { getUpdatedPriceData, getEmailNotifType } from "@/lib/utils";
import { connectToDB } from "@/lib/mongoose";
import Product from "@/lib/models/product.models";
import { scrapeAmazonProduct } from "@/lib/scraper";
import { generateEmailBody, sendEmail, Notification } from "@/lib/nodemailer";
import { generateAndStoreAIInsights } from "@/lib/services/aiService";

// Helper function to add delay between scrapes
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const maxDuration = 60; // Set to 60 seconds (max for Hobby plan) to ensure safe processing
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request) {
  try {
    // Verify cron secret to prevent unauthorized access
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('🚀 Cron job started at:', new Date().toISOString());
    const startTime = Date.now();
    const TIMEOUT_BUFFER = 50000; // 50 seconds (leave 10s for response/cleanup)

    await connectToDB();
    console.log('✅ Connected to database');

    // Sort by updatedAt to process oldest (stalest) products first
    const products = await Product.find({}).sort({ updatedAt: 1 });
    console.log(`📦 Found ${products.length} products in database`);

    if (!products || products.length === 0) {
      console.log('⚠️ No products found');
      return NextResponse.json({ message: "No products found", data: [] });
    }

    // Process products sequentially with a small delay to avoid rate limiting
    let emailsSent = 0;
    let productsProcessed = 0;
    const updatedProductsList = [];
    
    for (const currentProduct of products) {
        // Check if we are approaching the 60s timeout
        const elapsedTime = Date.now() - startTime;
        if (elapsedTime > TIMEOUT_BUFFER) {
          console.log(`\n⏳ Breaking loop to avoid timeout. Elapsed: ${Math.round(elapsedTime / 1000)}s. Remaining products: ${products.length - productsProcessed}`);
          break;
        }

        console.log(`\n🔍 Processing (${productsProcessed + 1}/${products.length}): ${currentProduct.title}`);
        
        // Add a small delay between scrapes (e.g., 1 second)
        if (productsProcessed > 0) await delay(1000);

        // Scrape product
        const scrapedProduct = await scrapeAmazonProduct(currentProduct.url);

        if (!scrapedProduct) {
          console.log(`  ❌ Failed to scrape product`);
          productsProcessed++;
          continue;
        }
        
        console.log(`  ✅ Scraped - Current price: ${scrapedProduct.currentPrice}, Users: ${currentProduct.users.length}`);

        // Only update price history and stats if we got a valid price
        let updatedData;
        
        if (scrapedProduct.currentPrice && scrapedProduct.currentPrice > 0) {
          // Use shared utility for price history and stats with valid price
          const { priceHistory, lowestPrice, highestPrice, averagePrice } = 
            getUpdatedPriceData(currentProduct.priceHistory, scrapedProduct.currentPrice);

          updatedData = {
            ...scrapedProduct,
            priceHistory,
            lowestPrice,
            highestPrice,
            averagePrice,
          };
          
          console.log(`  📊 Price stats updated - Lowest: ₹${lowestPrice}, Highest: ₹${highestPrice}, Avg: ₹${averagePrice}`);
        } else {
          // Scraped price is invalid (zero/pending), keep existing price history and stats
          console.log(`  ⚠️  Invalid scraped price (₹${scrapedProduct.currentPrice}), preserving existing stats`);
          
          updatedData = {
            ...scrapedProduct,
            currentPrice: currentProduct.currentPrice, // Keep old price
            priceHistory: currentProduct.priceHistory, // Keep old history
            lowestPrice: currentProduct.lowestPrice,   // Keep old lowest
            highestPrice: currentProduct.highestPrice, // Keep old highest
            averagePrice: currentProduct.averagePrice, // Keep old average
          };
        }

        // Update Products in DB
        const updatedProduct = await Product.findOneAndUpdate(
          {
            url: scrapedProduct.url,
          },
          updatedData,
          { new: true }
        );

        // ======================== 2 CHECK EACH PRODUCT'S STATUS & SEND EMAIL ACCORDINGLY
        const emailNotifType = getEmailNotifType(
          scrapedProduct,
          currentProduct
        );

        if (emailNotifType && updatedProduct.users.length > 0) {
          console.log(`  📧 Email notification type: ${emailNotifType}`);
          
          // Calculate actual discount percentage based on previous price (for THRESHOLD_MET)
          let emailDiscountRate = updatedProduct.discountRate;
          if (emailNotifType === Notification.THRESHOLD_MET) {
            const lastHistoricalPrice = currentProduct.priceHistory[currentProduct.priceHistory.length - 1]?.price || currentProduct.currentPrice;
            if (lastHistoricalPrice > 0 && updatedProduct.currentPrice > 0) {
              emailDiscountRate = Math.round(((lastHistoricalPrice - updatedProduct.currentPrice) / lastHistoricalPrice) * 100);
              console.log(`  💰 Calculated discount: ${emailDiscountRate}% (from ₹${lastHistoricalPrice} to ₹${updatedProduct.currentPrice})`);
            }
          }
          
          const productInfo = {
            title: updatedProduct.title,
            url: updatedProduct.url,
            image: updatedProduct.image,
            currency: updatedProduct.currency,
            currentPrice: updatedProduct.currentPrice,
            originalPrice: updatedProduct.originalPrice,
            discountRate: emailDiscountRate, // Use calculated discount for threshold emails
          };
          // Construct emailContent
          const emailContent = await generateEmailBody(productInfo, emailNotifType);
          // Get an array of user emails
          const userEmails = updatedProduct.users.map((user) => user.email);
          console.log(`  📨 Sending email to ${userEmails.length} users:`, userEmails);
          // Send email notification
          await sendEmail(emailContent, userEmails);
          emailsSent++;
          console.log(`  ✓ Email sent successfully!`);
        }
        
        updatedProductsList.push(updatedProduct);
        productsProcessed++;
    }

    console.log(`\n✅ Cron job completed! Processed: ${productsProcessed}, Emails sent: ${emailsSent}`);
    
    return NextResponse.json({
      message: "Cron job completed successfully",
      processed: productsProcessed,
      emailsSent
    });
  } catch (error) {
    console.error('❌ Cron job error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
