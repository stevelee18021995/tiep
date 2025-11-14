import { NextRequest } from 'next/server';
import { proxyToLaravel, validateRequestData, checkRateLimit, getClientIP } from '@/lib/apiProxy';

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const clientIP = getClientIP(request);
    if (!checkRateLimit(clientIP, 5)) { // 5 registrations per minute
      return Response.json(
        { error: 'Too many registration attempts. Please try again later.' },
        { status: 429 }
      );
    }

    // Validate request data
    const body = await request.json();
    const { isValid, errors, sanitizedData } = validateRequestData(body, ['name', 'email', 'password', 'password_confirmation']);
    
    if (!isValid) {
      return Response.json(
        { error: 'Validation failed', details: errors },
        { status: 400 }
      );
    }

    // Additional validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(sanitizedData.email as string)) {
      return Response.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    if (sanitizedData.password !== sanitizedData.password_confirmation) {
      return Response.json(
        { error: 'Password confirmation does not match' },
        { status: 400 }
      );
    }

    if ((sanitizedData.password as string).length < 8) {
      return Response.json(
        { error: 'Password must be at least 8 characters long' },
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
      '/register',
      {
        allowedMethods: ['POST'],
        requireAuth: false,
      }
    );

    return response;

  } catch (error) {
    console.error('[Auth Register] Error:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
