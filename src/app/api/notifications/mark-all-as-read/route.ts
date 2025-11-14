import { proxyToLaravel } from "@/lib/apiProxy";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const response = await proxyToLaravel(
      request,
      `/notifications/mark-all-as-read`,
      {
        allowedMethods: ["POST"],
        requireAuth: false,
      }
    );
    return response;
  } catch (error) {
    console.error("Mark all as read API error:", error);
    return NextResponse.json(
      { error: "Failed to mark all notifications as read" },
      { status: 500 }
    );
  }
}
