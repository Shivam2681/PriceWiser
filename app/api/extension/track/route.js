import { NextResponse } from 'next/server';
import { connectToDB } from '@/lib/mongoose';
import Product from '@/lib/models/product.models';
import { getSession } from '@/lib/auth';
import { scrapeProduct } from '@/lib/scraper';
import { addUserEmailToProduct } from '@/lib/actions';

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

    // Perform a full scrape to get all required data (images, category, description etc)
    // This makes the extension tracking as rich as the website tracking
    console.log(`[Extension] Performing full scrape for: ${url}`);
    const scrapedProduct = await scrapeProduct(url);
    
    if (!scrapedProduct) {
      throw new Error('Failed to scrape product data');
    }

    // Find existing product by URL or productId
    let product = await Product.findOne({
      $or: [
        { url: scrapedProduct.url },
        { productId }
      ]
    });

    if (product) {
      console.log(`[Extension] Product already exists: ${productId}`);
      
      // Update price history if it's a new price
      if (scrapedProduct.currentPrice > 0 && product.currentPrice !== scrapedProduct.currentPrice) {
        product.priceHistory.push({
          price: scrapedProduct.currentPrice,
          date: new Date()
        });
        
        // Update price stats
        const prices = product.priceHistory.map(p => p.price).filter(p => p > 0);
        product.lowestPrice = Math.min(...prices);
        product.highestPrice = Math.max(...prices);
        product.averagePrice = prices.reduce((sum, p) => sum + p, 0) / prices.length;
        
        product.currentPrice = scrapedProduct.currentPrice;
      }
      
      // Update other fields from scrape
      product.title = scrapedProduct.title || product.title;
      product.image = scrapedProduct.image || product.image;
      product.category = scrapedProduct.category || product.category;
      product.isOutOfStock = scrapedProduct.isOutOfStock;
      
      await product.save();
    } else {
      // Create new product with full scraped data
      console.log(`[Extension] Creating new product with full data: ${productId}`);
      
      product = await Product.create({
        ...scrapedProduct,
        productId,
        source,
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
