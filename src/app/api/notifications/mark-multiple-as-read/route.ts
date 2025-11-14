import { proxyToLaravel } from "@/lib/apiProxy";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    return proxyToLaravel(request, `/notifications/mark-multiple-as-read`, {
      allowedMethods: ["POST"],
      requireAuth: false,
    });
  } catch (error) {
    console.error("Mark multiple as read API error:", error);
    return NextResponse.json(
      { error: "Failed to mark multiple notifications as read" },
      { status: 500 }
    );
  }
}
