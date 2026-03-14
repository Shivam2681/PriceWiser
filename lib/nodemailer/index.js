"use server";

import { EmailContent, EmailProductInfo, NotificationType } from '@/types';
import { Resend } from 'resend';

// Initialize Resend
const resend = new Resend(process.env.RESEND_API_KEY);

const Notification = {
    WELCOME: 'WELCOME',
    CHANGE_OF_STOCK: 'CHANGE_OF_STOCK',
    LOWEST_PRICE: 'LOWEST_PRICE',
    THRESHOLD_MET: 'THRESHOLD_MET',
    UNTRACK: 'UNTRACK',
};

export async function generateEmailBody(product, type) {
    const THRESHOLD_PERCENTAGE = 10;
  
    // Shorten the product title
    const shortenedTitle =
      product.title.length > 20
        ? `${product.title.substring(0, 20)}...`
        : product.title;
  
    // Common email styles
    const emailStyles = `
      <style>
        .email-container { 
          max-width: 600px; 
          margin: 0 auto; 
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
          background-color: #f9fafb;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          overflow: hidden;
        }
        .header { 
          background-color: #ffffff; 
          padding: 32px 24px; 
          text-align: center; 
          border-bottom: 1px solid #e5e7eb;
        }
        .header h1 { 
          color: #111827; 
          margin: 0; 
          font-size: 24px; 
          font-weight: 700; 
          letter-spacing: -0.025em;
        }
        .header p { 
          color: #4b5563; 
          margin: 8px 0 0; 
          font-size: 16px; 
        }
        .content { 
          background-color: #ffffff; 
          padding: 32px 24px; 
        }
        .product-card { 
          background-color: #ffffff; 
          border-radius: 8px; 
          padding: 20px; 
          margin: 24px 0; 
          border: 1px solid #e5e7eb; 
          text-align: center;
        }
        .product-image-container {
          width: 200px;
          margin: 0 auto 20px;
        }
        .product-image { 
          width: 200px !important; 
          height: auto !important; 
          max-height: 200px;
          object-fit: contain; 
          border-radius: 4px; 
          display: block; 
          margin: 0 auto;
        }
        .product-title { 
          font-size: 18px; 
          font-weight: 600; 
          color: #111827; 
          margin: 0 0 16px; 
          line-height: 1.5; 
        }
        .price-info {
          margin: 16px 0;
        }
        .price-tag { 
          display: inline-block; 
          color: #111827; 
          font-size: 24px; 
          font-weight: 700; 
        }
        .discount-badge { 
          display: inline-block; 
          background-color: #ecfdf5; 
          color: #059669; 
          padding: 4px 12px; 
          border-radius: 9999px; 
          font-size: 14px; 
          font-weight: 600; 
          margin-left: 12px; 
          vertical-align: middle;
        }
        .original-price {
          color: #6b7280;
          text-decoration: line-through;
          font-size: 14px;
          margin-top: 4px;
        }
        .cta-button { 
          display: inline-block; 
          background-color: #2563eb; 
          color: #ffffff !important; 
          padding: 12px 24px; 
          border-radius: 6px; 
          text-decoration: none; 
          font-weight: 600; 
          font-size: 16px; 
          margin: 16px 0; 
        }
        .footer { 
          text-align: center; 
          padding: 24px; 
          background-color: #f9fafb;
          color: #6b7280; 
          font-size: 12px; 
          border-top: 1px solid #e5e7eb;
        }
        .divider { 
          height: 1px; 
          background-color: #e5e7eb; 
          margin: 24px 0; 
        }
        @media only screen and (max-width: 480px) {
          .content { padding: 24px 16px; }
          .product-card { padding: 16px; }
        }
      </style>
    `;
  
    let subject = '';
    let body = '';
  
    switch (type) {
      case Notification.WELCOME:
        subject = `Price tracking confirmed: ${shortenedTitle}`;
        body = `
          ${emailStyles}
          <div class="email-container">
            <div class="header">
              <h1>Monitoring Started</h1>
              <p>We'll notify you of any price changes</p>
            </div>
            <div class="content">
              <p style="font-size: 16px; color: #374151; line-height: 1.6;">Hello,</p>
              <p style="font-size: 16px; color: #374151; line-height: 1.6;">You are now tracking price updates for <strong>${product.title}</strong>. We will alert you if the price drops or if the item becomes available.</p>
              
                <div class="product-card">
                  <div style="text-align: center; margin-bottom: 20px;">
                    <img src="${product.image}" alt="${product.title}" style="width: 150px; height: auto; display: block; margin: 0 auto;" width="150" onerror="this.style.display='none'" />
                  </div>
                  <div class="product-title">${product.title}</div>
                  <a href="${product.url}" class="cta-button" target="_blank" rel="noopener noreferrer">View Product Details</a>
                </div>
              
              <div class="divider"></div>
              
              <h3 style="color: #111827; font-size: 16px; margin-bottom: 12px;">Notifications you'll receive:</h3>
              <ul style="color: #4b5563; line-height: 1.6; padding-left: 20px; font-size: 14px;">
                <li>Price reduction alerts</li>
                <li>Significant discount notifications</li>
                <li>Restock updates</li>
              </ul>
            </div>
            <div class="footer">
              <p>You received this email because you subscribed to price alerts on PriceWise.</p>
              <p style="margin-top: 8px;">&copy; 2026 PriceWise. All rights reserved.</p>
            </div>
          </div>
        `;
        break;
  
      case Notification.CHANGE_OF_STOCK:
        subject = `In Stock: ${shortenedTitle}`;
        body = `
          ${emailStyles}
          <div class="email-container">
            <div class="header">
              <h1>Product Back in Stock</h1>
              <p>The item you're tracking is now available</p>
            </div>
            <div class="content">
                <div class="product-card">
                  <div style="text-align: center; margin-bottom: 20px;">
                    <img src="${product.image}" alt="${product.title}" style="width: 150px; height: auto; display: block; margin: 0 auto;" width="150" onerror="this.style.display='none'" />
                  </div>
                  <div class="product-title">${product.title}</div>
                  <p style="color: #059669; font-weight: 600; font-size: 16px; margin: 0;">Status: Available Now</p>
                  <div style="margin-top: 20px;">
                    <a href="${product.url}" class="cta-button" target="_blank" rel="noopener noreferrer">View on Store</a>
                  </div>
                </div>
            </div>
            <div class="footer">
              <p>&copy; 2026 PriceWise. All rights reserved.</p>
            </div>
          </div>
        `;
        break;
  
      case Notification.LOWEST_PRICE:
        subject = `Price Drop: ${shortenedTitle}`;
        body = `
          ${emailStyles}
          <div class="email-container">
            <div class="header">
              <h1>New Price Update</h1>
              <p>We found a lower price for your tracked item</p>
            </div>
            <div class="content">
                <div class="product-card">
                  <div style="text-align: center; margin-bottom: 20px;">
                    <img src="${product.image}" alt="${product.title}" style="width: 150px; height: auto; display: block; margin: 0 auto;" width="150" onerror="this.style.display='none'" />
                  </div>
                  <div class="product-title">${product.title}</div>
                  <div class="price-info">
                    <span class="price-tag">${product.currency || '₹'}${product.currentPrice.toLocaleString()}</span>
                    <span class="discount-badge">New Lowest Price</span>
                  </div>
                  <div style="margin-top: 20px;">
                    <a href="${product.url}" class="cta-button" target="_blank" rel="noopener noreferrer">View Current Deal</a>
                  </div>
                </div>
              <p style="color: #6b7280; text-align: center; font-size: 14px;">This is the lowest price recorded since tracking began.</p>
            </div>
            <div class="footer">
              <p>&copy; 2026 PriceWise. All rights reserved.</p>
            </div>
          </div>
        `;
        break;
  
      case Notification.THRESHOLD_MET:
        subject = `Significant Price Reduction: ${shortenedTitle}`;
        body = `
          ${emailStyles}
          <div class="email-container">
            <div class="header">
              <h1>Price Reduction Alert</h1>
              <p>A significant price drop has been detected</p>
            </div>
            <div class="content">
                <div class="product-card">
                  <div style="text-align: center; margin-bottom: 20px;">
                    <img src="${product.image}" alt="${product.title}" style="width: 150px; height: auto; display: block; margin: 0 auto;" width="150" onerror="this.style.display='none'" />
                  </div>
                  <div class="product-title">${product.title}</div>
                  <div class="price-info">
                    ${product.currentPrice ? `<span class="price-tag">${product.currency || '₹'}${product.currentPrice.toLocaleString()}</span>` : ''}
                    ${product.discountRate ? `<span class="discount-badge">${product.discountRate}% Reduction</span>` : ''}
                    ${product.originalPrice ? `<div class="original-price">Previous: ${product.currency || '₹'}${product.originalPrice.toLocaleString()}</div>` : ''}
                  </div>
                  <div style="margin-top: 20px;">
                    <a href="${product.url}" class="cta-button" target="_blank" rel="noopener noreferrer">Check Availability</a>
                  </div>
                </div>
            </div>
            <div class="footer">
              <p>&copy; 2026 PriceWise. All rights reserved.</p>
            </div>
          </div>
        `;
        break;

      case Notification.UNTRACK:
        subject = `Monitoring Stopped: ${shortenedTitle}`;
        body = `
          ${emailStyles}
          <div class="email-container">
            <div class="header">
              <h1>Tracking Deactivated</h1>
              <p>You have stopped monitoring this product</p>
            </div>
            <div class="content">
              <p style="font-size: 16px; color: #374151; line-height: 1.6;">Hello,</p>
              <p style="font-size: 16px; color: #374151; line-height: 1.6;">Price monitoring for <strong>${product.title}</strong> has been successfully deactivated.</p>
              
                <div class="product-card" style="opacity: 0.8;">
                  <div style="text-align: center; margin-bottom: 20px;">
                    <img src="${product.image}" alt="${product.title}" style="width: 150px; height: auto; display: block; margin: 0 auto;" width="150" onerror="this.style.display='none'" />
                  </div>
                  <div class="product-title">${product.title}</div>
                  <p style="color: #6b7280; text-align: center; margin: 0; font-size: 14px;">Tracking Disabled</p>
                </div>
              
              <p style="color: #4b5563; line-height: 1.6; font-size: 14px;">You will no longer receive price or availability alerts for this item. You can re-enable tracking at any time by visiting the product page.</p>
              
              <div style="text-align: center; margin-top: 24px;">
                <a href="${product.url}" class="cta-button" style="background-color: #6b7280;">View Product</a>
              </div>
            </div>
            <div class="footer">
              <p>You received this because tracking was disabled for a product on PriceWise.</p>
              <p style="margin-top: 8px;">&copy; 2026 PriceWise. All rights reserved.</p>
            </div>
          </div>
        `;
        break;
  
      default:
        throw new Error("Invalid notification type.");
    }
  
    return { subject, body };
}
  
export const sendEmail = async (emailContent, sendTo) => {
    try {
        // Ensure sendTo is always an array
        const recipients = Array.isArray(sendTo) ? sendTo : [sendTo];
        
        console.log('Attempting to send email via Resend...');
        console.log('From:', process.env.EMAIL_FROM || 'PriceWise <onboarding@resend.dev>');
        console.log('To:', recipients);
        console.log('Subject:', emailContent.subject);
        
        const { data, error } = await resend.emails.send({
            from: process.env.EMAIL_FROM || 'PriceWise <onboarding@resend.dev>',
            to: recipients,
            subject: emailContent.subject,
            html: emailContent.body,
        });

        if (error) {
            console.error('Resend email sending failed:', error);
            console.error('Error details:', JSON.stringify(error, null, 2));
            
            // Provide helpful error messages
            if (error.statusCode === 401) {
                throw new Error('Resend API key is invalid. Please check your RESEND_API_KEY in .env file. Get one at https://resend.com/api-keys');
            } else if (error.statusCode === 403) {
                throw new Error('Resend API key does not have permission. Make sure your domain is verified in Resend dashboard.');
            } else if (error.name === 'validation_error') {
                throw new Error(`Resend validation error: ${error.message}. Check your API key and sender domain.`);
            }
            throw new Error(error.message);
        }

        console.log('Email sent successfully via Resend:', data);
        return data;
    } catch (error) {
        console.error('Email sending failed:', error);
        throw error;
    }
};
  