import { NextRequest } from 'next/server';
import { proxyToLaravel } from '@/lib/apiProxy';

// GET user statistics (admin only)
export async function GET(request: NextRequest) {
  try {
    const response = await proxyToLaravel(
      request,
      '/users-statistics',
      {
        allowedMethods: ['GET'],
        requireAuth: true,
      }
    );

    return response;

  } catch (error) {
    console.error('[Users Statistics] Error:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
