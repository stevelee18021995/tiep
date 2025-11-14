import { proxyToLaravel } from "@/lib/apiProxy";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const response = await proxyToLaravel(
      request,
      `/notifications/${id}/mark-as-unread`,
      {
        allowedMethods: ["POST"],
        requireAuth: false,
      }
    );
    return response;
  } catch (error) {
    console.error("Mark as unread API error:", error);
    return NextResponse.json(
      { error: "Failed to mark notification as unread" },
      { status: 500 }
    );
  }
}
