import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Helper function to parse user data from cookie
function getUserFromCookie(userDataCookie: string | undefined): {
  isAdmin: boolean;
  userData: Record<string, unknown> | null;
} {
  if (!userDataCookie || userDataCookie.trim() === "") {
    return { isAdmin: false, userData: null };
  }

  try {
    const userData = JSON.parse(userDataCookie);
    return {
      isAdmin: userData.is_admin === 1 || userData.is_admin === true,
      userData,
    };
  } catch (error) {
    console.error("[Middleware] Invalid user data cookie:", error);
    return { isAdmin: false, userData: null };
  }
}

// Helper function to create redirect URL
function createRedirectUrl(
  request: NextRequest,
  path: string,
  params?: Record<string, string>
): URL {
  const url = new URL(path, request.url);
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.set(key, value);
    });
  }
  return url;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Handle API CORS
  if (pathname.startsWith("/api/")) {
    if (request.method === "OPTIONS") {
      return new NextResponse(null, {
        status: 200,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
          "Access-Control-Allow-Headers":
            "Content-Type, Authorization, X-Requested-With",
          "Access-Control-Max-Age": "86400",
        },
      });
    }

    const response = NextResponse.next();
    response.headers.set("Access-Control-Allow-Origin", "*");
    response.headers.set("X-Content-Type-Options", "nosniff");
    response.headers.set("X-Frame-Options", "DENY");
    response.headers.set("X-XSS-Protection", "1; mode=block");
    return response;
  }

  // Get auth data
  const token = request.cookies.get("auth_token")?.value;
  const userDataCookie = request.cookies.get("user_data")?.value;
  const { isAdmin } = getUserFromCookie(userDataCookie);

  // Admin route protection
  if (pathname.startsWith("/admin")) {
    if (!token) {
      return NextResponse.redirect(
        createRedirectUrl(request, "/login", { redirect: pathname })
      );
    }

    if (!isAdmin) {
      return NextResponse.redirect(
        createRedirectUrl(request, "/login", {
          redirect: pathname,
          error: "admin_required",
        })
      );
    }

    return NextResponse.next();
  }

  // Auth pages redirect
  if (["/login", "/register"].includes(pathname) && token) {
    const redirectPath = isAdmin ? "/admin/users" : "/member/dashboard";
    return NextResponse.redirect(createRedirectUrl(request, redirectPath));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|public/).*)"],
};
