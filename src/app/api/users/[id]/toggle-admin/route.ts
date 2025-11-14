import { NextRequest } from "next/server";
import { proxyToLaravel } from "@/lib/apiProxy";

// PUT toggle admin status (admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const response = await proxyToLaravel(
      request,
      `/users/${id}/toggle-admin`,
      {
        allowedMethods: ["PUT"],
        requireAuth: true,
      }
    );

    return response;
  } catch (error) {
    console.error("[User Toggle Admin] Error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
