import { proxyToLaravel } from "@/lib/apiProxy";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const queryString = searchParams.toString();
    const response = await proxyToLaravel(
      request,
      `/notifications${queryString ? `?${queryString}` : ""}`,
      {
        allowedMethods: ["GET"],
        requireAuth: true,
      }
    );

    return response;
  } catch (error) {
    console.error("Notifications API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch notifications" },
      { status: 500 }
    );
  }
}
