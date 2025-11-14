import { NextRequest } from "next/server";
import { proxyToLaravel, validateRequestData } from "@/lib/apiProxy";

// GET user profile
export async function GET(request: NextRequest) {
  try {
    const response = await proxyToLaravel(request, "/me", {
      allowedMethods: ["GET"],
      requireAuth: true,
    });

    return response;
  } catch (error) {
    console.error("[Profile GET] Error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PATCH update user profile
export async function PATCH(request: NextRequest) {
  try {
    console.log("[Profile PATCH] Starting request");

    // Validate request data
    const body = await request.json();
    console.log("[Profile PATCH] Request body:", body);

    const { isValid, errors, sanitizedData } = validateRequestData(body, [
      "name",
      "email",
    ]);

    if (!isValid) {
      console.log("[Profile PATCH] Validation failed:", errors);
      return Response.json(
        { error: "Validation failed", details: errors },
        { status: 422 }
      );
    }

    // Email validation
    const email = sanitizedData.email as string;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.log("[Profile PATCH] Invalid email format:", email);
      return Response.json({ error: "Invalid email format" }, { status: 422 });
    }

    console.log("[Profile PATCH] Sending to Laravel:", sanitizedData);

    const response = await proxyToLaravel(
      new NextRequest(request.url, {
        method: "PATCH",
        body: JSON.stringify(sanitizedData),
        headers: {
          "Content-Type": "application/json",
          Authorization: request.headers.get("authorization") || "",
        },
      }),
      "/user/profile",
      {
        allowedMethods: ["PATCH"],
        requireAuth: true,
      }
    );

    console.log("[Profile PATCH] Laravel response status:", response.status);
    return response;
  } catch (error) {
    console.error("[Profile PATCH] Error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
