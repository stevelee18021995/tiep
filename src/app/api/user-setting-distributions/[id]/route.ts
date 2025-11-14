import { NextRequest } from "next/server";
import { proxyToLaravel } from "@/lib/apiProxy";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return proxyToLaravel(request, `/user-setting-distributions/${id}`, {
    requireAuth: true,
    allowedMethods: ["PUT"],
  });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return proxyToLaravel(request, `/user-setting-distributions/${id}`, {
    requireAuth: true,
    allowedMethods: ["DELETE"],
  });
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return proxyToLaravel(request, `/user-setting-distributions/${id}`, {
    requireAuth: true,
    allowedMethods: ["GET"],
  });
}
