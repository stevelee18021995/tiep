import { NextRequest } from "next/server";
import { proxyToLaravel } from "@/lib/apiProxy";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    // Proxy to Laravel
    const response = await proxyToLaravel(
      request,
      `/notifications/${id}/mark-as-read`,
      {
        allowedMethods: ["POST"],
        requireAuth: false,
      }
    );
    return response;
  } catch (error) {
    console.error("Mark as read API error:", error);
    return Response.json(
      { error: "Failed to mark notification as read" },
      { status: 500 }
    );
  }
}
