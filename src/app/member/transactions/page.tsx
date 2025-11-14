"use client";

import { useState } from 'react';
import {
  CreditCard,
  Wallet,
  Plus,
  Minus,
  History,
  ArrowUpCircle,
  ArrowDownCircle,
  Clock,
  CheckCircle,
  XCircle
} from 'lucide-react';

export default function TransactionsPage() {
  const [activeTab, setActiveTab] = useState<'deposit' | 'withdraw' | 'history'>('deposit');
  const [amount, setAmount] = useState('');

  const quickAmounts = [100000, 500000, 1000000, 2000000, 5000000];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  const transactions = [
    {
      id: 1,
      type: 'deposit',
      amount: 500000,
      status: 'completed',
      date: '2024-01-15T10:30:00',
      description: 'Nạp tiền qua banking'
    },
    {
      id: 2,
      type: 'withdraw',
      amount: 200000,
      status: 'pending',
      date: '2024-01-14T15:20:00',
      description: 'Rút tiền về tài khoản'
    },
    {
      id: 3,
      type: 'deposit',
      amount: 1000000,
      status: 'completed',
      date: '2024-01-12T09:15:00',
      description: 'Nạp tiền qua Momo'
    },
    {
      id: 4,
      type: 'withdraw',
      amount: 300000,
      status: 'failed',
      date: '2024-01-10T14:45:00',
      description: 'Rút tiền về tài khoản'
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Hoàn thành';
      case 'pending':
        return 'Đang xử lý';
      case 'failed':
        return 'Thất bại';
      default:
        return 'Không xác định';
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="h-8 w-8 sm:h-10 sm:w-10 bg-gradient-to-r from-green-500 to-blue-600 rounded-xl flex items-center justify-center">
            <Wallet className="h-4 w-4 sm:h-6 sm:w-6 text-white" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
            Nạp rút tiền
          </h1>
        </div>
        <p className="text-gray-600 text-sm sm:text-base">
          Quản lý số dư tài khoản và lịch sử giao dịch
        </p>
      </div>

      {/* Balance Card */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl text-white p-6 mb-8">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-blue-100 text-sm">Số dư khả dụng</p>
            <p className="text-2xl font-bold">{formatCurrency(1250000)}</p>
          </div>
          <CreditCard className="h-12 w-12 text-blue-200" />
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-8">
        <div className="border-b border-gray-200">
          <nav className="flex">
            <button
              onClick={() => setActiveTab('deposit')}
              className={`flex-1 px-6 py-4 text-sm font-medium flex items-center justify-center gap-2 ${activeTab === 'deposit'
                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
            >
              <Plus className="h-4 w-4" />
              Nạp tiền
            </button>
            <button
              onClick={() => setActiveTab('withdraw')}
              className={`flex-1 px-6 py-4 text-sm font-medium flex items-center justify-center gap-2 ${activeTab === 'withdraw'
                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
            >
              <Minus className="h-4 w-4" />
              Rút tiền
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`flex-1 px-6 py-4 text-sm font-medium flex items-center justify-center gap-2 ${activeTab === 'history'
                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
            >
              <History className="h-4 w-4" />
              Lịch sử
            </button>
          </nav>
        </div>

        <div className="p-6">
          {/* Deposit Tab */}
          {activeTab === 'deposit' && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Nạp tiền vào tài khoản</h3>

              {/* Amount Input */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Số tiền muốn nạp
                </label>
                <input
                  type="text"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Nhập số tiền..."
                />
              </div>

              {/* Quick Amount Buttons */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Chọn nhanh
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                  {quickAmounts.map((quickAmount) => (
                    <button
                      key={quickAmount}
                      onClick={() => setAmount(quickAmount.toString())}
                      className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      {formatCurrency(quickAmount)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Payment Methods */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phương thức thanh toán
                </label>
                <div className="space-y-3">
                  <label className="flex items-center p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                    <input type="radio" name="payment_method" className="mr-3" defaultChecked />
                    <span>Chuyển khoản ngân hàng</span>
                  </label>
                  <label className="flex items-center p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                    <input type="radio" name="payment_method" className="mr-3" />
                    <span>Ví điện tử (Momo, ZaloPay)</span>
                  </label>
                </div>
              </div>

              <button className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium">
                Tiếp tục nạp tiền
              </button>
            </div>
          )}

          {/* Withdraw Tab */}
          {activeTab === 'withdraw' && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Rút tiền từ tài khoản</h3>

              {/* Amount Input */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Số tiền muốn rút
                </label>
                <input
                  type="text"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Nhập số tiền..."
                />
                <p className="text-xs text-gray-500 mt-1">
                  Số dư khả dụng: {formatCurrency(1250000)}
                </p>
              </div>

              {/* Bank Info */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Thông tin tài khoản nhận
                </label>
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="Số tài khoản"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <input
                    type="text"
                    placeholder="Tên ngân hàng"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <input
                    type="text"
                    placeholder="Tên chủ tài khoản"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <button className="w-full bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 transition-colors font-medium">
                Yêu cầu rút tiền
              </button>
            </div>
          )}

          {/* History Tab */}
          {activeTab === 'history' && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Lịch sử giao dịch</h3>

              <div className="space-y-4">
                {transactions.map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-lg ${transaction.type === 'deposit' ? 'bg-green-100' : 'bg-red-100'
                        }`}>
                        {transaction.type === 'deposit' ? (
                          <ArrowUpCircle className="h-5 w-5 text-green-600" />
                        ) : (
                          <ArrowDownCircle className="h-5 w-5 text-red-600" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{transaction.description}</p>
                        <p className="text-sm text-gray-500">
                          {new Date(transaction.date).toLocaleString('vi-VN')}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-semibold ${transaction.type === 'deposit' ? 'text-green-600' : 'text-red-600'
                        }`}>
                        {transaction.type === 'deposit' ? '+' : '-'}{formatCurrency(transaction.amount)}
                      </p>
                      <div className="flex items-center gap-1 justify-end">
                        {getStatusIcon(transaction.status)}
                        <span className="text-xs text-gray-500">{getStatusText(transaction.status)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
