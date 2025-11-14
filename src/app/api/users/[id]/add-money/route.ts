import { NextRequest } from "next/server";
import { proxyToLaravel } from "@/lib/apiProxy";

// POST add money to user account (admin only)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const response = await proxyToLaravel(request, `/users/${id}/add-money`, {
      allowedMethods: ["POST"],
      requireAuth: true,
    });

    return response;
  } catch (error) {
    console.error("[User Add Money] Error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
