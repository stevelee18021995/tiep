import { NextRequest } from 'next/server';
import { proxyToLaravel, validateRequestData, checkRateLimit, getClientIP } from '@/lib/apiProxy';

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const clientIP = getClientIP(request);
    if (!checkRateLimit(clientIP, 10)) { // 10 requests per minute for login
      return Response.json(
        { error: 'Too many login attempts. Please try again later.' },
        { status: 429 }
      );
    }

    // Validate request data
    const body = await request.json();
    const { isValid, errors, sanitizedData } = validateRequestData(body, ['email', 'password']);
    
    if (!isValid) {
      return Response.json(
        { error: 'Validation failed', details: errors },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(sanitizedData.email as string)) {
      return Response.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Proxy to Laravel
    const response = await proxyToLaravel(
      new NextRequest(request.url, {
        method: 'POST',
        body: JSON.stringify(sanitizedData),
        headers: {
          'Content-Type': 'application/json',
        },
      }),
      '/login',
      {
        allowedMethods: ['POST'],
        requireAuth: false,
      }
    );

    return response;

  } catch (error) {
    console.error('[Auth Login] Error:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
