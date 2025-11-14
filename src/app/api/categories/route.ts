import { NextRequest } from 'next/server';
import { proxyToLaravel, validateRequestData } from '@/lib/apiProxy';

// GET all categories
export async function GET(request: NextRequest) {
  try {
    const response = await proxyToLaravel(
      request,
      '/categories',
      {
        allowedMethods: ['GET'],
        requireAuth: true,
      }
    );

    return response;

  } catch (error) {
    console.error('[Categories GET] Error:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST create new category
export async function POST(request: NextRequest) {
  try {
    // Validate request data
    const body = await request.json();
    const { isValid, errors, sanitizedData } = validateRequestData(body, ['name']);
    
    if (!isValid) {
      return Response.json(
        { error: 'Validation failed', details: errors },
        { status: 400 }
      );
    }

    // Additional validation for category name
    const categoryName = sanitizedData.name as string;
    if (categoryName.length < 2 || categoryName.length > 100) {
      return Response.json(
        { error: 'Category name must be between 2 and 100 characters' },
        { status: 400 }
      );
    }

    const response = await proxyToLaravel(
      new NextRequest(request.url, {
        method: 'POST',
        body: JSON.stringify(sanitizedData),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': request.headers.get('authorization') || '',
        },
      }),
      '/categories',
      {
        allowedMethods: ['POST'],
        requireAuth: true,
      }
    );

    return response;

  } catch (error) {
    console.error('[Categories POST] Error:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
