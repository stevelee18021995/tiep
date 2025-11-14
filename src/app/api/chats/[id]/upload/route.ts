import { NextRequest } from "next/server";
import { proxyToLaravel } from "@/lib/apiProxy";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id || isNaN(Number(id))) {
      return Response.json({ error: "Invalid chat ID" }, { status: 400 });
    }

    return await proxyToLaravel(request, `/chats/${id}/upload`, {
      allowedMethods: ["POST"],
      requireAuth: true,
    });
  } catch (error) {
    console.error("Error uploading file:", error);
    return Response.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
