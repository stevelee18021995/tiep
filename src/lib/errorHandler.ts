/**
 * Error handling utilities for Next.js frontend
 */

export interface ApiError {
  message: string;
  error_type?: string;
  debug?: any;
  response?: Response;
  data?: any;
}

/**
 * Extract readable error message from various error types
 */
export function getErrorMessage(error: any): string {
  // If error has a data property with message (from our custom API service)
  if (error?.data?.message) {
    return error.data.message;
  }

  // If error has a message property (standard JS Error)
  if (error?.message) {
    return error.message;
  }

  // If error is a string
  if (typeof error === "string") {
    return error;
  }

  // Default fallback
  return "Đã xảy ra lỗi không xác định";
}

/**
 * Handle API errors and show appropriate toast messages
 */
export function handleApiError(
  error: any,
  defaultMessage: string = "Đã xảy ra lỗi"
): string {
  const message = getErrorMessage(error);

  // Log detailed error for debugging
  console.error("API Error:", {
    message,
    error_type: error?.data?.error_type,
    debug: error?.data?.debug,
    full_error: error,
  });

  return message || defaultMessage;
}

/**
 * Check if error is related to insufficient balance
 */
export function isInsufficientBalanceError(error: any): boolean {
  const message = getErrorMessage(error).toLowerCase();
  return message.includes("số dư") && message.includes("không đủ");
}

/**
 * Check if error is related to daily limit
 */
export function isDailyLimitError(error: any): boolean {
  const message = getErrorMessage(error).toLowerCase();
  return message.includes("giới hạn") && message.includes("ngày");
}

/**
 * Check if error is related to product availability
 */
export function isProductAvailabilityError(error: any): boolean {
  const message = getErrorMessage(error).toLowerCase();
  return (
    message.includes("sản phẩm") &&
    (message.includes("không có") || message.includes("hết hàng"))
  );
}
