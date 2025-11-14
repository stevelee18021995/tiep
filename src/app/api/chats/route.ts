import { NextRequest } from "next/server";
import { proxyToLaravel } from "@/lib/apiProxy";

export async function GET(request: NextRequest) {
  try {
    return await proxyToLaravel(request, "/chats", {
      allowedMethods: ["GET"],
      requireAuth: true,
    });
  } catch (error) {
    console.error("Error fetching chats:", error);
    return Response.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log("POST /api/chats - Proxying to Laravel...");
    const response = await proxyToLaravel(request, "/chats", {
      allowedMethods: ["POST"],
      requireAuth: true,
    });

    // Log response for debugging
    const clonedResponse = response.clone();
    const responseData = await clonedResponse.json();
    console.log("Laravel response:", responseData);

    return response;
  } catch (error) {
    console.error("Error creating chat:", error);
    return Response.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
