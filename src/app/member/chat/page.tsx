'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/lib/auth';
import toast from 'react-hot-toast';
import { FileUploadButtons } from '@/components/FileUpload';
import MessageFile from '@/components/MessageFile';

interface Message {
  id: number;
  message: string;
  user_id: number;
  is_read: boolean;
  created_at: string;
  message_type: string;
  file_path?: string;
  file_name?: string;
  file_size?: number;
  mime_type?: string;
  user?: {
    id: number;
    name: string;
  };
}

interface Chat {
  id: number;
  title: string;
  status: string;
  created_at: string;
  updated_at: string;
  last_message_at: string;
  user_id: number;
  admin_id?: number;
  admin?: {
    id: number;
    name: string;
  };
}

export default function MemberChatPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [selectedFile, setSelectedFile] = useState<{ file: File; type: 'image' | 'file' } | null>(null);
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [newChatTitle, setNewChatTitle] = useState('');
  const [newChatMessage, setNewChatMessage] = useState('');
  const [showChatList, setShowChatList] = useState(true);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [chatToClose, setChatToClose] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const chatListIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchChats = async () => {
    try {
      const response = await fetch('/api/chats', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Chat response data:', data); // Debug log
        console.log('data.data type:', typeof data.data); // Debug log
        console.log('Is data.data array?', Array.isArray(data.data)); // Debug log

        // Kiểm tra structure response từ Laravel
        let chatList = [];
        if (data.data && data.data.data) {
          // Nếu có pagination: { data: { data: [...], total, per_page, etc } }
          chatList = Array.isArray(data.data.data) ? data.data.data : [];
        } else if (Array.isArray(data.data)) {
          // Nếu trực tiếp array: { data: [...] }
          chatList = data.data;
        }

        console.log('Final chatList:', chatList); // Debug log
        setChats(prevChats => {
          // So sánh để tránh re-render không cần thiết
          if (JSON.stringify(prevChats) !== JSON.stringify(chatList)) {
            return chatList;
          }
          return prevChats;
        });
      } else if (response.status === 401) {
        window.location.href = '/login';
      }
    } catch (error) {
      console.error('Error fetching chats:', error);
      setChats([]); // Ensure chats is always an array
    }
  };

  const fetchMessages = async (chatId: number) => {
    try {
      const response = await fetch(`/api/chats/${chatId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        const newMessages = data.data.messages.data || [];
        setMessages(prevMessages => {
          // Chỉ cập nhật nếu có thay đổi về số lượng tin nhắn
          if (prevMessages.length !== newMessages.length) {
            return newMessages;
          }
          // Kiểm tra nếu có tin nhắn mới bằng cách so sánh ID cuối cùng
          if (prevMessages.length > 0 && newMessages.length > 0) {
            const lastPrevId = prevMessages[prevMessages.length - 1]?.id;
            const lastNewId = newMessages[newMessages.length - 1]?.id;
            if (lastPrevId !== lastNewId) {
              return newMessages;
            }
          }
          return prevMessages;
        });
      } else if (response.status === 401) {
        window.location.href = '/login';
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const createNewChat = async () => {
    if (!newChatTitle.trim() || !newChatMessage.trim()) {
      toast.error('Vui lòng nhập tiêu đề và tin nhắn đầu tiên');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/chats', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          title: newChatTitle.trim(),
          message: newChatMessage.trim()
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const responseData = data.data;

        // Check if response includes both chat and messages
        if (responseData.chat && responseData.messages) {
          const newChat = responseData.chat;
          const initialMessages = responseData.messages;

          // Set selected chat and messages
          setSelectedChat(newChat);
          setMessages(initialMessages);
        } else {
          // Fallback: treat as old response format
          const newChat = responseData;
          setSelectedChat(newChat);

          // Load messages for the new chat immediately
          await fetchMessages(newChat.id);
        }

        // Update UI
        setShowNewChatModal(false);
        setNewChatTitle('');
        setNewChatMessage('');
        setShowChatList(false); // Hide chat list on mobile when creating new chat

        // Start auto-refresh for the new chat
        startAutoRefresh(responseData.chat?.id || responseData.id);
        toast.success('Tạo cuộc trò chuyện mới thành công!');
      } else if (response.status === 401) {
        window.location.href = '/login';
      } else {
        toast.error('Không thể tạo cuộc trò chuyện mới');
      }
    } catch (error) {
      console.error('Error creating chat:', error);
      toast.error('Có lỗi xảy ra khi tạo cuộc trò chuyện');
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async () => {
    if ((!newMessage.trim() && !selectedFile) || !selectedChat || isSending) return;

    setIsSending(true);
    try {
      let response;

      if (selectedFile) {
        // Gửi file cùng với message
        const formData = new FormData();
        formData.append('file', selectedFile.file);
        formData.append('message', newMessage.trim() || (selectedFile.type === 'image' ? '[Hình ảnh]' : '[File đính kèm]'));

        const token = localStorage.getItem('token');
        response = await fetch(`/api/chats/${selectedChat.id}/upload`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          body: formData,
        });
      } else {
        // Gửi text message thông thường
        response = await fetch(`/api/chats/${selectedChat.id}/messages`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            message: newMessage.trim()
          }),
        });
      }

      if (response.ok) {
        const data = await response.json();
        setMessages(prev => [...prev, data.data]);
        setNewMessage('');
        setSelectedFile(null); // Clear selected file
        if (selectedFile) {
          toast.success(selectedFile.type === 'image' ? 'Gửi hình ảnh thành công!' : 'Gửi file thành công!');
        }
      } else if (response.status === 401) {
        window.location.href = '/login';
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'Không thể gửi tin nhắn');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Có lỗi xảy ra khi gửi tin nhắn');
    } finally {
      setIsSending(false);
    }
  };

  const handleFileSelect = (file: File, type: 'image' | 'file') => {
    setSelectedFile({ file, type });
  };

  const closeChat = async (chatId: number) => {
    setChatToClose(chatId);
    setShowConfirmModal(true);
  };

  const confirmCloseChat = async () => {
    if (!chatToClose) return;

    try {
      const response = await fetch(`/api/chats/${chatToClose}/close`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (response.ok) {
        // Don't call fetchChats here since it's auto-refreshing
        if (selectedChat?.id === chatToClose) {
          setSelectedChat(prev => prev ? { ...prev, status: 'closed' } : null);
        }
        toast.success('Cuộc trò chuyện đã được đóng');
      } else if (response.status === 401) {
        window.location.href = '/login';
      } else {
        toast.error('Không thể đóng cuộc trò chuyện');
      }
    } catch (error) {
      console.error('Error closing chat:', error);
      toast.error('Có lỗi xảy ra khi đóng cuộc trò chuyện');
    } finally {
      setShowConfirmModal(false);
      setChatToClose(null);
    }
  };

  const selectChat = async (chat: Chat) => {
    setSelectedChat(chat);
    setShowChatList(false); // Hide chat list on mobile when selecting a chat
    await fetchMessages(chat.id);

    // Start auto-refresh for messages
    startAutoRefresh(chat.id);
  };

  const goBackToChatList = () => {
    setShowChatList(true);
    setSelectedChat(null);

    // Stop auto-refresh when going back to chat list
    stopAutoRefresh();
  };

  // Auto-refresh functions
  const startAutoRefresh = (chatId: number) => {
    // Clear existing interval if any
    stopAutoRefresh();

    // Set new interval for auto-refresh every 5 seconds
    intervalRef.current = setInterval(() => {
      fetchMessages(chatId);
    }, 5000);
  };

  const stopAutoRefresh = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  // Chat list auto-refresh functions
  const startChatListAutoRefresh = () => {
    // Clear existing interval if any
    stopChatListAutoRefresh();

    // Set new interval for auto-refresh chat list every 10 seconds
    chatListIntervalRef.current = setInterval(() => {
      fetchChats();
    }, 10000);
  };

  const stopChatListAutoRefresh = () => {
    if (chatListIntervalRef.current) {
      clearInterval(chatListIntervalRef.current);
      chatListIntervalRef.current = null;
    }
  };

  useEffect(() => {
    if (!authLoading && user) {
      fetchChats();
      // Start auto-refresh for chat list
      startChatListAutoRefresh();
    }
  }, [authLoading, user]);

  // Cleanup interval when component unmounts
  useEffect(() => {
    return () => {
      stopAutoRefresh();
      stopChatListAutoRefresh();
    };
  }, []);

  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Cần đăng nhập</h1>
          <p className="text-gray-600 mb-6">Vui lòng đăng nhập để sử dụng tính năng chat</p>
          <a
            href="/login"
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Đăng nhập
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Hỗ trợ khách hàng</h1>
        <p className="mt-2 text-gray-600">Liên hệ với đội ngũ hỗ trợ của chúng tôi</p>
      </div>

      <div className="bg-white rounded-lg shadow-lg h-[600px] flex relative">
        {/* Chat List */}
        <div className={`w-full md:w-1/3 border-r border-gray-200 flex flex-col ${showChatList ? 'block' : 'hidden md:block'}`}>
          <div className="p-4 border-b border-gray-200">
            <button
              onClick={() => setShowNewChatModal(true)}
              disabled={isLoading}
              className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              Cuộc trò chuyện mới
            </button>
          </div>

          <div className="flex-1 overflow-y-auto">
            {!Array.isArray(chats) || chats.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                Chưa có cuộc trò chuyện nào
              </div>
            ) : (
              chats.map((chat) => (
                <div
                  key={chat.id}
                  onClick={() => selectChat(chat)}
                  className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${selectedChat?.id === chat.id ? 'bg-blue-50 border-l-4 border-l-blue-600' : ''
                    } ${chat.status === 'closed' ? 'opacity-60' : ''}`}
                >
                  <div className="flex justify-between items-start">
                    <h3 className="font-medium text-gray-900 truncate">{chat.title}</h3>
                    <span className={`text-xs px-2 py-1 rounded-full ${chat.status === 'open' ? 'bg-green-100 text-green-800' :
                      chat.status === 'assigned' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                      {chat.status === 'open' ? 'Mở' :
                        chat.status === 'assigned' ? 'Được phân công' : 'Đóng'}
                    </span>
                  </div>
                  {chat.admin && (
                    <p className="text-sm text-gray-600 mt-1">
                      Hỗ trợ bởi: {chat.admin.name}
                    </p>
                  )}
                  <p className="text-xs text-gray-500 mt-2">
                    {new Date(chat.last_message_at || chat.created_at).toLocaleString('vi-VN')}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Chat Messages */}
        <div className={`w-full md:flex-1 flex flex-col ${showChatList ? 'hidden md:flex' : 'flex'}`}>
          {selectedChat ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                <div className="flex items-center space-x-3">
                  {/* Back button for mobile */}
                  <button
                    onClick={goBackToChatList}
                    className="md:hidden p-2 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>

                  <div>
                    <h2 className="font-semibold text-gray-900">{selectedChat.title}</h2>
                    {selectedChat.admin && (
                      <p className="text-sm text-gray-600">
                        Đang được hỗ trợ bởi: {selectedChat.admin.name}
                      </p>
                    )}
                    <p className="text-xs text-gray-500">
                      Trạng thái: {selectedChat.status === 'open' ? 'Mở' :
                        selectedChat.status === 'assigned' ? 'Được phân công' : 'Đã đóng'}
                    </p>
                  </div>
                </div>

                {selectedChat.status !== 'closed' && (
                  <button
                    onClick={() => closeChat(selectedChat.id)}
                    className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                  >
                    Đóng chat
                  </button>
                )}
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.user_id === user.id ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${message.user_id === user.id
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-900'
                        }`}
                    >
                      <p>{message.message}</p>

                      {/* Hiển thị file nếu có */}
                      {(message.message_type === 'image' || message.message_type === 'file') && message.file_path && (
                        <MessageFile
                          fileName={message.file_name || 'Unknown file'}
                          fileSize={message.file_size}
                          filePath={message.file_path}
                          messageType={message.message_type as 'image' | 'file'}
                          mimeType={message.mime_type}
                        />
                      )}

                      <p className={`text-xs mt-1 ${message.user_id === user.id ? 'text-blue-100' : 'text-gray-500'
                        }`}>
                        {new Date(message.created_at).toLocaleString('vi-VN')}
                      </p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              {selectedChat.status !== 'closed' ? (
                <div className="p-4 border-t border-gray-200">
                  {/* File upload indicator */}
                  {isSending && (
                    <div className="mb-3 flex items-center space-x-2 text-blue-600">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                      <span className="text-sm">Đang gửi...</span>
                    </div>
                  )}

                  {/* Selected file preview */}
                  {selectedFile && (
                    <div className="mb-3 p-2 sm:p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
                          {selectedFile.type === 'image' ? (
                            <div className="flex items-center space-x-1 sm:space-x-2 min-w-0">
                              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              <span className="text-xs sm:text-sm text-blue-800 truncate">Hình ảnh: {selectedFile.file.name}</span>
                            </div>
                          ) : (
                            <div className="flex items-center space-x-1 sm:space-x-2 min-w-0">
                              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                              </svg>
                              <span className="text-xs sm:text-sm text-blue-800 truncate">File: {selectedFile.file.name}</span>
                            </div>
                          )}
                          <span className="text-xs text-blue-600 flex-shrink-0 hidden sm:inline">
                            ({(selectedFile.file.size / 1024 / 1024).toFixed(2)} MB)
                          </span>
                        </div>
                        <button
                          onClick={() => setSelectedFile(null)}
                          className="text-blue-600 hover:text-blue-800 p-1 flex-shrink-0 ml-2"
                          title="Hủy file"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="flex space-x-2">
                    <div className="flex-1 flex space-x-2">
                      <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                        placeholder={selectedFile ? "Nhập mô tả (tùy chọn)..." : "Nhập tin nhắn..."}
                        className="flex-1 border border-gray-300 rounded-lg px-3 sm:px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                        disabled={isSending}
                      />

                      {/* File upload buttons */}
                      <FileUploadButtons
                        onFileSelect={handleFileSelect}
                        disabled={isSending}
                      />
                    </div>

                    <button
                      onClick={sendMessage}
                      disabled={(!newMessage.trim() && !selectedFile) || isSending}
                      className="bg-blue-600 text-white px-3 sm:px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 text-sm sm:text-base whitespace-nowrap"
                    >
                      {isSending ? (
                        <span className="hidden sm:inline">Đang gửi...</span>
                      ) : (
                        <span className="hidden sm:inline">Gửi</span>
                      )}
                      {/* Icon cho mobile */}
                      <svg className="w-5 h-5 sm:hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                      </svg>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-4 border-t border-gray-200 bg-gray-50 text-center">
                  <p className="text-gray-500 text-sm">Cuộc trò chuyện đã được đóng</p>
                </div>
              )}
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="text-gray-400 mb-4">
                  <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-3.582 8-8 8a8.955 8.955 0 01-4.126-.98L3 20l1.98-5.874A8.955 8.955 0 013 12c0-4.418 3.582-8 8-8s8 3.582 8 8z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Chọn cuộc trò chuyện</h3>
                <p className="text-gray-500 hidden md:block">Chọn một cuộc trò chuyện từ danh sách bên trái hoặc tạo cuộc trò chuyện mới</p>
                <p className="text-gray-500 md:hidden">Chọn một cuộc trò chuyện từ danh sách hoặc tạo cuộc trò chuyện mới</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal tạo cuộc trò chuyện mới */}
      {showNewChatModal && (
        <div className="fixed inset-0 backdrop-blur-[3px] flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 border-2 border-blue-200 ring-1 ring-blue-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 p-6 border-b border-blue-100 bg-gradient-to-r from-blue-50 to-indigo-50">
              Tạo cuộc trò chuyện mới
            </h3>

            <div className="space-y-4 px-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tiêu đề cuộc trò chuyện
                </label>
                <input
                  type="text"
                  value={newChatTitle}
                  onChange={(e) => setNewChatTitle(e.target.value)}
                  placeholder="Nhập tiêu đề..."
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tin nhắn đầu tiên
                </label>
                <textarea
                  value={newChatMessage}
                  onChange={(e) => setNewChatMessage(e.target.value)}
                  placeholder="Nhập tin nhắn đầu tiên..."
                  rows={3}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>
            </div>

            <div className="flex space-x-3 mt-6 p-6 pt-4 border-t border-blue-100 bg-gradient-to-r from-gray-50 to-blue-50 rounded-b-xl">
              <button
                onClick={() => {
                  setShowNewChatModal(false);
                  setNewChatTitle('');
                  setNewChatMessage('');
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                disabled={isLoading}
              >
                Hủy
              </button>
              <button
                onClick={createNewChat}
                disabled={isLoading || !newChatTitle.trim() || !newChatMessage.trim()}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {isLoading ? 'Đang tạo...' : 'Tạo'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal xác nhận đóng chat */}
      {showConfirmModal && (
        <div className="fixed inset-0 backdrop-blur-[3px] flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm mx-4 border-2 border-red-200 ring-1 ring-red-100 transform transition-all">
            <div className="p-6 bg-gradient-to-br from-red-50 to-pink-50 rounded-t-xl">
              <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-red-100 rounded-full border-2 border-red-200">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>

              <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">
                Đóng cuộc trò chuyện?
              </h3>

              <p className="text-sm text-gray-600 text-center mb-6">
                Bạn có chắc chắn muốn đóng cuộc trò chuyện này? Hành động này không thể hoàn tác.
              </p>
            </div>

            <div className="p-6 pt-0 bg-white rounded-b-xl">
              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    setShowConfirmModal(false);
                    setChatToClose(null);
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Hủy
                </button>
                <button
                  onClick={confirmCloseChat}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors border border-red-500 shadow-sm"
                >
                  Đóng chat
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
