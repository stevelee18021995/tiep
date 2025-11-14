import { NextRequest } from "next/server";
import { proxyToLaravel } from "@/lib/apiProxy";

// PUT toggle object category active status (admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const response = await proxyToLaravel(
      request,
      `/object-categories/${id}/toggle-active`,
      {
        allowedMethods: ["PUT"],
        requireAuth: true,
      }
    );

    return response;
  } catch (error) {
    console.error("[Object Category Toggle Active] Error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
