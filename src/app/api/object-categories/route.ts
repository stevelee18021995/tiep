import { NextRequest } from 'next/server';
import { proxyToLaravel } from '@/lib/apiProxy';

// GET all object categories
export async function GET(request: NextRequest) {
  try {
    const response = await proxyToLaravel(
      request,
      '/object-categories',
      {
        allowedMethods: ['GET'],
        requireAuth: true,
      }
    );

    return response;

  } catch (error) {
    console.error('[Object Categories GET] Error:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST create new object category
export async function POST(request: NextRequest) {
  try {
    const response = await proxyToLaravel(
      request,
      '/object-categories',
      {
        allowedMethods: ['POST'],
        requireAuth: true,
      }
    );

    return response;

  } catch (error) {
    console.error('[Object Categories POST] Error:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
