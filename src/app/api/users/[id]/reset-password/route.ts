import { NextRequest } from "next/server";
import { proxyToLaravel } from "@/lib/apiProxy";

// POST reset user password (admin only)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const response = await proxyToLaravel(
      request,
      `/users/${id}/reset-password`,
      {
        allowedMethods: ["POST"],
        requireAuth: true,
      }
    );

    return response;
  } catch (error) {
    console.error("[User Reset Password] Error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
