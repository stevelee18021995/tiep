'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@/lib/auth';
import AdminLayout from '@/components/layout/AdminLayout';
import { FileUploadButtons } from '@/components/FileUpload';
import MessageFile from '@/components/MessageFile';
import { toast } from 'react-hot-toast';
import {
  Send,
  MoreVertical,
  CheckCircle,
  Circle,
  UserCheck,
  Users,
  Search,
  Trash2
} from 'lucide-react';

interface Chat {
  id: number;
  title: string;
  status: 'open' | 'assigned' | 'closed';
  last_message_at: string;
  user: {
    id: number;
    name: string;
    email: string;
  };
  admin?: {
    id: number;
    name: string;
  };
}

interface Message {
  id: number;
  chat_id: number;
  user_id: number;
  message: string;
  message_type: string;
  file_path?: string;
  file_name?: string;
  file_size?: number;
  mime_type?: string;
  is_read: boolean;
  created_at: string;
  user: {
    id: number;
    name: string;
    is_admin: boolean;
  };
}

export default function AdminChatPage() {
  const { user } = useAuth();
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChat, setActiveChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [selectedFile, setSelectedFile] = useState<{ file: File; type: 'image' | 'file' } | null>(null);
  const [filter, setFilter] = useState<'all' | 'assigned' | 'open' | 'closed'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingChat, setDeletingChat] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchChats = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (filter === 'assigned') {
        params.append('assigned_only', 'true');
      }

      const response = await fetch(`/api/chats?${params.toString()}`, {
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        let chatList = data.data.data || [];

        // Lọc theo status
        if (filter !== 'all' && filter !== 'assigned') {
          chatList = chatList.filter((chat: Chat) => chat.status === filter);
        }

        // Lọc theo search term
        if (searchTerm) {
          chatList = chatList.filter((chat: Chat) =>
            chat.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            chat.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            chat.user.email.toLowerCase().includes(searchTerm.toLowerCase())
          );
        }

        setChats(chatList);
      }
    } catch (error) {
      console.error('Error fetching chats:', error);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    fetchChats();
  }, [fetchChats]);

  const fetchMessages = async (chatId: number) => {
    try {
      const response = await fetch(`/api/chats/${chatId}`, {
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setMessages(data.data.messages.data || []);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const assignChatToMe = async (chatId: number) => {
    try {
      const response = await fetch(`/api/chats/${chatId}/assign`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          admin_id: user?.id,
        }),
      });

      if (response.ok) {
        fetchChats();
        if (activeChat?.id === chatId) {
          const updatedChat = chats.find(chat => chat.id === chatId);
          if (updatedChat) {
            setActiveChat({
              ...updatedChat,
              admin: { id: user!.id, name: user!.name },
              status: 'assigned'
            });
          }
        }
      }
    } catch (error) {
      console.error('Error assigning chat:', error);
    }
  };

  const sendMessage = async () => {
    if ((!newMessage.trim() && !selectedFile) || !activeChat || sending) return;

    setSending(true);
    try {
      let response;

      if (selectedFile) {
        // Gửi file cùng với message
        const formData = new FormData();
        formData.append('file', selectedFile.file);
        formData.append('message', newMessage.trim() || (selectedFile.type === 'image' ? '[Hình ảnh]' : '[File đính kèm]'));

        const token = localStorage.getItem('token');
        response = await fetch(`/api/chats/${activeChat.id}/upload`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          body: formData,
        });
      } else {
        // Gửi text message thông thường
        response = await fetch(`/api/chats/${activeChat.id}/messages`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            message: newMessage,
          }),
        });
      }

      if (response.ok) {
        const data = await response.json();
        setMessages([...messages, data.data]);
        setNewMessage('');
        setSelectedFile(null); // Clear selected file

        if (selectedFile) {
          toast.success(selectedFile.type === 'image' ? 'Gửi hình ảnh thành công!' : 'Gửi file thành công!');
        }

        // Cập nhật thời gian tin nhắn cuối và assign nếu chưa có
        setChats(chats.map(chat =>
          chat.id === activeChat.id
            ? {
              ...chat,
              last_message_at: data.data.created_at,
              admin: chat.admin || { id: user!.id, name: user!.name },
              status: chat.status === 'open' ? 'assigned' : chat.status
            }
            : chat
        ));

        setActiveChat(prev => prev ? {
          ...prev,
          admin: prev.admin || { id: user!.id, name: user!.name },
          status: prev.status === 'open' ? 'assigned' : prev.status
        } : null);
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'Không thể gửi tin nhắn');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Có lỗi xảy ra khi gửi tin nhắn');
    } finally {
      setSending(false);
    }
  };

  const handleFileSelect = (file: File, type: 'image' | 'file') => {
    setSelectedFile({ file, type });
  };

  const closeChat = async (chatId: number) => {
    try {
      const response = await fetch(`/api/chats/${chatId}/close`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (response.ok) {
        fetchChats();
        if (activeChat?.id === chatId) {
          setActiveChat(prev => prev ? { ...prev, status: 'closed' } : null);
        }
      }
    } catch (error) {
      console.error('Error closing chat:', error);
    }
  };

  const deleteChat = async () => {
    if (!activeChat || deletingChat) return;

    setDeletingChat(true);
    try {
      const response = await fetch(`/api/chats/${activeChat.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (response.ok) {
        // Xóa chat khỏi danh sách
        setChats(chats.filter(chat => chat.id !== activeChat.id));
        // Reset active chat
        setActiveChat(null);
        setMessages([]);
        setShowDeleteModal(false);
      } else {
        console.error('Failed to delete chat');
      }
    } catch (error) {
      console.error('Error deleting chat:', error);
    } finally {
      setDeletingChat(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-yellow-100 text-yellow-800';
      case 'assigned': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'open': return 'Chờ hỗ trợ';
      case 'assigned': return 'Đang hỗ trợ';
      case 'closed': return 'Đã đóng';
      default: return status;
    }
  };

  useEffect(() => {
    fetchChats();
  }, [searchTerm]);

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="h-full flex bg-white rounded-lg shadow overflow-hidden">
        {/* Sidebar - Danh sách chat */}
        <div className="w-80 border-r border-gray-200 flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Chat hỗ trợ</h2>

            {/* Search */}
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Tìm kiếm chat..."
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Filter */}
            <div className="flex space-x-1">
              {[
                { key: 'all', label: 'Tất cả' },
                { key: 'open', label: 'Chờ' },
                { key: 'assigned', label: 'Của tôi' },
                { key: 'closed', label: 'Đã đóng' }
              ].map((item) => (
                <button
                  key={item.key}
                  onClick={() => setFilter(item.key as any)}
                  className={`px-2 py-1 text-xs rounded ${filter === item.key
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Danh sách chat */}
          <div className="flex-1 overflow-y-auto">
            {chats.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                <p>Không có cuộc trò chuyện nào</p>
              </div>
            ) : (
              chats.map((chat) => (
                <div
                  key={chat.id}
                  onClick={() => {
                    setActiveChat(chat);
                    fetchMessages(chat.id);
                  }}
                  className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${activeChat?.id === chat.id ? 'bg-blue-50 border-blue-200' : ''
                    }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 truncate">{chat.title}</h3>
                      <p className="text-sm text-gray-600 truncate">
                        Khách hàng: {chat.user.name}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {chat.user.email}
                      </p>
                      {chat.admin && (
                        <p className="text-xs text-green-600 mt-1">
                          Hỗ trợ bởi: {chat.admin.name}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col items-end space-y-1">
                      <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(chat.status)}`}>
                        {getStatusText(chat.status)}
                      </span>
                      <span className="text-xs text-gray-500">
                        {formatTime(chat.last_message_at)}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Khu vực chat chính */}
        <div className="flex-1 flex flex-col">
          {activeChat ? (
            <>
              {/* Header chat */}
              <div className="p-4 border-b border-gray-200 bg-white">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900">{activeChat.title}</h3>
                    <p className="text-sm text-gray-600">
                      Khách hàng: {activeChat.user.name} ({activeChat.user.email})
                    </p>
                    {activeChat.admin && (
                      <p className="text-sm text-green-600">
                        Hỗ trợ bởi: {activeChat.admin.name}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    {activeChat.status === 'open' && (
                      <button
                        onClick={() => assignChatToMe(activeChat.id)}
                        className="px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors flex items-center"
                      >
                        <UserCheck className="h-4 w-4 mr-1" />
                        Nhận hỗ trợ
                      </button>
                    )}
                    {activeChat.status !== 'closed' && (
                      <button
                        onClick={() => closeChat(activeChat.id)}
                        className="px-3 py-1 bg-red-600 text-white text-sm rounded-md hover:bg-red-700 transition-colors"
                      >
                        Đóng chat
                      </button>
                    )}
                    <button
                      onClick={() => setShowDeleteModal(true)}
                      className="px-3 py-1 bg-gray-600 text-white text-sm rounded-md hover:bg-gray-700 transition-colors flex items-center"
                      title="Xóa cuộc trò chuyện"
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Xóa
                    </button>
                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(activeChat.status)}`}>
                      {getStatusText(activeChat.status)}
                    </span>
                    <button className="p-2 text-gray-400 hover:text-gray-600 rounded-md">
                      <MoreVertical className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Tin nhắn */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.user_id === user?.id ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${message.user_id === user?.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-900 border'
                      }`}>
                      {message.user_id !== user?.id && (
                        <p className="text-xs text-gray-500 mb-1">{message.user.name}</p>
                      )}
                      <p className="text-sm">{message.message}</p>

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

                      <div className={`flex items-center justify-between mt-1 text-xs ${message.user_id === user?.id ? 'text-blue-100' : 'text-gray-500'
                        }`}>
                        <span>{formatTime(message.created_at)}</span>
                        {message.user_id === user?.id && (
                          <span className="ml-2">
                            {message.is_read ? (
                              <CheckCircle className="h-3 w-3" />
                            ) : (
                              <Circle className="h-3 w-3" />
                            )}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Input tin nhắn */}
              {activeChat.status !== 'closed' && (
                <div className="p-4 border-t border-gray-200 bg-white">
                  {/* File upload indicator */}
                  {sending && (
                    <div className="mb-3 flex items-center space-x-2 text-blue-600">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                      <span className="text-sm">Đang gửi...</span>
                    </div>
                  )}

                  {/* Selected file preview */}
                  {selectedFile && (
                    <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          {selectedFile.type === 'image' ? (
                            <div className="flex items-center space-x-2">
                              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              <span className="text-sm text-blue-800">Hình ảnh: {selectedFile.file.name}</span>
                            </div>
                          ) : (
                            <div className="flex items-center space-x-2">
                              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                              </svg>
                              <span className="text-sm text-blue-800">File: {selectedFile.file.name}</span>
                            </div>
                          )}
                          <span className="text-xs text-blue-600">
                            ({(selectedFile.file.size / 1024 / 1024).toFixed(2)} MB)
                          </span>
                        </div>
                        <button
                          onClick={() => setSelectedFile(null)}
                          className="text-blue-600 hover:text-blue-800 p-1"
                          title="Hủy file"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center space-x-2">
                    {/* File upload buttons */}
                    <FileUploadButtons
                      onFileSelect={handleFileSelect}
                      disabled={sending}
                    />                    <div className="flex-1 relative">
                      <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder={selectedFile ? "Nhập mô tả (tùy chọn)..." : "Nhập tin nhắn..."}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        disabled={sending}
                      />
                    </div>
                    <button
                      onClick={sendMessage}
                      disabled={(!newMessage.trim() && !selectedFile) || sending}
                      className="p-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                    >
                      <Send className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <Users className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p className="text-lg mb-2">Chọn một cuộc trò chuyện để bắt đầu hỗ trợ</p>
                <p className="text-sm">Hỗ trợ khách hàng thông qua chat trực tuyến</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && activeChat && (
        <div className="fixed inset-0 backdrop-blur-[3px] flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 shadow-xl">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Xóa cuộc trò chuyện</h2>

            <div className="mb-6">
              <p className="text-gray-600 mb-2">
                Bạn có chắc chắn muốn xóa cuộc trò chuyện với <strong>{activeChat.user.name}</strong>?
              </p>
              <p className="text-sm text-red-600">
                ⚠️ Hành động này không thể hoàn tác. Tất cả tin nhắn trong cuộc trò chuyện sẽ bị xóa vĩnh viễn.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                disabled={deletingChat}
                className="flex-1 bg-gray-300 hover:bg-gray-400 disabled:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={deleteChat}
                disabled={deletingChat}
                className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center"
              >
                {deletingChat ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                    Đang xóa...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Xóa
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
