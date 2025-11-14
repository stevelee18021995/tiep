import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Gọi đến Laravel backend
    const laravelApiUrl = process.env.LARAVEL_API_URL;

    if (!laravelApiUrl) {
      throw new Error("LARAVEL_API_URL is not configured");
    }

    const response = await fetch(`${laravelApiUrl}/send-message`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data.message || "Failed to submit 2FA code" },
        { status: response.status }
      );
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("Submit 2FA API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
