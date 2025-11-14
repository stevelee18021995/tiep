/* eslint-disable no-debugger */
"use client";

import { useEffect } from "react";

export function useDevToolsProtection() {
  useEffect(() => {
    const isDebug = process.env.NEXT_PUBLIC_IS_DEBUG === "true";

    // Nếu đang ở chế độ debug, không làm gì cả
    if (isDebug) {
      return;
    }

    // Chặn chuột phải
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      return false;
    };

    // Chặn các phím tắt debug
    const handleKeyDown = (e: KeyboardEvent) => {
      // F12
      if (e.key === "F12") {
        e.preventDefault();
        return false;
      }

      // Ctrl+Shift+I hoặc Cmd+Option+I (Mac)
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === "I") {
        e.preventDefault();
        return false;
      }

      // Ctrl+Shift+J hoặc Cmd+Option+J (Mac)
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === "J") {
        e.preventDefault();
        return false;
      }

      // Ctrl+Shift+C hoặc Cmd+Option+C (Mac)
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === "C") {
        e.preventDefault();
        return false;
      }

      // Ctrl+U hoặc Cmd+U (View source)
      if ((e.ctrlKey || e.metaKey) && e.key === "U") {
        e.preventDefault();
        return false;
      }

      // Ctrl+S hoặc Cmd+S (Save page)
      if ((e.ctrlKey || e.metaKey) && (e.key === "s" || e.key === "S")) {
        e.preventDefault();
        return false;
      }
    };

    // Detect DevTools đang mở - Chỉ dùng phương pháp an toàn
    const detectDevTools = () => {
      // Phương pháp 1: Kiểm tra kích thước window (desktop)
      const threshold = 160;
      const widthThreshold = window.outerWidth - window.innerWidth > threshold;
      const heightThreshold =
        window.outerHeight - window.innerHeight > threshold;

      if (widthThreshold || heightThreshold) {
        window.location.href = "https://www.facebook.com";
        return true;
      }

      // Phương pháp 2: Kiểm tra Firebug
      if (
        (window as any).Firebug &&
        (window as any).Firebug.chrome &&
        (window as any).Firebug.chrome.isInitialized
      ) {
        window.location.href = "https://www.facebook.com";
        return true;
      }

      // Phương pháp 3: Kiểm tra devtools property
      if ((window as any).devtools && (window as any).devtools.open) {
        window.location.href = "https://www.facebook.com";
        return true;
      }

      return false;
    };

    // Detect DevTools bằng debugger timing - An toàn hơn
    let checkCount = 0;
    const detectDevToolsByDebugger = () => {
      const start = performance.now();
      debugger; // DevTools detection
      const end = performance.now();

      // Chỉ redirect nếu chênh lệch thời gian > 200ms và đã check nhiều lần
      if (end - start > 200) {
        checkCount++;
        if (checkCount > 2) {
          window.location.href = "https://www.facebook.com";
        }
      } else {
        checkCount = 0;
      }
    };

    // Thêm event listeners
    document.addEventListener("contextmenu", handleContextMenu);
    document.addEventListener("keydown", handleKeyDown);

    // Kiểm tra DevTools ban đầu
    detectDevTools();

    // Kiểm tra định kỳ - chỉ dùng các phương pháp an toàn
    const interval = setInterval(() => {
      detectDevTools();
      detectDevToolsByDebugger();
    }, 1000); // Tăng interval lên 1000ms để tránh false positive

    // Kiểm tra khi resize
    window.addEventListener("resize", detectDevTools);

    // Cleanup
    return () => {
      document.removeEventListener("contextmenu", handleContextMenu);
      document.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("resize", detectDevTools);
      clearInterval(interval);
    };
  }, []);
}
