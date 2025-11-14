import { NextRequest, NextResponse } from "next/server";

const LARAVEL_API_URL =
  process.env.LARAVEL_API_URL || "http://localhost:8000/api";

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();

    const response = await fetch(`${LARAVEL_API_URL}/notifications/multiple`, {
      method: "DELETE",
      headers: {
        Authorization: request.headers.get("Authorization") || "",
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Delete multiple notifications API error:", error);
    return NextResponse.json(
      { error: "Failed to delete multiple notifications" },
      { status: 500 }
    );
  }
}
