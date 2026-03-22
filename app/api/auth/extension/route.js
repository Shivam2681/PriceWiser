import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

/**
 * GET /api/auth/extension
 * Check if user is authenticated and return JWT token for extension use
 */
export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      console.log('[Extension Auth] No active session found');
      return NextResponse.json(
        { 
          isAuthenticated: false,
          message: 'Not authenticated'
        },
        { status: 401 }
      );
    }

    // Get the JWT token from cookies
    const cookieToken = req.cookies.get('next-auth.session-token')?.value;
    
    if (!cookieToken) {
      console.log('[Extension Auth] No cookie token found');
      return NextResponse.json(
        { 
          isAuthenticated: false,
          message: 'No session token found'
        },
        { status: 401 }
      );
    }

    console.log('[Extension Auth] Session valid, token found for user:', session.user.email);

    // We already verified the session is valid via getServerSession
    // No need to verify the JWT again - just return it
    return NextResponse.json({
      isAuthenticated: true,
      token: cookieToken, // Return the actual JWT token
      user: {
        id: session.user.id,
        email: session.user.email,
        name: session.user.name,
      },
      hasToken: true,
    });

  } catch (error) {
    console.error('[Extension Auth] Error:', error);
    return NextResponse.json(
      { 
        isAuthenticated: false,
        message: 'Server error',
        error: error.message 
      },
      { status: 500 }
    );
  }
}
