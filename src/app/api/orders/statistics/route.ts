import { NextRequest, NextResponse } from "next/server";

const LARAVEL_API_URL =
  process.env.LARAVEL_API_URL || "http://localhost:8000/api";

export async function GET(request: NextRequest) {
  try {
    const response = await fetch(`${LARAVEL_API_URL}/orders/statistics`, {
      method: "GET",
      headers: {
        Authorization: request.headers.get("Authorization") || "",
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `HTTP error! status: ${response.status}, body: ${errorText}`
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Order statistics API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch order statistics" },
      { status: 500 }
    );
  }
}
