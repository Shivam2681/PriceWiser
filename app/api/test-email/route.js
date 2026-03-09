import { NextResponse } from "next/server";
import { connectToDB } from "@/lib/mongoose";
import Product from "@/lib/models/product.models";
import { generateEmailBody, sendEmail } from "@/lib/nodemailer";

export const dynamic = "force-dynamic";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get("productId");
    const email = searchParams.get("email");

    if (!productId || !email) {
      return NextResponse.json({
        error: "Missing parameters. Use: ?productId=xxx&email=your@email.com"
      }, { status: 400 });
    }

    await connectToDB();

    // Find the product
    const product = await Product.findById(productId);
    
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Check if user is tracking this product
    const isTracking = product.users.some(u => u.email === email);
    
    if (!isTracking) {
      // Add user to product for testing
      product.users.push({ email });
      await product.save();
    }

    // Simulate a price drop scenario
    const simulatedPrice = Math.floor(product.currentPrice * 0.85); // 15% discount
    const simulatedDiscount = 15;

    console.log("=== TEST EMAIL TRIGGERED ===");
    console.log(`Product: ${product.title}`);
    console.log(`Original Price: ${product.currentPrice}`);
    console.log(`Simulated Price: ${simulatedPrice}`);
    console.log(`Simulated Discount: ${simulatedDiscount}%`);
    console.log(`User: ${email}`);

    // Create test product info
    const testProduct = {
      title: product.title,
      url: product.url,
      image: product.image,
      currency: product.currency,
      currentPrice: simulatedPrice,
      originalPrice: product.originalPrice,
      discountRate: simulatedDiscount,
    };

    // Generate email content
    const emailContent = await generateEmailBody(testProduct, "THRESHOLD_MET");

    console.log("Email Subject:", emailContent.subject);

    // Send the email
    await sendEmail(emailContent, [email]);

    console.log("✓ Test email sent successfully!");
    console.log("============================");

    return NextResponse.json({
      success: true,
      message: "Test email sent!",
      details: {
        product: product.title,
        originalPrice: product.currentPrice,
        simulatedPrice,
        discount: `${simulatedDiscount}%`,
        sentTo: email,
      }
    });

  } catch (error) {
    console.error("Test email failed:", error);
    return NextResponse.json({
      error: "Failed to send test email",
      message: error.message,
    }, { status: 500 });
  }
}
