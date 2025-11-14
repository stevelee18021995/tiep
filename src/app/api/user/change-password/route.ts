import { NextRequest } from 'next/server';
import { proxyToLaravel, validateRequestData } from '@/lib/apiProxy';

// POST change password
export async function POST(request: NextRequest) {
  try {
    // Get the request body
    const body = await request.json();
    const { current_password, new_password, new_password_confirmation } = body;

    // Validation
    const { isValid, errors } = validateRequestData(body, ['current_password', 'new_password', 'new_password_confirmation']);
    
    if (!isValid) {
      return Response.json(
        { error: 'Validation failed', details: errors },
        { status: 422 }
      );
    }

    if (new_password !== new_password_confirmation) {
      return Response.json(
        { error: 'Password confirmation does not match' },
        { status: 422 }
      );
    }

    if (new_password.length < 8) {
      return Response.json(
        { error: 'New password must be at least 8 characters' },
        { status: 422 }
      );
    }

    const response = await proxyToLaravel(
      new NextRequest(request.url, {
        method: 'POST',
        body: JSON.stringify({
          current_password,
          new_password,
          new_password_confirmation
        }),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': request.headers.get('authorization') || '',
        },
      }),
      '/user/change-password',
      {
        allowedMethods: ['POST'],
        requireAuth: true,
      }
    );

    return response;

  } catch (error) {
    console.error('[Change Password] Error:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
