import { NextRequest } from "next/server";
import { proxyToLaravel } from "@/lib/apiProxy";

export async function GET(request: NextRequest) {
  return proxyToLaravel(
    request,
    "/user-setting-distributions/products/available",
    {
      requireAuth: true,
      allowedMethods: ["GET"],
    }
  );
}
