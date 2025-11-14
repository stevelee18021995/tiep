import { NextRequest } from 'next/server';
import { proxyToLaravel } from '@/lib/apiProxy';

// GET all users (admin only)
export async function GET(request: NextRequest) {
  try {
    const response = await proxyToLaravel(
      request,
      '/users',
      {
        allowedMethods: ['GET'],
        requireAuth: true,
      }
    );

    return response;

  } catch (error) {
    console.error('[Users GET] Error:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST create user (admin only)
export async function POST(request: NextRequest) {
  try {
    const response = await proxyToLaravel(
      request,
      '/users',
      {
        allowedMethods: ['POST'],
        requireAuth: true,
      }
    );

    return response;

  } catch (error) {
    console.error('[Users POST] Error:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
