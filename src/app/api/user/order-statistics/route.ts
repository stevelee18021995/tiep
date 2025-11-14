import { proxyToLaravel } from "@/lib/apiProxy";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  try {
    return await proxyToLaravel(request, `/user/order-statistics`, {
      allowedMethods: ["GET"],
      requireAuth: true,
    });
  } catch (error) {
    console.error("User order statistics API error:", error);
    return Response.json(
      { error: "Failed to fetch user order statistics" },
      { status: 500 }
    );
  }
}
