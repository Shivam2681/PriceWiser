// Test script to verify email notifications
// Run with: node test-email.js

const { generateEmailBody, sendEmail } = require('./lib/nodemailer');

async function testEmail() {
  const testProduct = {
    title: "Test Product - iPhone 15",
    url: "https://www.amazon.in/test-product",
    currentPrice: 50000,
    originalPrice: 60000,
    discountRate: 16, // 16% discount (> 10% threshold)
  };

  // Test THRESHOLD_MET notification
  const emailContent = await generateEmailBody(testProduct, "THRESHOLD_MET");
  
  console.log("Email Subject:", emailContent.subject);
  console.log("\nEmail Body:", emailContent.body);
  
  // Uncomment to actually send email:
  // await sendEmail(emailContent, ["your-email@gmail.com"]);
  // console.log("Email sent!");
}

testEmail().catch(console.error);
