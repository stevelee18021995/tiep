'use client'

import { useState, useEffect } from 'react'
import { formatCurrency } from '@/lib/utils'
import { DepositRequest, CreateDepositRequest } from '@/types/deposit'
import { toast } from 'react-hot-toast'
import { FiPlus, FiEye, FiRefreshCw, FiCreditCard, FiList, FiMinus } from 'react-icons/fi'

export default function DepositWithdrawPage() {
  const [activeTab, setActiveTab] = useState<'deposit' | 'withdraw' | 'history'>('deposit')
  const [requests, setRequests] = useState<DepositRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [perPage, setPerPage] = useState(15)
  const [statusFilter, setStatusFilter] = useState('all')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [selectedRequest, setSelectedRequest] = useState<DepositRequest | null>(null)
  const [createLoading, setCreateLoading] = useState(false)

  const [createForm, setCreateForm] = useState<CreateDepositRequest & {
    type: 'deposit' | 'withdraw'
    bank_name?: string
    account_holder_name?: string
    account_number?: string
  }>({
    type: 'deposit',
    amount: 0,
    payment_method: 'bank_transfer',
    note: '',
    payment_proof: ''
  })

  const paymentMethodNames = {
    bank_transfer: 'Chuyển khoản ngân hàng',
    momo: 'Ví MoMo',
    zalopay: 'Ví ZaloPay',
    vietqr: 'VietQR'
  }

  const statusNames = {
    pending: 'Chờ duyệt',
    approved: 'Đã duyệt',
    rejected: 'Từ chối'
  }

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800',
    approved: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800'
  }

  const fetchRequests = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: currentPage.toString(),
        per_page: perPage.toString()
      })

      // Thêm filter cho type nếu không phải tab history
      if (activeTab !== 'history') {
        params.append('type', activeTab)
      }

      if (statusFilter !== 'all') {
        params.append('status', statusFilter)
      }

      const token = localStorage.getItem('token')
      const response = await fetch(`/api/deposit-requests?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      const data = await response.json()

      if (data.success) {
        setRequests(data.data.data)
        setTotalPages(data.data.last_page)
      } else {
        toast.error(data.message || 'Không thể tải danh sách yêu cầu')
      }
    } catch (error) {
      console.error('Error fetching requests:', error)
      toast.error('Có lỗi xảy ra khi tải dữ liệu')
    } finally {
      setLoading(false)
    }
  }

  const createRequest = async () => {
    if (!createForm.amount || createForm.amount < 10) {
      toast.error('Số tiền tối thiểu là €10')
      return
    }

    // Validate withdraw fields
    if (createForm.type === 'withdraw' && (!createForm.bank_name || !createForm.account_holder_name || !createForm.account_number)) {
      toast.error('Vui lòng điền đầy đủ thông tin ngân hàng cho yêu cầu rút tiền')
      return
    }

    try {
      setCreateLoading(true)
      const token = localStorage.getItem('token')

      // Prepare form data based on type
      const formData = {
        type: createForm.type,
        amount: createForm.amount,
        note: createForm.note,
        ...(createForm.type === 'deposit'
          ? { payment_method: createForm.payment_method, payment_proof: createForm.payment_proof }
          : { bank_name: createForm.bank_name, account_holder_name: createForm.account_holder_name, account_number: createForm.account_number }
        )
      }

      const response = await fetch('/api/deposit-requests', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (data.success) {
        toast.success(`Tạo yêu cầu ${createForm.type === 'deposit' ? 'nạp tiền' : 'rút tiền'} thành công!`)
        setShowCreateModal(false)
        resetCreateForm()
        fetchRequests()
      } else {
        toast.error(data.message || `Không thể tạo yêu cầu ${createForm.type === 'deposit' ? 'nạp tiền' : 'rút tiền'}`)
      }
    } catch (error) {
      console.error('Error creating request:', error)
      toast.error('Có lỗi xảy ra khi tạo yêu cầu')
    } finally {
      setCreateLoading(false)
    }
  }

  const resetCreateForm = () => {
    setCreateForm({
      type: activeTab === 'withdraw' ? 'withdraw' : 'deposit',
      amount: 0,
      payment_method: 'bank_transfer',
      note: '',
      payment_proof: ''
    })
  }

  const viewRequest = async (request: DepositRequest) => {
    setSelectedRequest(request)
    setShowDetailModal(true)
  }

  // Tab change handler
  const handleTabChange = (tab: 'deposit' | 'withdraw' | 'history') => {
    setActiveTab(tab)
    setCurrentPage(1)
    setStatusFilter('all')
    resetCreateForm()
  }

  const renderCreateFormFields = () => {
    if (createForm.type === 'deposit') {
      return (
        <>
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
              <span className="text-base">💳</span>
              Phương thức thanh toán *
            </label>
            <select
              value={createForm.payment_method}
              onChange={(e) => setCreateForm({
                ...createForm,
                payment_method: e.target.value as any
              })}
              className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 hover:bg-white"
            >
              <option value="bank_transfer">🏦 Chuyển khoản ngân hàng</option>
              <option value="momo">📱 Ví MoMo</option>
              <option value="zalopay">💰 Ví ZaloPay</option>
              <option value="vietqr">📲 VietQR</option>
            </select>
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
              <span className="text-base">📷</span>
              Ảnh minh chứng
            </label>
            <input
              type="text"
              value={createForm.payment_proof || ''}
              onChange={(e) => setCreateForm({
                ...createForm,
                payment_proof: e.target.value
              })}
              className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 hover:bg-white"
              placeholder="Link ảnh chứng từ thanh toán"
            />
          </div>
        </>
      )
    } else {
      return (
        <>
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
              <span className="text-base">🏦</span>
              Tên ngân hàng *
            </label>
            <input
              type="text"
              value={createForm.bank_name || ''}
              onChange={(e) => setCreateForm({
                ...createForm,
                bank_name: e.target.value
              })}
              className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 hover:bg-white"
              placeholder="Vietcombank, BIDV, Techcombank..."
            />
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
              <span className="text-base">👤</span>
              Tên chủ tài khoản *
            </label>
            <input
              type="text"
              value={createForm.account_holder_name || ''}
              onChange={(e) => setCreateForm({
                ...createForm,
                account_holder_name: e.target.value
              })}
              className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 hover:bg-white"
              placeholder="Tên đầy đủ trên tài khoản ngân hàng"
            />
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
              <span className="text-base">🔢</span>
              Số tài khoản *
            </label>
            <input
              type="text"
              value={createForm.account_number || ''}
              onChange={(e) => setCreateForm({
                ...createForm,
                account_number: e.target.value
              })}
              className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 hover:bg-white"
              placeholder="Số tài khoản ngân hàng"
            />
          </div>
        </>
      )
    }
  }

  const renderPaymentInstructions = () => {
    if (createForm.type !== 'deposit') return null

    const method = createForm.payment_method
    const amount = createForm.amount || 0

    const baseQRUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

    switch (method) {
      case 'bank_transfer':
        return (
          <div className="space-y-3">
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
              <h4 className="font-semibold text-blue-800 mb-2 flex items-center gap-2 text-sm">
                🏦 Chuyển khoản ngân hàng
              </h4>
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-600">Ngân hàng:</span>
                  <span className="font-medium">Vietcombank</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">STK:</span>
                  <span className="font-mono font-bold text-blue-600">1234567890</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Chủ TK:</span>
                  <span className="font-medium">CÔNG TY ABC</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Số tiền:</span>
                  <span className="font-bold text-green-600">{formatCurrency(amount)}</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-3 text-center">
              <p className="text-xs text-gray-600 mb-2">Quét mã QR để chuyển khoản</p>
              <img
                src={`${baseQRUrl}/api/qr-code/bank-transfer?amount=${amount}`}
                alt="Bank Transfer QR Code"
                className="w-36 h-36 mx-auto rounded-lg border shadow-sm"
                onError={(e) => {
                  e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzY2NzI4MCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkJhbmsgUVIgQ29kZTwvdGV4dD48L3N2Zz4='
                }}
              />
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3">
              <h5 className="font-semibold text-yellow-800 mb-2 text-xs">📝 Nội dung CK:</h5>
              <p className="font-mono text-xs bg-white p-2 rounded border">
                NAP TIEN {new Date().getTime()}
              </p>
              <p className="text-xs text-yellow-700 mt-1">
                * Ghi đúng nội dung để xử lý nhanh
              </p>
            </div>
          </div>
        )

      case 'momo':
        return (
          <div className="space-y-3">
            <div className="bg-pink-50 border border-pink-200 rounded-xl p-3">
              <h4 className="font-semibold text-pink-800 mb-2 flex items-center gap-2 text-sm">
                📱 Ví MoMo
              </h4>
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-600">SĐT:</span>
                  <span className="font-mono font-bold text-pink-600">0123456789</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tên:</span>
                  <span className="font-medium">NGUYEN VAN A</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Số tiền:</span>
                  <span className="font-bold text-green-600">{formatCurrency(amount)}</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-3 text-center">
              <p className="text-xs text-gray-600 mb-2">Quét mã QR bằng ứng dụng MoMo</p>
              <img
                src={`${baseQRUrl}/api/qr-code/momo?amount=${amount}`}
                alt="MoMo QR Code"
                className="w-36 h-36 mx-auto rounded-lg border shadow-sm"
                onError={(e) => {
                  e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZmVmM2Y0Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iI2RiMjc3NyIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk1vTW8gUVIgQ29kZTwvdGV4dD48L3N2Zz4='
                }}
              />
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
              <h5 className="font-semibold text-blue-800 mb-2 text-xs">📖 Hướng dẫn:</h5>
              <ol className="text-xs text-blue-700 space-y-0.5 list-decimal list-inside">
                <li>Mở ứng dụng MoMo</li>
                <li>Chọn "Quét mã QR"</li>
                <li>Quét mã QR bên trên</li>
                <li>Xác nhận và chuyển tiền</li>
              </ol>
            </div>
          </div>
        )

      case 'zalopay':
        return (
          <div className="space-y-3">
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
              <h4 className="font-semibold text-blue-800 mb-2 flex items-center gap-2 text-sm">
                💰 Ví ZaloPay
              </h4>
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-600">SĐT:</span>
                  <span className="font-mono font-bold text-blue-600">0987654321</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tên:</span>
                  <span className="font-medium">TRAN THI B</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Số tiền:</span>
                  <span className="font-bold text-green-600">{formatCurrency(amount)}</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-3 text-center">
              <p className="text-xs text-gray-600 mb-2">Quét mã QR bằng ứng dụng ZaloPay</p>
              <img
                src={`${baseQRUrl}/api/qr-code/zalopay?amount=${amount}`}
                alt="ZaloPay QR Code"
                className="w-36 h-36 mx-auto rounded-lg border shadow-sm"
                onError={(e) => {
                  e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZWZmNmZmIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzM3MzNkYyIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPlphbG9QYXkgUVI8L3RleHQ+PC9zdmc+'
                }}
              />
            </div>

            <div className="bg-green-50 border border-green-200 rounded-xl p-3">
              <h5 className="font-semibold text-green-800 mb-2 text-xs">📖 Hướng dẫn:</h5>
              <ol className="text-xs text-green-700 space-y-0.5 list-decimal list-inside">
                <li>Mở ứng dụng ZaloPay</li>
                <li>Chọn "Quét mã"</li>
                <li>Quét mã QR bên trên</li>
                <li>Kiểm tra và thanh toán</li>
              </ol>
            </div>
          </div>
        )

      case 'vietqr':
        return (
          <div className="space-y-3">
            <div className="bg-purple-50 border border-purple-200 rounded-xl p-3">
              <h4 className="font-semibold text-purple-800 mb-2 flex items-center gap-2 text-sm">
                📲 VietQR
              </h4>
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-600">Ngân hàng:</span>
                  <span className="font-medium">Đa ngân hàng</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Số tiền:</span>
                  <span className="font-bold text-green-600">{formatCurrency(amount)}</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-3 text-center">
              <p className="text-xs text-gray-600 mb-2">Quét mã VietQR bằng ứng dụng ngân hàng</p>
              <img
                src={`${baseQRUrl}/api/qr-code/vietqr?amount=${amount}`}
                alt="VietQR Code"
                className="w-36 h-36 mx-auto rounded-lg border shadow-sm"
                onError={(e) => {
                  e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzc1MzNkYyIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPlZpZXRRUiBDb2RlPC90ZXh0Pjwvc3ZnPg=='
                }}
              />
            </div>

            <div className="bg-orange-50 border border-orange-200 rounded-xl p-3">
              <h5 className="font-semibold text-orange-800 mb-2 text-xs">📖 Hướng dẫn:</h5>
              <ol className="text-xs text-orange-700 space-y-0.5 list-decimal list-inside">
                <li>Mở ứng dụng Mobile Banking</li>
                <li>Chọn "Quét QR" hoặc "QR Pay"</li>
                <li>Quét mã VietQR bên trên</li>
                <li>Xác nhận và chuyển khoản</li>
              </ol>
              <p className="text-xs text-orange-600 mt-1">
                * Hỗ trợ tất cả app ngân hàng có VietQR
              </p>
            </div>
          </div>
        )

      default:
        return (
          <div className="text-center py-6">
            <span className="text-3xl mb-3 block">💳</span>
            <p className="text-gray-500 text-sm">Chọn phương thức thanh toán để xem hướng dẫn</p>
          </div>
        )
    }
  }

  const renderTabContent = () => {
    const tabTitle = {
      deposit: 'Nạp tiền',
      withdraw: 'Rút tiền',
      history: 'Lịch sử yêu cầu'
    }

    const tabIcon = {
      deposit: '💰',
      withdraw: '💸',
      history: '📋'
    }

    const tabDescription = {
      deposit: 'Tạo yêu cầu nạp tiền vào tài khoản',
      withdraw: 'Tạo yêu cầu rút tiền từ tài khoản',
      history: 'Xem tất cả yêu cầu nạp/rút tiền đã tạo'
    }

    return (
      <div className="mb-6">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-4 sm:p-6 lg:p-8 backdrop-blur-sm">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent flex items-center gap-2 sm:gap-3">
                <span className="text-3xl sm:text-4xl lg:text-5xl">{tabIcon[activeTab]}</span>
                {tabTitle[activeTab]}
              </h1>
              <p className="text-gray-600 mt-1 sm:mt-2 text-sm sm:text-base lg:text-lg">
                {tabDescription[activeTab]}
              </p>
            </div>
            {activeTab !== 'history' && (
              <button
                onClick={() => {
                  setCreateForm({ ...createForm, type: activeTab })
                  setShowCreateModal(true)
                }}
                className="inline-flex items-center gap-2 sm:gap-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 text-sm sm:text-base w-full sm:w-auto justify-center"
              >
                {activeTab === 'deposit' ? <FiPlus className="w-4 h-4 sm:w-5 sm:h-5" /> : <FiMinus className="w-4 h-4 sm:w-5 sm:h-5" />}
                <span>Tạo yêu cầu {activeTab === 'deposit' ? 'nạp' : 'rút'} tiền</span>
              </button>
            )}
          </div>
        </div>
      </div>
    )
  }

  useEffect(() => {
    fetchRequests()
  }, [currentPage, perPage, statusFilter, activeTab])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Tabs */}
        <div className="mb-6">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-1.5">
            <div className="grid grid-cols-3 gap-1">
              <button
                onClick={() => handleTabChange('deposit')}
                className={`flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-3 px-3 sm:px-6 py-3 sm:py-4 rounded-xl font-semibold transition-all duration-200 ${activeTab === 'deposit'
                  ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg'
                  : 'text-gray-600 hover:bg-gray-50'
                  }`}
              >
                <FiCreditCard className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="text-xs sm:text-base">💰 Nạp tiền</span>
              </button>
              <button
                onClick={() => handleTabChange('withdraw')}
                className={`flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-3 px-3 sm:px-6 py-3 sm:py-4 rounded-xl font-semibold transition-all duration-200 ${activeTab === 'withdraw'
                  ? 'bg-gradient-to-r from-red-500 to-pink-600 text-white shadow-lg'
                  : 'text-gray-600 hover:bg-gray-50'
                  }`}
              >
                <FiMinus className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="text-xs sm:text-base">💸 Rút tiền</span>
              </button>
              <button
                onClick={() => handleTabChange('history')}
                className={`flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-3 px-3 sm:px-6 py-3 sm:py-4 rounded-xl font-semibold transition-all duration-200 ${activeTab === 'history'
                  ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg'
                  : 'text-gray-600 hover:bg-gray-50'
                  }`}
              >
                <FiList className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="text-xs sm:text-base">📋 Lịch sử</span>
              </button>
            </div>
          </div>
        </div>

        {/* Tab Content Header */}
        {renderTabContent()}

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-4 sm:p-6 mb-6 sm:mb-8">
          <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4 flex items-center gap-2">
            🔍 Bộ lọc và tùy chọn
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:flex lg:flex-wrap gap-3 sm:gap-4">
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-600 mb-2">Trạng thái</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full sm:min-w-[180px] border-2 border-gray-200 rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 hover:bg-white text-sm sm:text-base"
              >
                <option value="all">🔄 Tất cả trạng thái</option>
                <option value="pending">⏳ Chờ duyệt</option>
                <option value="approved">✅ Đã duyệt</option>
                <option value="rejected">❌ Từ chối</option>
              </select>
            </div>

            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-600 mb-2">Số lượng hiển thị</label>
              <select
                value={perPage}
                onChange={(e) => setPerPage(Number(e.target.value))}
                className="w-full sm:min-w-[150px] border-2 border-gray-200 rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 hover:bg-white text-sm sm:text-base"
              >
                <option value={10}>📄 10 / trang</option>
                <option value={15}>📋 15 / trang</option>
                <option value={25}>📚 25 / trang</option>
                <option value={50}>📖 50 / trang</option>
              </select>
            </div>

            <div className="flex flex-col justify-end col-span-1 sm:col-span-2 lg:col-span-1">
              <button
                onClick={fetchRequests}
                className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 text-gray-700 px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl font-medium shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200 w-full text-sm sm:text-base"
              >
                <FiRefreshCw className="w-4 h-4" />
                <span>Làm mới</span>
              </button>
            </div>
          </div>
        </div>

        {/* Requests List */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 bg-white rounded-2xl shadow-lg">
            <div className="relative">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200"></div>
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent absolute top-0"></div>
            </div>
            <p className="mt-6 text-gray-600 text-lg font-medium">Đang tải dữ liệu...</p>
            <p className="text-gray-400 text-sm">Vui lòng chờ trong giây lát</p>
          </div>
        ) : (
          <div className="space-y-4 sm:space-y-6">
            {requests.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 sm:p-8 lg:p-12 text-center">
                <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                  <span className="text-2xl sm:text-3xl lg:text-4xl">
                    {activeTab === 'deposit' ? '💰' : activeTab === 'withdraw' ? '💸' : '📋'}
                  </span>
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-700 mb-2">
                  {activeTab === 'history'
                    ? 'Chưa có yêu cầu nào'
                    : `Chưa có yêu cầu ${activeTab === 'deposit' ? 'nạp' : 'rút'} tiền`
                  }
                </h3>
                <p className="text-gray-500 mb-4 sm:mb-6 text-sm sm:text-base">
                  {activeTab === 'history'
                    ? 'Bạn chưa tạo yêu cầu nạp hoặc rút tiền nào.'
                    : `Bạn chưa tạo yêu cầu ${activeTab === 'deposit' ? 'nạp' : 'rút'} tiền nào. Hãy tạo yêu cầu đầu tiên!`
                  }
                </p>
                {activeTab !== 'history' && (
                  <button
                    onClick={() => {
                      setCreateForm({ ...createForm, type: activeTab })
                      setShowCreateModal(true)
                    }}
                    className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 text-sm sm:text-base w-full sm:w-auto"
                  >
                    {activeTab === 'deposit' ? <FiPlus className="w-4 h-4 sm:w-5 sm:h-5" /> : <FiMinus className="w-4 h-4 sm:w-5 sm:h-5" />}
                    Tạo yêu cầu đầu tiên
                  </button>
                )}
              </div>
            ) : (
              requests.map((request) => (
                <div key={request.id} className="bg-white rounded-2xl shadow-lg hover:shadow-xl border border-gray-100 p-4 sm:p-6 transition-all duration-300 hover:transform hover:scale-[1.02]">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 sm:gap-4">
                    <div className="flex-1 space-y-2 sm:space-y-3">
                      <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                        <div className="flex items-center gap-1 sm:gap-2">
                          <span className="text-xl sm:text-2xl">{(request as any).type === 'withdraw' ? '💸' : '💰'}</span>
                          <h3 className="font-bold text-lg sm:text-xl text-gray-800">#{request.id}</h3>
                          <span className="px-2 sm:px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-600">
                            {(request as any).type === 'withdraw' ? 'RÚT TIỀN' : 'NẠP TIỀN'}
                          </span>
                        </div>
                        <span className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-semibold shadow-sm ${statusColors[request.status]} border`}>
                          {statusNames[request.status]}
                        </span>
                      </div>

                      <div className={`rounded-xl p-3 sm:p-4 border ${(request as any).type === 'withdraw' ? 'bg-gradient-to-r from-red-50 to-pink-50 border-red-100' : 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-100'}`}>
                        <p className={`text-2xl sm:text-3xl font-bold bg-gradient-to-r ${(request as any).type === 'withdraw' ? 'from-red-600 to-pink-600' : 'from-blue-600 to-indigo-600'} bg-clip-text text-transparent`}>
                          {formatCurrency(request.amount)}
                        </p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 text-xs sm:text-sm">
                        {(request as any).type === 'deposit' ? (
                          <div className="flex items-center gap-2">
                            <span className="text-lg">💳</span>
                            <span className="font-medium text-gray-600">Phương thức:</span>
                            <span className="text-gray-800">{paymentMethodNames[request.payment_method]}</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <span className="text-lg">🏦</span>
                            <span className="font-medium text-gray-600">Ngân hàng:</span>
                            <span className="text-gray-800">{(request as any).bank_name || 'N/A'}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <span className="text-lg">📅</span>
                          <span className="font-medium text-gray-600">Thời gian:</span>
                          <span className="text-gray-800">{new Date(request.created_at).toLocaleString('vi-VN')}</span>
                        </div>
                      </div>

                      {request.note && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                          <div className="flex items-start gap-2">
                            <span className="text-lg">📝</span>
                            <div>
                              <span className="font-medium text-yellow-800">Ghi chú:</span>
                              <p className="text-yellow-700 mt-1">{request.note}</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col gap-2 mt-3 lg:mt-0">
                      <button
                        onClick={() => viewRequest(request)}
                        className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white px-4 py-2.5 sm:py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 text-sm sm:text-base w-full sm:w-auto"
                      >
                        <FiEye className="w-4 h-4" />
                        <span>Chi tiết</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
              <div className="text-xs sm:text-sm text-gray-600 order-2 sm:order-1">
                Trang <span className="font-semibold">{currentPage}</span> của <span className="font-semibold">{totalPages}</span>
              </div>

              <div className="flex items-center gap-2 order-1 sm:order-2 w-full sm:w-auto justify-center">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 text-gray-700 rounded-xl font-medium shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 text-sm"
                >
                  <span className="hidden sm:inline">←</span> Trước
                </button>

                <div className="hidden md:flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const pageNum = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`w-10 h-10 rounded-xl font-semibold transition-all duration-200 ${currentPage === pageNum
                          ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg scale-110'
                          : 'bg-gray-100 hover:bg-gray-200 text-gray-700 hover:shadow-md'
                          }`}
                      >
                        {pageNum}
                      </button>
                    )
                  })}
                </div>

                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 text-gray-700 rounded-xl font-medium shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 text-sm"
                >
                  Sau <span className="hidden sm:inline">→</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Create Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl transform transition-all duration-300 scale-100 max-h-[80vh] overflow-hidden flex flex-col">
              {/* Header */}
              <div className={`bg-gradient-to-r ${createForm.type === 'withdraw' ? 'from-red-600 to-pink-600' : 'from-blue-600 to-indigo-600'} rounded-t-3xl p-6 text-white flex-shrink-0`}>
                <h2 className="text-xl font-bold flex items-center gap-3">
                  <span className="text-2xl">{createForm.type === 'withdraw' ? '💸' : '💰'}</span>
                  Tạo yêu cầu {createForm.type === 'withdraw' ? 'rút' : 'nạp'} tiền
                </h2>
                <p className={`${createForm.type === 'withdraw' ? 'text-red-100' : 'text-blue-100'} mt-1 text-sm`}>
                  {createForm.type === 'withdraw'
                    ? 'Điền thông tin ngân hàng để rút tiền từ tài khoản'
                    : 'Điền thông tin và làm theo hướng dẫn để nạp tiền'
                  }
                </p>
              </div>

              {/* Scrollable Body */}
              <div className="flex-1 overflow-y-auto custom-scrollbar min-h-0">
                <div className={`grid grid-cols-1 ${createForm.type === 'deposit' ? 'lg:grid-cols-2' : ''} gap-6 p-6`}>
                  {/* Left Column - Form */}
                  <div className="space-y-5">
                    <div>
                      <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                        <span className="text-base">💵</span>
                        Số tiền (EUR) *
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          value={createForm.amount || ''}
                          onChange={(e) => setCreateForm({
                            ...createForm,
                            amount: Number(e.target.value)
                          })}
                          className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-lg font-semibold focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 hover:bg-white"
                          placeholder={`Nhập số tiền cần ${createForm.type === 'withdraw' ? 'rút' : 'nạp'}`}
                          min="10"
                          max="10000"
                        />
                        <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 font-medium text-sm">
                          EUR
                        </div>
                      </div>
                      <div className={`border rounded-lg p-2 mt-2 ${createForm.type === 'withdraw' ? 'bg-red-50 border-red-200' : 'bg-blue-50 border-blue-200'}`}>
                        <p className={`text-xs flex items-center gap-2 ${createForm.type === 'withdraw' ? 'text-red-700' : 'text-blue-700'}`}>
                          <span>ℹ️</span>
                          Tối thiểu €10, tối đa €10,000
                        </p>
                      </div>
                    </div>

                    {renderCreateFormFields()}

                    <div>
                      <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                        <span className="text-base">📝</span>
                        Ghi chú
                      </label>
                      <textarea
                        value={createForm.note}
                        onChange={(e) => setCreateForm({
                          ...createForm,
                          note: e.target.value
                        })}
                        className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 hover:bg-white resize-none"
                        rows={3}
                        placeholder="Ghi chú thêm (không bắt buộc)"
                      />
                    </div>
                  </div>

                  {/* Right Column - Payment Instructions (only for deposit) */}
                  {createForm.type === 'deposit' && (
                    <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-5 border">
                      <h3 className="text-base font-bold text-gray-800 mb-3 flex items-center gap-2">
                        📖 Hướng dẫn thanh toán
                      </h3>
                      {renderPaymentInstructions()}
                    </div>
                  )}
                </div>
              </div>

              {/* Footer */}
              <div className="bg-gray-50 rounded-b-3xl p-5 border-t flex-shrink-0">
                <div className="flex flex-col sm:flex-row gap-3 sm:justify-end">
                  <button
                    onClick={() => setShowCreateModal(false)}
                    className="px-5 py-2.5 text-gray-600 border-2 border-gray-300 rounded-xl hover:bg-gray-100 hover:border-gray-400 transition-all duration-200 font-semibold text-sm"
                    disabled={createLoading}
                  >
                    Hủy bỏ
                  </button>
                  <button
                    onClick={createRequest}
                    disabled={createLoading}
                    className={`px-5 py-2.5 bg-gradient-to-r ${createForm.type === 'withdraw' ? 'from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700' : 'from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700'} text-white rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:transform-none font-semibold text-sm`}
                  >
                    {createLoading ? (
                      <span className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                        Đang tạo...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        {createForm.type === 'withdraw' ? <FiMinus className="w-4 h-4" /> : <FiPlus className="w-4 h-4" />}
                        Tạo yêu cầu
                      </span>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Custom Scrollbar Styles */}
            <style jsx>{`
              .custom-scrollbar::-webkit-scrollbar {
                width: 8px;
              }
              .custom-scrollbar::-webkit-scrollbar-track {
                background: #f1f5f9;
                border-radius: 10px;
              }
              .custom-scrollbar::-webkit-scrollbar-thumb {
                background: linear-gradient(135deg, #3b82f6, #6366f1);
                border-radius: 10px;
                border: 2px solid #f1f5f9;
              }
              .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                background: linear-gradient(135deg, #2563eb, #4f46e5);
              }
              .custom-scrollbar {
                scrollbar-width: thin;
                scrollbar-color: #3b82f6 #f1f5f9;
              }
            `}</style>
          </div>
        )}

        {/* Detail Modal */}
        {showDetailModal && selectedRequest && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl transform transition-all duration-300 scale-100 max-h-[90vh] overflow-y-auto">
              {/* Header */}
              <div className={`bg-gradient-to-r ${(selectedRequest as any).type === 'withdraw' ? 'from-red-600 to-pink-600' : 'from-indigo-600 to-purple-600'} rounded-t-3xl p-6 text-white`}>
                <h2 className="text-2xl font-bold flex items-center gap-3">
                  <span className="text-3xl">{(selectedRequest as any).type === 'withdraw' ? '💸' : '💰'}</span>
                  Chi tiết yêu cầu #{selectedRequest.id}
                </h2>
                <p className={`${(selectedRequest as any).type === 'withdraw' ? 'text-red-100' : 'text-indigo-100'} mt-2`}>
                  Thông tin chi tiết về yêu cầu {(selectedRequest as any).type === 'withdraw' ? 'rút' : 'nạp'} tiền
                </p>
              </div>

              {/* Body */}
              <div className="p-6 space-y-6">
                {/* Status và Amount */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-4 border">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg">📊</span>
                      <span className="text-sm font-medium text-gray-600">Trạng thái</span>
                    </div>
                    <span className={`inline-flex px-4 py-2 rounded-xl text-sm font-bold ${statusColors[selectedRequest.status]} border shadow-sm`}>
                      {statusNames[selectedRequest.status]}
                    </span>
                  </div>

                  <div className={`rounded-2xl p-4 border ${(selectedRequest as any).type === 'withdraw' ? 'bg-gradient-to-br from-red-50 to-pink-50 border-red-100' : 'bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-100'}`}>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg">{(selectedRequest as any).type === 'withdraw' ? '💸' : '💰'}</span>
                      <span className="text-sm font-medium text-gray-600">Số tiền</span>
                    </div>
                    <span className={`text-2xl font-bold bg-gradient-to-r ${(selectedRequest as any).type === 'withdraw' ? 'from-red-600 to-pink-600' : 'from-blue-600 to-indigo-600'} bg-clip-text text-transparent`}>
                      {formatCurrency(selectedRequest.amount)}
                    </span>
                  </div>
                </div>

                {/* Type badge */}
                <div className="flex items-center justify-center">
                  <span className={`px-6 py-3 rounded-full text-lg font-bold ${(selectedRequest as any).type === 'withdraw' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                    {(selectedRequest as any).type === 'withdraw' ? '💸 YÊU CẦU RÚT TIỀN' : '💰 YÊU CẦU NẠP TIỀN'}
                  </span>
                </div>

                {/* Thông tin theo type */}
                {(selectedRequest as any).type === 'deposit' ? (
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-4 border border-green-100">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg">💳</span>
                      <span className="text-sm font-medium text-gray-600">Phương thức thanh toán</span>
                    </div>
                    <span className="text-lg font-semibold text-green-700">{paymentMethodNames[selectedRequest.payment_method]}</span>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl p-4 border border-blue-100">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-lg">🏦</span>
                        <span className="text-sm font-medium text-gray-600">Thông tin ngân hàng</span>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Ngân hàng:</span>
                          <span className="font-semibold">{(selectedRequest as any).bank_name || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Chủ tài khoản:</span>
                          <span className="font-semibold">{(selectedRequest as any).account_holder_name || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Số tài khoản:</span>
                          <span className="font-mono font-semibold">{(selectedRequest as any).account_number || 'N/A'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-4 border border-purple-100">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">📅</span>
                    <span className="text-sm font-medium text-gray-600">Thời gian tạo</span>
                  </div>
                  <span className="text-lg font-semibold text-purple-700">{new Date(selectedRequest.created_at).toLocaleString('vi-VN')}</span>
                </div>

                {/* Ghi chú */}
                {selectedRequest.note && (
                  <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl p-4 border border-yellow-200">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-lg">📝</span>
                      <span className="text-sm font-semibold text-yellow-800">Ghi chú của bạn</span>
                    </div>
                    <p className="text-yellow-700 bg-white/50 rounded-lg p-3 border">{selectedRequest.note}</p>
                  </div>
                )}

                {selectedRequest.admin_note && (
                  <div className="bg-gradient-to-r from-red-50 to-pink-50 rounded-2xl p-4 border border-red-200">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-lg">👨‍💼</span>
                      <span className="text-sm font-semibold text-red-800">Ghi chú từ quản trị viên</span>
                    </div>
                    <p className="text-red-700 bg-white/50 rounded-lg p-3 border">{selectedRequest.admin_note}</p>
                  </div>
                )}

                {selectedRequest.approved_at && (
                  <div className="bg-gradient-to-r from-green-50 to-teal-50 rounded-2xl p-4 border border-green-200">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg">✅</span>
                      <span className="text-sm font-medium text-gray-600">Thời gian duyệt</span>
                    </div>
                    <span className="text-lg font-semibold text-green-700">{new Date(selectedRequest.approved_at).toLocaleString('vi-VN')}</span>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="bg-gray-50 rounded-b-3xl p-6">
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="w-full px-6 py-3 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 font-semibold"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
