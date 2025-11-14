import { proxyToLaravel } from "@/lib/apiProxy";
import { NextRequest } from "next/server";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    return await proxyToLaravel(request, `/notifications/${id}`, {
      allowedMethods: ["DELETE"],
      requireAuth: false,
    });
  } catch (error) {
    console.error("Delete notification API error:", error);
    return Response.json(
      { error: "Failed to delete notification" },
      { status: 500 }
    );
  }
}
