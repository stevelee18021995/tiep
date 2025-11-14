import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const LARAVEL_API_URL =
  process.env.LARAVEL_API_URL || "http://localhost:8000/api";

export interface ApiProxyConfig {
  requireAuth?: boolean;
  allowedMethods?: string[];
  rateLimitPerMinute?: number;
}

/**
 * Proxy request to Laravel API with security and validation
 */
export async function proxyToLaravel(
  request: NextRequest,
  endpoint: string,
  config: ApiProxyConfig = {}
) {
  const {
    requireAuth = false,
    allowedMethods = ["GET", "POST", "PUT", "DELETE"],
  } = config;

  try {
    // Kiểm tra method được phép
    if (!allowedMethods.includes(request.method)) {
      return NextResponse.json(
        { error: "Method not allowed" },
        { status: 405 }
      );
    }

    // Lấy headers từ request
    const requestHeaders = new Headers();

    // Copy các headers cần thiết từ request
    const contentType = request.headers.get("content-type");
    const userAgent = request.headers.get("user-agent");

    // Chỉ set Content-Type nếu không phải multipart/form-data
    // Browser sẽ tự động set với boundary cho FormData
    if (contentType && !contentType.includes("multipart/form-data")) {
      requestHeaders.set("Content-Type", contentType);
    }

    if (userAgent) {
      requestHeaders.set("User-Agent", userAgent);
    }

    // Lấy auth token từ cookies thay vì headers
    const cookieStore = await cookies();
    const authToken = cookieStore.get("auth_token")?.value;

    if (authToken) {
      requestHeaders.set("Authorization", `Bearer ${authToken}`);
    }

    // Thêm headers bảo mật
    requestHeaders.set("Accept", "application/json");
    requestHeaders.set("X-Requested-With", "XMLHttpRequest");

    // Xác thực nếu cần
    if (requireAuth && !authToken) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Lấy body nếu có
    let body = null;
    if (request.method !== "GET" && request.method !== "HEAD") {
      try {
        const contentType = request.headers.get("content-type");

        if (contentType && contentType.includes("multipart/form-data")) {
          // Đối với FormData, chúng ta cần chuyển tiếp directly
          body = await request.formData();
        } else {
          // Đối với JSON và text, sử dụng text()
          body = await request.text();
        }
      } catch (error) {
        console.error("Error reading request body:", error);
      }
    }

    // Tạo URL đầy đủ cho Laravel với query parameters
    const url = new URL(`${LARAVEL_API_URL}${endpoint}`);

    // Copy query parameters từ request
    const searchParams = request.nextUrl.searchParams;
    searchParams.forEach((value, key) => {
      url.searchParams.set(key, value);
    });

    // Gửi request đến Laravel
    const response = await fetch(url.toString(), {
      method: request.method,
      headers: requestHeaders,
      body,
    });

    // Lấy response data
    const responseText = await response.text();
    let responseData;

    try {
      responseData = JSON.parse(responseText);
    } catch {
      responseData = responseText;
    }

    // Trả về response với status và headers phù hợp
    return NextResponse.json(responseData, {
      status: response.status,
      headers: {
        "Content-Type": "application/json",
        // Thêm CORS headers nếu cần
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    });
  } catch (error) {
    console.error("[API Proxy] Error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        message:
          process.env.NODE_ENV === "development"
            ? (error as Error).message
            : undefined,
      },
      { status: 500 }
    );
  }
}

/**
 * Validate và sanitize request data
 */
export function validateRequestData(
  data: Record<string, unknown>,
  requiredFields: string[] = []
) {
  const errors: string[] = [];

  // Kiểm tra required fields
  for (const field of requiredFields) {
    if (!data[field]) {
      errors.push(`Field '${field}' is required`);
    }
  }

  // Sanitize string fields
  if (typeof data === "object" && data !== null) {
    for (const key in data) {
      if (typeof data[key] === "string") {
        // Loại bỏ script tags và HTML nguy hiểm
        data[key] = (data[key] as string)
          .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
          .replace(/<[^>]*>/g, "")
          .trim();
      }
    }
  }

  return { isValid: errors.length === 0, errors, sanitizedData: data };
}

/**
 * Extract JWT token từ Authorization header
 */
export function extractAuthToken(request: NextRequest): string | null {
  const authHeader = request.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }
  return authHeader.substring(7);
}

/**
 * Kiểm tra rate limiting (đơn giản)
 */
const requestCounts = new Map<string, { count: number; resetTime: number }>();

export function checkRateLimit(ip: string, limit: number = 60): boolean {
  const now = Date.now();
  const windowMs = 60 * 1000; // 1 phút

  const current = requestCounts.get(ip);

  if (!current || now > current.resetTime) {
    requestCounts.set(ip, { count: 1, resetTime: now + windowMs });
    return true;
  }

  if (current.count >= limit) {
    return false;
  }

  current.count++;
  return true;
}

/**
 * Get client IP address
 */
export function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  const realIP = request.headers.get("x-real-ip");

  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }

  if (realIP) {
    return realIP;
  }

  return "unknown";
}
