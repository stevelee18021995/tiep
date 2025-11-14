import { NextRequest } from "next/server";
import { proxyToLaravel, validateRequestData } from "@/lib/apiProxy";

const validateCategoryId = (id: string) => {
  return id && !isNaN(Number(id));
};

const handleError = (context: string, error: unknown) => {
  console.error(`[Category ${context}] Error:`, error);
  return Response.json({ error: "Internal server error" }, { status: 500 });
};

// GET single category
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (!validateCategoryId(id)) {
    return Response.json({ error: "Invalid category ID" }, { status: 400 });
  }
  try {
    return await proxyToLaravel(request, `/categories/${id}`, {
      allowedMethods: ["GET"],
      requireAuth: true,
    });
  } catch (error) {
    return handleError("GET", error);
  }
}

// PUT update category
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (!validateCategoryId(id)) {
    return Response.json({ error: "Invalid category ID" }, { status: 400 });
  }
  try {
    const body = await request.json();
    const { isValid, errors, sanitizedData } = validateRequestData(body, [
      "name",
    ]);
    if (!isValid) {
      return Response.json(
        { error: "Validation failed", details: errors },
        { status: 400 }
      );
    }
    const categoryName = sanitizedData.name as string;
    if (categoryName.length < 2 || categoryName.length > 100) {
      return Response.json(
        { error: "Category name must be between 2 and 100 characters" },
        { status: 400 }
      );
    }
    const newRequest = new NextRequest(request.url, {
      method: "PUT",
      body: JSON.stringify(sanitizedData),
      headers: {
        "Content-Type": "application/json",
        Authorization: request.headers.get("authorization") || "",
      },
    });
    return await proxyToLaravel(newRequest, `/categories/${id}`, {
      allowedMethods: ["PUT"],
      requireAuth: true,
    });
  } catch (error) {
    return handleError("PUT", error);
  }
}

// DELETE category
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (!validateCategoryId(id)) {
    return Response.json({ error: "Invalid category ID" }, { status: 400 });
  }
  try {
    return await proxyToLaravel(request, `/categories/${id}`, {
      allowedMethods: ["DELETE"],
      requireAuth: true,
    });
  } catch (error) {
    return handleError("DELETE", error);
  }
}
