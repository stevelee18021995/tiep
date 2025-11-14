import { NextRequest } from 'next/server';
import { proxyToLaravel, validateRequestData } from '@/lib/apiProxy';

// GET all products
export async function GET(request: NextRequest) {
  try {
    const response = await proxyToLaravel(
      request,
      '/products',
      {
        allowedMethods: ['GET'],
        requireAuth: true,
      }
    );

    return response;

  } catch (error) {
    console.error('[Products GET] Error:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST create new product
export async function POST(request: NextRequest) {
  try {
    // Check if request contains FormData (for file uploads)
    const contentType = request.headers.get('content-type');
    
    if (contentType?.includes('multipart/form-data')) {
      // Handle FormData for file uploads
      const response = await proxyToLaravel(
        request,
        '/products',
        {
          allowedMethods: ['POST'],
          requireAuth: true,
        }
      );

      return response;
    } else {
      // Handle JSON data
      const body = await request.json();
      const { isValid, errors, sanitizedData } = validateRequestData(body, ['name', 'price']);
      
      if (!isValid) {
        return Response.json(
          { error: 'Validation failed', details: errors },
          { status: 400 }
        );
      }

      // Additional validation for product
      const productName = sanitizedData.name as string;
      const price = sanitizedData.price as number;
      
      if (productName.length < 2 || productName.length > 255) {
        return Response.json(
          { error: 'Product name must be between 2 and 255 characters' },
          { status: 400 }
        );
      }

      if (price <= 0) {
        return Response.json(
          { error: 'Price must be greater than 0' },
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
        '/products',
        {
          allowedMethods: ['POST'],
          requireAuth: true,
        }
      );

      return response;
    }

  } catch (error) {
    console.error('[Products POST] Error:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
