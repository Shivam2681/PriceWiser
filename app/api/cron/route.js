import { NextResponse } from "next/server";

import { getLowestPrice, getHighestPrice, getAveragePrice, getEmailNotifType } from "@/lib/utils";
import { connectToDB } from "@/lib/mongoose";
import Product from "@/lib/models/product.models";
import { scrapeAmazonProduct } from "@/lib/scraper";
import { generateEmailBody, sendEmail } from "@/lib/nodemailer";

export const maxDuration = 60; // This function can run for a maximum of 60 seconds
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

    await connectToDB();
    console.log('✅ Connected to database');

    const products = await Product.find({});
    console.log(`📦 Found ${products.length} products in database`);

    if (!products || products.length === 0) {
      console.log('⚠️ No products found');
      return NextResponse.json({ message: "No products found", data: [] });
    }

    // ======================== 1 SCRAPE LATEST PRODUCT DETAILS & UPDATE DB
    let emailsSent = 0;
    let productsProcessed = 0;
    
    const updatedProducts = await Promise.all(
      products.map(async (currentProduct) => {
        console.log(`\n🔍 Processing: ${currentProduct.title}`);
        
        // Scrape product
        const scrapedProduct = await scrapeAmazonProduct(currentProduct.url);

        if (!scrapedProduct) {
          console.log(`  ❌ Failed to scrape product`);
          return;
        }
        
        console.log(`  ✅ Scraped - Current price: ${scrapedProduct.currentPrice}, Users: ${currentProduct.users.length}`);

        const updatedPriceHistory = [
          ...currentProduct.priceHistory,
          {
            price: scrapedProduct.currentPrice,
            date: new Date(),
          },
        ];

        const product = {
          ...scrapedProduct,
          priceHistory: updatedPriceHistory,
          lowestPrice: getLowestPrice(updatedPriceHistory),
          highestPrice: getHighestPrice(updatedPriceHistory),
          averagePrice: getAveragePrice(updatedPriceHistory),
        };

        // Update Products in DB
        const updatedProduct = await Product.findOneAndUpdate(
          {
            url: product.url,
          },
          product
        );

        // ======================== 2 CHECK EACH PRODUCT'S STATUS & SEND EMAIL ACCORDINGLY
        const emailNotifType = getEmailNotifType(
          scrapedProduct,
          currentProduct
        );

        if (emailNotifType && updatedProduct.users.length > 0) {
          console.log(`  📧 Email notification type: ${emailNotifType}`);
          const productInfo = {
            title: updatedProduct.title,
            url: updatedProduct.url,
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
        } else {
          console.log(`  ✗ No email sent (type: ${emailNotifType || 'none'}, users: ${updatedProduct.users.length})`);
        }
        
        productsProcessed++;

        return updatedProduct;
      })
    );

    console.log(`\n📊 Cron job completed:`);
    console.log(`   Products processed: ${productsProcessed}/${products.length}`);
    console.log(`   Emails sent: ${emailsSent}`);

    return NextResponse.json({
      message: "Ok",
      productsProcessed,
      emailsSent,
      totalProducts: products.length,
    });
  } catch (error) {
    throw new Error(`Failed to get all products: ${error.message}`);
  }
}
