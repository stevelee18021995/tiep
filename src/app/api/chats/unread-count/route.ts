import { NextRequest } from "next/server";
import { proxyToLaravel } from "@/lib/apiProxy";

export async function GET(request: NextRequest) {
  try {
    return await proxyToLaravel(request, "/chats/unread-count", {
      allowedMethods: ["GET"],
      requireAuth: true,
    });
  } catch (error) {
    console.error("Error fetching unread count:", error);
    return Response.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
