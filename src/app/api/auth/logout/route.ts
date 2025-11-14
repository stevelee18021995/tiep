import { NextRequest } from 'next/server';
import { proxyToLaravel } from '@/lib/apiProxy';

export async function POST(request: NextRequest) {
  try {
    // Proxy to Laravel - logout endpoint thường cần authentication
    const response = await proxyToLaravel(
      request,
      '/logout',
      {
        allowedMethods: ['POST'],
        requireAuth: true,
      }
    );

    return response;

  } catch (error) {
    console.error('[Auth Logout] Error:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
