'use client';

import React from 'react';

interface MessageFileProps {
  fileName: string;
  fileSize?: number;
  filePath?: string;
  messageType: 'image' | 'file';
  mimeType?: string;
}

export default function MessageFile({
  fileName,
  fileSize,
  filePath,
  messageType,
  mimeType
}: MessageFileProps) {
  const formatFileSize = (bytes?: number): string => {
    if (!bytes) return '';
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const getFileIcon = (mimeType?: string) => {
    if (!mimeType) return '📄';

    if (mimeType.startsWith('image/')) return '🖼️';
    if (mimeType.includes('pdf')) return '📕';
    if (mimeType.includes('word') || mimeType.includes('document')) return '📝';
    if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) return '📊';
    if (mimeType.includes('powerpoint') || mimeType.includes('presentation')) return '📽️';
    if (mimeType.includes('zip') || mimeType.includes('rar') || mimeType.includes('compressed')) return '🗜️';
    if (mimeType.includes('text')) return '📄';
    return '📁';
  };

  const downloadFile = () => {
    if (filePath) {
      const link = document.createElement('a');
      link.href = filePath; // Sử dụng trực tiếp URL từ Laravel
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const openFile = () => {
    if (filePath) {
      window.open(filePath, '_blank'); // Sử dụng trực tiếp URL từ Laravel
    }
  };

  if (messageType === 'image') {
    return (
      <div className="mt-2">
        <div
          className="relative max-w-xs cursor-pointer rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
          onClick={openFile}
        >
          {filePath ? (
            <img
              src={filePath}
              alt={fileName}
              className="w-full h-auto max-h-64 object-cover"
              onError={(e) => {
                // Khi ảnh lỗi, ẩn img và hiển thị fallback
                const imgElement = e.target as HTMLImageElement;
                imgElement.style.display = 'none';
                const parent = imgElement.parentElement;
                if (parent && !parent.querySelector('.error-fallback')) {
                  const fallback = document.createElement('div');
                  fallback.className = 'error-fallback flex items-center justify-center bg-gray-100 text-gray-500 min-h-[100px]';
                  fallback.innerHTML = `
                    <div class="text-center p-4">
                      <svg class="w-12 h-12 mx-auto mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                      </svg>
                      <div class="text-sm">Không thể tải ảnh</div>
                    </div>
                  `;
                  parent.insertBefore(fallback, imgElement);
                }
              }}
            />
          ) : (
            <div className="flex items-center justify-center bg-gray-100 text-gray-500 min-h-[100px]">
              <div className="text-center p-4">
                <svg className="w-12 h-12 mx-auto mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 002 2v12a2 2 0 002 2z" />
                </svg>
                <div className="text-sm">Không có ảnh</div>
              </div>
            </div>
          )}
          <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-2">
            <div className="truncate">{fileName}</div>
            {fileSize && (
              <div className="text-gray-300">{formatFileSize(fileSize)}</div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-2">
      <div className="flex items-center space-x-3 bg-gray-50 p-3 rounded-lg border max-w-xs">
        <div className="text-2xl">{getFileIcon(mimeType)}</div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium text-gray-900 truncate">
            {fileName}
          </div>
          {fileSize && (
            <div className="text-xs text-gray-500">
              {formatFileSize(fileSize)}
            </div>
          )}
        </div>
        <div className="flex space-x-1">
          <button
            onClick={openFile}
            className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
            title="Xem file"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </button>
          <button
            onClick={downloadFile}
            className="p-1 text-green-600 hover:bg-green-50 rounded transition-colors"
            title="Tải xuống"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
