import { NextRequest } from "next/server";
import { proxyToLaravel } from "@/lib/apiProxy";

// GET single user by ID (admin only)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const response = await proxyToLaravel(request, `/users/${id}`, {
      allowedMethods: ["GET"],
      requireAuth: true,
    });

    return response;
  } catch (error) {
    console.error("[User GET] Error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PUT update user by ID (admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const response = await proxyToLaravel(request, `/users/${id}`, {
      allowedMethods: ["PUT"],
      requireAuth: true,
    });

    return response;
  } catch (error) {
    console.error("[User PUT] Error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PATCH update user by ID (admin only)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const response = await proxyToLaravel(request, `/users/${id}`, {
      allowedMethods: ["PATCH"],
      requireAuth: true,
    });

    return response;
  } catch (error) {
    console.error("[User PATCH] Error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE user by ID (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const response = await proxyToLaravel(request, `/users/${id}`, {
      allowedMethods: ["DELETE"],
      requireAuth: true,
    });

    return response;
  } catch (error) {
    console.error("[User DELETE] Error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
