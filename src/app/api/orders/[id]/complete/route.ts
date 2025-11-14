import { proxyToLaravel } from "@/lib/apiProxy";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const response = await proxyToLaravel(request, `/orders/${id}/complete`, {
      allowedMethods: ["POST"],
      requireAuth: true,
    });
    return response;
  } catch (error) {
    console.error("Complete order API error:", error);
    return NextResponse.json(
      { error: "Failed to complete order" },
      { status: 500 }
    );
  }
}
