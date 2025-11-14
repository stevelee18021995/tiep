import { NextRequest } from "next/server";
import { proxyToLaravel } from "@/lib/apiProxy";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return proxyToLaravel(request, `/membership-upgrade-requests/${id}/reject`, {
    requireAuth: true,
    allowedMethods: ["POST"],
  });
}
