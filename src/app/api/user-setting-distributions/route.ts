import { NextRequest } from "next/server";
import { proxyToLaravel } from "@/lib/apiProxy";

export async function POST(request: NextRequest) {
  return proxyToLaravel(request, "/user-setting-distributions", {
    requireAuth: true,
    allowedMethods: ["POST"],
  });
}

export async function GET(request: NextRequest) {
  // Extract user_id from query params and build the endpoint
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("user_id");

  if (!userId) {
    return proxyToLaravel(request, "/user-setting-distributions", {
      requireAuth: true,
      allowedMethods: ["GET"],
    });
  }

  return proxyToLaravel(request, `/users/${userId}/distributions`, {
    requireAuth: true,
    allowedMethods: ["GET"],
  });
}
