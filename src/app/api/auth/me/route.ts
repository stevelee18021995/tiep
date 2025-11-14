import { NextRequest } from 'next/server';
import { proxyToLaravel } from '@/lib/apiProxy';

export async function GET(request: NextRequest) {
  try {
    // Get current user info - requires authentication
    const response = await proxyToLaravel(
      request,
      '/me',
      {
        allowedMethods: ['GET'],
        requireAuth: true,
      }
    );

    return response;

  } catch (error) {
    console.error('[Auth Me] Error:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
