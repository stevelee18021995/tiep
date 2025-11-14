"use client";

import { useState } from 'react';
import {
  Crown,
  Check,
  Star,
  Zap,
  Shield,
  Gift,
  TrendingUp,
  Users,
  ChevronRight
} from 'lucide-react';

interface Plan {
  id: string;
  name: string;
  level: number;
  price: number;
  originalPrice?: number;
  color: string;
  bgColor: string;
  icon: any;
  popular?: boolean;
  features: string[];
  benefits: {
    downloads: string;
    support: string;
    storage: string;
    api: string;
  };
}

export default function UpgradePage() {
  const [selectedPlan, setSelectedPlan] = useState<string>('silver');

  // Giả sử user hiện tại đang ở gói Basic
  const currentPlan = 'basic';

  const plans: Plan[] = [
    {
      id: 'basic',
      name: 'Basic',
      level: 1,
      price: 0,
      color: 'text-gray-600',
      bgColor: 'bg-gray-100',
      icon: Users,
      features: [
        'Truy cập cơ bản',
        'Hỗ trợ email',
        '5 GB lưu trữ',
        '100 downloads/tháng'
      ],
      benefits: {
        downloads: '100/tháng',
        support: 'Email',
        storage: '5 GB',
        api: 'Không'
      }
    },
    {
      id: 'silver',
      name: 'Bạc',
      level: 2,
      price: 299000,
      originalPrice: 399000,
      color: 'text-gray-500',
      bgColor: 'bg-gray-200',
      icon: Shield,
      features: [
        'Tất cả tính năng Basic',
        'Hỗ trợ chat',
        '50 GB lưu trữ',
        '1,000 downloads/tháng',
        'API cơ bản'
      ],
      benefits: {
        downloads: '1,000/tháng',
        support: 'Chat + Email',
        storage: '50 GB',
        api: 'Cơ bản'
      }
    },
    {
      id: 'gold',
      name: 'Vàng',
      level: 3,
      price: 599000,
      originalPrice: 799000,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
      icon: Star,
      popular: true,
      features: [
        'Tất cả tính năng Bạc',
        'Hỗ trợ ưu tiên',
        '200 GB lưu trữ',
        '5,000 downloads/tháng',
        'API nâng cao',
        'Tính năng độc quyền'
      ],
      benefits: {
        downloads: '5,000/tháng',
        support: 'Ưu tiên 24/7',
        storage: '200 GB',
        api: 'Nâng cao'
      }
    },
    {
      id: 'platinum',
      name: 'Bạch Kim',
      level: 4,
      price: 1199000,
      originalPrice: 1599000,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      icon: Zap,
      features: [
        'Tất cả tính năng Vàng',
        'Quản lý tài khoản chuyên biệt',
        '500 GB lưu trữ',
        '20,000 downloads/tháng',
        'API không giới hạn',
        'Phân tích chi tiết',
        'Tùy chỉnh nâng cao'
      ],
      benefits: {
        downloads: '20,000/tháng',
        support: 'Chuyên biệt 24/7',
        storage: '500 GB',
        api: 'Không giới hạn'
      }
    },
    {
      id: 'diamond',
      name: 'Kim Cương',
      level: 5,
      price: 2399000,
      originalPrice: 2999000,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      icon: Crown,
      features: [
        'Tất cả tính năng Bạch Kim',
        'Tư vấn 1-on-1',
        '1 TB lưu trữ',
        'Downloads không giới hạn',
        'API Enterprise',
        'Tích hợp tùy chỉnh',
        'Báo cáo chi tiết',
        'Ưu tiên phát triển tính năng'
      ],
      benefits: {
        downloads: 'Không giới hạn',
        support: 'Tư vấn 1-on-1',
        storage: '1 TB',
        api: 'Enterprise'
      }
    }
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  const getCurrentPlanIndex = () => {
    return plans.findIndex(plan => plan.id === currentPlan);
  };

  const getAvailablePlans = () => {
    const currentIndex = getCurrentPlanIndex();
    return plans.filter((_, index) => index > currentIndex);
  };

  const handleUpgrade = (planId: string) => {
    // TODO: Implement upgrade logic
    console.log('Upgrading to:', planId);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="h-8 w-8 sm:h-10 sm:w-10 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
            <Crown className="h-4 w-4 sm:h-6 sm:w-6 text-white" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
            Nâng cấp gói thành viên
          </h1>
        </div>
        <p className="text-gray-600 text-sm sm:text-base">
          Mở khóa nhiều tính năng hơn với các gói thành viên cao cấp
        </p>
      </div>

      {/* Current Plan */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
        <div className="flex items-center gap-4 mb-4">
          <div className="h-12 w-12 bg-gray-100 rounded-lg flex items-center justify-center">
            <Users className="h-6 w-6 text-gray-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Gói hiện tại: Basic</h3>
            <p className="text-gray-600">Bạn đang sử dụng gói miễn phí</p>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <p className="text-sm text-gray-600">Downloads</p>
            <p className="font-semibold">100/tháng</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Lưu trữ</p>
            <p className="font-semibold">5 GB</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Hỗ trợ</p>
            <p className="font-semibold">Email</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">API</p>
            <p className="font-semibold text-red-600">Không</p>
          </div>
        </div>
      </div>

      {/* Pricing Plans */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {getAvailablePlans().map((plan) => {
          const Icon = plan.icon;
          const isSelected = selectedPlan === plan.id;

          return (
            <div
              key={plan.id}
              className={`relative bg-white rounded-xl shadow-sm border-2 transition-all cursor-pointer ${isSelected ? 'border-blue-500 shadow-lg' : 'border-gray-100 hover:border-gray-200'
                }`}
              onClick={() => setSelectedPlan(plan.id)}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-1 rounded-full text-xs font-medium">
                    Phổ biến nhất
                  </span>
                </div>
              )}

              <div className="p-6">
                {/* Plan Header */}
                <div className="text-center mb-6">
                  <div className={`h-16 w-16 ${plan.bgColor} rounded-xl flex items-center justify-center mx-auto mb-4`}>
                    <Icon className={`h-8 w-8 ${plan.color}`} />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
                  <div className="mt-2">
                    {plan.originalPrice && (
                      <span className="text-gray-400 line-through text-sm">
                        {formatCurrency(plan.originalPrice)}
                      </span>
                    )}
                    <div className="text-3xl font-bold text-gray-900">
                      {formatCurrency(plan.price)}
                      <span className="text-sm text-gray-600 font-normal">/tháng</span>
                    </div>
                  </div>
                </div>

                {/* Benefits Grid */}
                <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
                  <div className="text-center">
                    <p className="text-gray-600">Downloads</p>
                    <p className="font-semibold">{plan.benefits.downloads}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-gray-600">Lưu trữ</p>
                    <p className="font-semibold">{plan.benefits.storage}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-gray-600">Hỗ trợ</p>
                    <p className="font-semibold">{plan.benefits.support}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-gray-600">API</p>
                    <p className="font-semibold">{plan.benefits.api}</p>
                  </div>
                </div>

                {/* Features */}
                <div className="space-y-2 mb-6">
                  {plan.features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                      <span className="text-sm text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>

                {/* Select Button */}
                <button
                  className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${isSelected
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                >
                  {isSelected ? 'Đã chọn' : 'Chọn gói này'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Upgrade Summary */}
      {selectedPlan && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Tóm tắt nâng cấp</h3>

          <div className="flex items-center justify-between py-4 border-b border-gray-200">
            <div>
              <p className="font-medium text-gray-900">
                Nâng cấp lên gói {plans.find(p => p.id === selectedPlan)?.name}
              </p>
              <p className="text-sm text-gray-600">Thanh toán hàng tháng</p>
            </div>
            <div className="text-right">
              <p className="text-xl font-bold text-gray-900">
                {formatCurrency(plans.find(p => p.id === selectedPlan)?.price || 0)}
              </p>
              <p className="text-sm text-gray-600">/tháng</p>
            </div>
          </div>

          <div className="flex items-center gap-4 mt-6">
            <button
              onClick={() => handleUpgrade(selectedPlan)}
              className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-6 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all transform hover:scale-105 shadow-lg font-medium flex items-center justify-center gap-2"
            >
              <Crown className="h-5 w-5" />
              Nâng cấp ngay
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <div className="flex items-start gap-3">
              <Gift className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-blue-900">Ưu đãi đặc biệt!</p>
                <p className="text-xs text-blue-700">
                  Nâng cấp ngay để nhận ngay 30 ngày dùng thử miễn phí và giảm giá 25% cho tháng đầu tiên.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* FAQ or Benefits Section */}
      <div className="mt-8 bg-gray-50 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Lợi ích của việc nâng cấp</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-start gap-3">
            <TrendingUp className="h-6 w-6 text-green-500 mt-1" />
            <div>
              <h4 className="font-medium text-gray-900">Hiệu suất cao hơn</h4>
              <p className="text-sm text-gray-600">Trải nghiệm nhanh hơn với bandwidth cao cấp</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Shield className="h-6 w-6 text-blue-500 mt-1" />
            <div>
              <h4 className="font-medium text-gray-900">Bảo mật nâng cao</h4>
              <p className="text-sm text-gray-600">Tính năng bảo mật và backup tự động</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Star className="h-6 w-6 text-yellow-500 mt-1" />
            <div>
              <h4 className="font-medium text-gray-900">Hỗ trợ ưu tiên</h4>
              <p className="text-sm text-gray-600">Hỗ trợ 24/7 từ đội ngũ chuyên nghiệp</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
