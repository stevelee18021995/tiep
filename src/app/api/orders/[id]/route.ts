import { proxyToLaravel } from "@/lib/apiProxy";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const response = await proxyToLaravel(request, `/orders/${id}`, {
      allowedMethods: ["GET"],
      requireAuth: true,
    });
    return response;
  } catch (error) {
    console.error("Order details API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch order details" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const response = await proxyToLaravel(request, `/orders/${id}`, {
      allowedMethods: ["DELETE"],
      requireAuth: true,
    });
    return response;
  } catch (error) {
    console.error("Order delete API error:", error);
    return NextResponse.json(
      { error: "Failed to delete order" },
      { status: 500 }
    );
  }
}
