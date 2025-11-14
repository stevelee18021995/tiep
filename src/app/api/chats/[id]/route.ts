import { NextRequest } from "next/server";
import { proxyToLaravel } from "@/lib/apiProxy";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id || isNaN(Number(id))) {
      return Response.json({ error: "Invalid chat ID" }, { status: 400 });
    }

    return await proxyToLaravel(request, `/chats/${id}`, {
      allowedMethods: ["GET"],
      requireAuth: true,
    });
  } catch (error) {
    console.error("Error fetching chat:", error);
    return Response.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id || isNaN(Number(id))) {
      return Response.json({ error: "Invalid chat ID" }, { status: 400 });
    }

    return await proxyToLaravel(request, `/chats/${id}`, {
      allowedMethods: ["DELETE"],
      requireAuth: true,
    });
  } catch (error) {
    console.error("Error deleting chat:", error);
    return Response.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
