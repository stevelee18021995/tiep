import { NextRequest } from 'next/server';
import { proxyToLaravel, validateRequestData } from '@/lib/apiProxy';

// GET single object category
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Validate ID
    if (!id || isNaN(Number(id))) {
      return Response.json(
        { error: 'Invalid object category ID' },
        { status: 400 }
      );
    }

    const response = await proxyToLaravel(
      request,
      `/object-categories/${id}`,
      {
        allowedMethods: ['GET'],
        requireAuth: true,
      }
    );

    return response;

  } catch (error) {
    console.error('[Object Category GET] Error:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT update object category
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Validate ID
    if (!id || isNaN(Number(id))) {
      return Response.json(
        { error: 'Invalid object category ID' },
        { status: 400 }
      );
    }

    // Validate request data
    const body = await request.json();
    const { isValid, errors, sanitizedData } = validateRequestData(body, ['name', 'category_id']);
    
    if (!isValid) {
      return Response.json(
        { error: 'Validation failed', details: errors },
        { status: 400 }
      );
    }

    // Additional validation
    const objectCategoryName = sanitizedData.name as string;
    if (objectCategoryName.length < 2 || objectCategoryName.length > 100) {
      return Response.json(
        { error: 'Object category name must be between 2 and 100 characters' },
        { status: 400 }
      );
    }

    if (isNaN(Number(sanitizedData.category_id))) {
      return Response.json(
        { error: 'Invalid category ID' },
        { status: 400 }
      );
    }

    const response = await proxyToLaravel(
      new NextRequest(request.url, {
        method: 'PUT',
        body: JSON.stringify(sanitizedData),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': request.headers.get('authorization') || '',
        },
      }),
      `/object-categories/${id}`,
      {
        allowedMethods: ['PUT'],
        requireAuth: true,
      }
    );

    return response;

  } catch (error) {
    console.error('[Object Category PUT] Error:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE object category
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Validate ID
    if (!id || isNaN(Number(id))) {
      return Response.json(
        { error: 'Invalid object category ID' },
        { status: 400 }
      );
    }

    const response = await proxyToLaravel(
      request,
      `/object-categories/${id}`,
      {
        allowedMethods: ['DELETE'],
        requireAuth: true,
      }
    );

    return response;

  } catch (error) {
    console.error('[Object Category DELETE] Error:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
