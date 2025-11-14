import { NextRequest } from "next/server";
import { proxyToLaravel, validateRequestData } from "@/lib/apiProxy";

// GET single product
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const response = await proxyToLaravel(request, `/products/${id}`, {
      allowedMethods: ["GET"],
      requireAuth: true,
    });

    return response;
  } catch (error) {
    console.error("[Product GET] Error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PUT update product
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    // Check if request contains FormData (for file uploads)
    const contentType = request.headers.get("content-type");

    if (contentType?.includes("multipart/form-data")) {
      // Handle FormData for file uploads
      const response = await proxyToLaravel(request, `/products/${id}`, {
        allowedMethods: ["PUT", "PATCH"],
        requireAuth: true,
      });

      return response;
    } else {
      // Handle JSON data
      const body = await request.json();
      const { isValid, errors, sanitizedData } = validateRequestData(body, [
        "name",
        "price",
      ]);

      if (!isValid) {
        return Response.json(
          { error: "Validation failed", details: errors },
          { status: 400 }
        );
      }

      // Additional validation for product
      const productName = sanitizedData.name as string;
      const price = sanitizedData.price as number;

      if (productName.length < 2 || productName.length > 255) {
        return Response.json(
          { error: "Product name must be between 2 and 255 characters" },
          { status: 400 }
        );
      }

      if (price <= 0) {
        return Response.json(
          { error: "Price must be greater than 0" },
          { status: 400 }
        );
      }

      const response = await proxyToLaravel(
        new NextRequest(request.url, {
          method: "PUT",
          body: JSON.stringify(sanitizedData),
          headers: {
            "Content-Type": "application/json",
            Authorization: request.headers.get("authorization") || "",
          },
        }),
        `/products/${id}`,
        {
          allowedMethods: ["PUT"],
          requireAuth: true,
        }
      );

      return response;
    }
  } catch (error) {
    console.error("[Product PUT] Error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE product
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const response = await proxyToLaravel(request, `/products/${id}`, {
      allowedMethods: ["DELETE"],
      requireAuth: true,
    });

    return response;
  } catch (error) {
    console.error("[Product DELETE] Error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST update product (method spoofing support)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    // Handle FormData for file uploads with method spoofing
    const response = await proxyToLaravel(request, `/products/${id}`, {
      allowedMethods: ["POST"],
      requireAuth: true,
    });

    return response;
  } catch (error) {
    console.error("[Product POST] Error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
