import { NextResponse } from 'next/server';
import { connectToDB } from '@/lib/mongoose';
import Product from '@/lib/models/product.models';
import { getSession } from '@/lib/auth';
import { scrapeProduct } from '@/lib/scraper';
import { addUserEmailToProduct } from '@/lib/actions';
import { createInitialPriceStats, normalizeProductPayload } from '@/lib/utils/productNormalization';

export const dynamic = "force-dynamic";

/**
 * POST /api/extension/track
 * Track product data from Chrome extension
 * 
 * @param {Request} req
 * @returns {Promise<NextResponse>}
 */
export async function POST(req) {
  try {
    // Verify authentication
    const session = await getSession(req);
    console.log('[Extension API] Track request received for user:', session?.user?.email);
    
    if (!session?.user) {
      console.warn('[Extension API] Unauthorized track attempt');
      return NextResponse.json(
        { message: 'Unauthorized. Please login.' },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await req.json();
    const { url, productId, source, userEmail } = body;
    console.log('[Extension API] Track data:', { productId, url });

    // Validate required fields
    if (!productId || !source || !url) {
      return NextResponse.json(
        { message: 'Missing required fields: productId, source, url' },
        { status: 400 }
      );
    }

    // Connect to database
    await connectToDB();

    const extensionPayload = normalizeProductPayload(body, { url, productId, source });
    let normalizedProduct = null;
    if (source === 'amazon') {
      // Perform a full scrape to get all required data (images, category, description etc)
      // This makes the extension tracking as rich as the website tracking
      console.log(`[Extension] Performing full scrape for: ${url}`);
      const scrapedProduct = await scrapeProduct(url);
      
      if (!scrapedProduct) {
        throw new Error('Failed to scrape product data');
      }

      normalizedProduct = normalizeProductPayload(scrapedProduct, extensionPayload);
    } else {
      normalizedProduct = extensionPayload;
    }

    if (!normalizedProduct.url) {
      normalizedProduct.url = url;
    }

    if (!normalizedProduct.productId) {
      normalizedProduct.productId = productId;
    }

    if (!normalizedProduct.source) {
      normalizedProduct.source = source;
    }

    const priceStats = createInitialPriceStats(
      normalizedProduct.currentPrice,
      normalizedProduct.originalPrice
    );

    // Find existing product by URL or productId
    let product = await Product.findOne({
      $or: [
        { url: normalizedProduct.url },
        { productId }
      ]
    });

    if (product) {
      console.log(`[Extension] Product already exists: ${productId}`);
      
      // Update price history if it's a new price
      if (normalizedProduct.currentPrice > 0 && product.currentPrice !== normalizedProduct.currentPrice) {
        product.priceHistory.push({
          price: normalizedProduct.currentPrice,
          date: new Date()
        });
        
        // Update price stats
        const prices = product.priceHistory.map(p => p.price).filter(p => p > 0);
        product.lowestPrice = Math.min(...prices);
        product.highestPrice = Math.max(...prices);
        product.averagePrice = prices.reduce((sum, p) => sum + p, 0) / prices.length;
        
        product.currentPrice = normalizedProduct.currentPrice;
      }
      
      // Update other fields from scrape
      product.title = normalizedProduct.title || product.title;
      product.image = normalizedProduct.image || product.image;
      product.category = normalizedProduct.category || product.category;
      product.currency = normalizedProduct.currency || product.currency;
      product.discountRate = normalizedProduct.discountRate ?? product.discountRate;
      product.reviewsCount = normalizedProduct.reviewsCount ?? product.reviewsCount;
      product.isOutOfStock = normalizedProduct.isOutOfStock ?? product.isOutOfStock;
      product.originalPrice = normalizedProduct.originalPrice || product.originalPrice;
      
      await product.save();
    } else {
      // Create new product with full scraped data
      console.log(`[Extension] Creating new product with full data: ${productId}`);
      
      product = await Product.create({
        ...normalizedProduct,
        ...priceStats,
        userId: session.user.id, // Keep track who added it
      });
    }

    // If email is provided, set up email tracking
    if (userEmail && userEmail !== 'extension-sync@pricewiser.com') {
      console.log(`[Extension] Adding email tracking for: ${userEmail}`);
      await addUserEmailToProduct(product._id, userEmail, session.user.id);
    }

    return NextResponse.json({
      success: true,
      message: 'Product synced successfully',
      product: product
    });

  } catch (error) {
    console.error('[Extension] Track error:', error);
    
    return NextResponse.json(
      { message: 'Failed to track product', error: error.message },
      { status: 500 }
    );
  }
}
