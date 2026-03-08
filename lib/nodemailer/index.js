"use server";

import { EmailContent, EmailProductInfo, NotificationType } from '@/types';
import nodemailer from 'nodemailer';

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
        .email-container { max-width: 600px; margin: 0 auto; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center; border-radius: 12px 12px 0 0; }
        .header h1 { color: white; margin: 0; font-size: 28px; font-weight: 700; }
        .header p { color: rgba(255,255,255,0.9); margin: 10px 0 0; font-size: 16px; }
        .content { background: #ffffff; padding: 40px 30px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
        .product-card { background: #f8fafc; border-radius: 12px; padding: 24px; margin: 24px 0; border: 1px solid #e2e8f0; }
        .product-image { width: 100%; max-width: 300px; height: 200px; object-fit: contain; border-radius: 8px; background: white; display: block; margin: 0 auto 16px; }
        .product-title { font-size: 20px; font-weight: 600; color: #1e293b; margin: 0 0 12px; line-height: 1.4; }
        .price-tag { display: inline-block; background: #dc2626; color: white; padding: 8px 16px; border-radius: 20px; font-size: 18px; font-weight: 700; margin: 8px 0; }
        .discount-badge { display: inline-block; background: #22c55e; color: white; padding: 4px 12px; border-radius: 12px; font-size: 14px; font-weight: 600; margin-left: 8px; }
        .cta-button { display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 16px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px; margin: 16px 0; }
        .cta-button:hover { opacity: 0.9; }
        .footer { text-align: center; padding: 24px; color: #64748b; font-size: 14px; }
        .divider { height: 1px; background: #e2e8f0; margin: 24px 0; }
        .highlight { color: #667eea; font-weight: 600; }
      </style>
    `;
  
    let subject = '';
    let body = '';
  
    switch (type) {
      case Notification.WELCOME:
        subject = `🚀 Welcome to Price Tracking for ${shortenedTitle}`;
        body = `
          ${emailStyles}
          <div class="email-container">
            <div class="header">
              <h1>Welcome to PriceWise! 🎉</h1>
              <p>Smart Price Tracking for Smart Shoppers</p>
            </div>
            <div class="content">
              <p style="font-size: 16px; color: #334155; line-height: 1.6;">Hi there! 👋</p>
              <p style="font-size: 16px; color: #334155; line-height: 1.6;">You're now tracking <span class="highlight">${product.title}</span>. We'll notify you when the price drops or the product comes back in stock.</p>
              
              <div class="product-card">
                <img src="${product.image}" alt="${product.title}" class="product-image" onerror="this.style.display='none'" />
                <div class="product-title">${product.title}</div>
                <div style="text-align: center;">
                  <a href="${product.url}" class="cta-button" target="_blank" rel="noopener noreferrer">View Product</a>
                </div>
              </div>
              
              <div class="divider"></div>
              
              <h3 style="color: #1e293b; font-size: 18px; margin-bottom: 16px;">📧 Here's what you'll receive:</h3>
              <ul style="color: #475569; line-height: 1.8; padding-left: 20px;">
                <li>Instant alerts when price drops</li>
                <li>Lowest price ever notifications</li>
                <li>Back in stock alerts</li>
                <li>Discount threshold alerts (10%+)</li>
              </ul>
              
              <p style="color: #64748b; font-size: 14px; margin-top: 24px;">Stay tuned for amazing deals! 🛍️</p>
            </div>
            <div class="footer">
              <p>You're receiving this because you signed up for PriceWise price tracking.</p>
              <p style="margin-top: 8px;">© 2026 PriceWise. All rights reserved.</p>
            </div>
          </div>
        `;
        break;
  
      case Notification.CHANGE_OF_STOCK:
        subject = `📦 ${shortenedTitle} is back in stock!`;
        body = `
          ${emailStyles}
          <div class="email-container">
            <div class="header">
              <h1>Back in Stock! 🎉</h1>
              <p>Don't miss out this time</p>
            </div>
            <div class="content">
              <div class="product-card">
                <img src="${product.image}" alt="${product.title}" class="product-image" onerror="this.style.display='none'" />
                <div class="product-title">${product.title}</div>
                <p style="color: #22c55e; font-weight: 600; font-size: 16px;">✅ Now Available</p>
                <div style="text-align: center; margin-top: 20px;">
                  <a href="${product.url}" class="cta-button" target="_blank" rel="noopener noreferrer">Buy Now</a>
                </div>
              </div>
              <p style="color: #64748b; text-align: center; font-size: 14px;">Hurry! Popular items sell out quickly.</p>
            </div>
            <div class="footer">
              <p>© 2026 PriceWise. All rights reserved.</p>
            </div>
          </div>
        `;
        break;
  
      case Notification.LOWEST_PRICE:
        subject = `🔥 Lowest Price Alert: ${shortenedTitle}`;
        body = `
          ${emailStyles}
          <div class="email-container">
            <div class="header">
              <h1>Lowest Price Ever! 🔥</h1>
              <p>This is the best deal we've tracked</p>
            </div>
            <div class="content">
              <div class="product-card">
                <img src="${product.image}" alt="${product.title}" class="product-image" onerror="this.style.display='none'" />
                <div class="product-title">${product.title}</div>
                ${product.currentPrice ? `<div class="price-tag">${product.currency || '₹'}${product.currentPrice.toLocaleString()}</div>` : ''}
                <p style="color: #dc2626; font-weight: 600; margin-top: 12px;">🏆 All-Time Low Price!</p>
                <div style="text-align: center; margin-top: 20px;">
                  <a href="${product.url}" class="cta-button" target="_blank" rel="noopener noreferrer">Grab the Deal</a>
                </div>
              </div>
              <p style="color: #64748b; text-align: center; font-size: 14px;">Based on our price history tracking</p>
            </div>
            <div class="footer">
              <p>© 2026 PriceWise. All rights reserved.</p>
            </div>
          </div>
        `;
        break;
  
      case Notification.THRESHOLD_MET:
        subject = `💰 ${product.discountRate}% Off: ${shortenedTitle}`;
        body = `
          ${emailStyles}
          <div class="email-container">
            <div class="header">
              <h1>Great Discount Available! 💰</h1>
              <p>Save big on your tracked product</p>
            </div>
            <div class="content">
              <div class="product-card">
                <img src="${product.image}" alt="${product.title}" class="product-image" onerror="this.style.display='none'" />
                <div class="product-title">${product.title}</div>
                <div style="margin: 16px 0;">
                  ${product.currentPrice ? `<span class="price-tag">${product.currency || '₹'}${product.currentPrice.toLocaleString()}</span>` : ''}
                  ${product.discountRate ? `<span class="discount-badge">${product.discountRate}% OFF</span>` : ''}
                </div>
                ${product.originalPrice ? `<p style="color: #64748b; text-decoration: line-through; margin: 8px 0;">MRP: ${product.currency || '₹'}${product.originalPrice.toLocaleString()}</p>` : ''}
                <div style="text-align: center; margin-top: 20px;">
                  <a href="${product.url}" class="cta-button" target="_blank" rel="noopener noreferrer">Shop Now</a>
                </div>
              </div>
              <p style="color: #64748b; text-align: center; font-size: 14px;">Discounts this good don't last long!</p>
            </div>
            <div class="footer">
              <p>© 2026 PriceWise. All rights reserved.</p>
            </div>
          </div>
        `;
        break;

      case Notification.UNTRACK:
        subject = `👋 You've stopped tracking ${shortenedTitle}`;
        body = `
          ${emailStyles}
          <div class="email-container">
            <div class="header" style="background: linear-gradient(135deg, #64748b 0%, #475569 100%);">
              <h1>Product Untracked</h1>
              <p>You've stopped price tracking for this item</p>
            </div>
            <div class="content">
              <p style="font-size: 16px; color: #334155; line-height: 1.6;">Hi there! 👋</p>
              <p style="font-size: 16px; color: #334155; line-height: 1.6;">You've successfully stopped tracking <span class="highlight">${product.title}</span>.</p>
              
              <div class="product-card" style="opacity: 0.7;">
                <img src="${product.image}" alt="${product.title}" class="product-image" onerror="this.style.display='none'" />
                <div class="product-title">${product.title}</div>
                <p style="color: #64748b; text-align: center; margin-top: 12px;">❌ No longer tracking price changes</p>
              </div>
              
              <div class="divider"></div>
              
              <p style="color: #475569; line-height: 1.6;">You will no longer receive price alerts for this product. If you change your mind, you can always track it again by visiting the product page.</p>
              
              <div style="text-align: center; margin-top: 24px;">
                <a href="${product.url}" class="cta-button" target="_blank" rel="noopener noreferrer" style="background: linear-gradient(135deg, #64748b 0%, #475569 100%);">View Product</a>
              </div>
              
              <p style="color: #64748b; font-size: 14px; margin-top: 24px; text-align: center;">Looking for more deals? Track other products on PriceWise! 🛍️</p>
            </div>
            <div class="footer">
              <p>You're receiving this because you stopped tracking a product on PriceWise.</p>
              <p style="margin-top: 8px;">© 2026 PriceWise. All rights reserved.</p>
            </div>
          </div>
        `;
        break;
  
      default:
        throw new Error("Invalid notification type.");
    }
  
    return { subject, body };
}
  
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
});
  
export const sendEmail = async (emailContent, sendTo) => {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: sendTo,
      html: emailContent.body,
      subject: emailContent.subject,
    };
  
    return new Promise((resolve, reject) => {
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error('Email sending failed:', error);
          reject(error);
        } else {
          console.log('Email sent successfully:', info);
          resolve(info);
        }
      });
    });
};
  