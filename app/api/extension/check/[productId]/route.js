import { NextResponse } from 'next/server';
import { connectToDB } from '@/lib/mongoose';
import Product from '@/lib/models/product.models';
import { getSession } from '@/lib/auth';

/**
 * GET /api/extension/check/:productId
 * Check if product is already being tracked
 * 
 * @param {Request} req
 * @param {Object} context
 * @returns {Promise<NextResponse>}
 */
export async function GET(req, { params }) {
  try {
    // Verify authentication
    const session = await getSession(req);
    
    if (!session?.user) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { productId } = params;

    if (!productId) {
      return NextResponse.json(
        { message: 'Product ID required' },
        { status: 400 }
      );
    }

    // Connect to database
    await connectToDB();
    console.log('[Extension API] Checking track status for productId:', productId, 'user:', session.user.email);

    if (!productId || productId === 'undefined' || productId === 'null') {
      console.warn('[Extension API] Invalid productId received');
      return NextResponse.json({ isTracked: false, product: null });
    }

    // Check if product exists by productId
    const product = await Product.findOne({
      productId
    });

    if (!product) {
      console.log('[Extension API] Product not found in database:', productId);
      return NextResponse.json({ isTracked: false, product: null });
    }

    // If product exists, check if the current user is already tracking it
    // A user is tracking it if their email is in the product's users array
    const userEmail = session.user.email;
    if (!userEmail) {
      console.warn('[Extension API] No email in session, cannot verify track status');
      return NextResponse.json({ 
        isTracked: false, 
        product: {
          id: product._id,
          title: product.title,
          currentPrice: product.currentPrice,
          url: product.url
        } 
      });
    }

    const isTracked = product.users.some(u => u.email && u.email.toLowerCase() === userEmail.toLowerCase());
    console.log('[Extension API] Track status for', userEmail, ':', isTracked);

    return NextResponse.json({
      isTracked,
      product: {
        id: product._id,
        title: product.title,
        currentPrice: product.currentPrice,
        url: product.url
      }
    });

  } catch (error) {
    console.error('[Extension] Check error:', error);
    
    return NextResponse.json(
      { message: 'Failed to check product', error: error.message },
      { status: 500 }
    );
  }
}
