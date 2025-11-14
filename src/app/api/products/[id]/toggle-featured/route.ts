import { NextRequest } from "next/server";
import { proxyToLaravel } from "@/lib/apiProxy";

// PUT toggle product featured status
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const response = await proxyToLaravel(
      request,
      `/products/${id}/toggle-featured`,
      {
        allowedMethods: ["PUT"],
        requireAuth: true,
      }
    );

    return response;
  } catch (error) {
    console.error("[Product Toggle Featured] Error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
