'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  FileSpreadsheet,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  Check
} from 'lucide-react';

export default function PaymentPage() {
  const { data: session, status } = useSession() || {};
  const router = useRouter();

  // 1. Quản lý trạng thái gói được chọn
  const [selectedPlan, setSelectedPlan] = useState({
    id: '3-months',
    name: '3 tháng',
    price: '250.000₫',
    code: '3T'
  });

  const plans = [
    {
      id: '1-month',
      name: '1 tháng',
      price: '99.000₫',
      code: '1T',
      features: ['Không giới hạn file', 'Hỗ trợ 24/7', 'Tự động cập nhật'],
      popular: false
    },
    {
      id: '3-months',
      name: '3 tháng',
      price: '250.000₫',
      code: '3T',
      features: ['Tiết kiệm 16%', 'Không giới hạn file', 'Hỗ trợ ưu tiên'],
      popular: true
    },
    {
      id: '1-year',
      name: '1 năm',
      price: '890.000₫',
      code: '1Y',
      features: ['Tiết kiệm 17%', 'Tất cả tính năng', 'Hỗ trợ VIP'],
      popular: false
    }
  ];

  useEffect(() => {
    if (status === 'loading') return;
    if (!session?.user) {
      router.replace('/login');
      return;
    }
    const expiryDate = (session.user as any)?.expiryDate;
    if (expiryDate && new Date(expiryDate) >= new Date()) {
      router.replace('/dashboard');
    }
  }, [session, status, router]);

  if (status === 'loading') return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center space-x-2">
              <FileSpreadsheet className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">MISA Invoice Manager</span>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Alert */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 mb-8 flex items-start space-x-3">
          <AlertCircle className="h-6 w-6 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-yellow-900 mb-1">Tài khoản chưa được kích hoạt</h3>
            <p className="text-yellow-800">Vui lòng chọn gói dịch vụ và thanh toán để tiếp tục sử dụng.</p>
          </div>
        </div>

        {/* 2. Pricing Selection Section */}
        <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl shadow-xl p-8 mb-8 text-white">
          <h3 className="text-2xl font-bold mb-8 text-center uppercase tracking-wide">Chọn gói dịch vụ của bạn</h3>
          <div className="grid md:grid-cols-3 gap-6">
            {plans.map((plan) => (
              <div
                key={plan.id}
                onClick={() => setSelectedPlan(plan)}
                className={`relative cursor-pointer transition-all duration-300 rounded-xl p-6 flex flex-col border-2 
                  ${selectedPlan.id === plan.id 
                    ? 'bg-white text-blue-900 border-yellow-400 scale-105 shadow-2xl' 
                    : 'bg-white/10 text-white border-transparent hover:bg-white/20'}`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-yellow-400 text-gray-900 text-[10px] font-black px-3 py-1 rounded-full uppercase">
                    Phổ biến
                  </div>
                )}
                
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-bold text-lg">{plan.name}</h4>
                  {selectedPlan.id === plan.id && <Check className="h-5 w-5 text-blue-600" />}
                </div>

                <p className="text-2xl font-black mb-4">{plan.price}</p>
                <ul className="space-y-2 mt-auto">
                  {plan.features.map((f, i) => (
                    <li key={i} className="text-xs flex items-center opacity-90">
                      <span className="mr-2">•</span> {f}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Payment Info */}
          <div className="bg-white rounded-xl shadow-lg p-8 border border-blue-100">
            <div className="flex items-center space-x-2 mb-6 text-blue-700">
              <CreditCard className="h-6 w-6" />
              <h2 className="text-2xl font-bold">Thanh toán</h2>
            </div>

            <div className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                <p className="text-xs text-blue-600 uppercase font-bold mb-1">Gói đã chọn</p>
                <p className="text-xl font-bold text-blue-900">{selectedPlan.name} - {selectedPlan.price}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500 uppercase">Ngân hàng</p>
                  <p className="font-bold">TPBank</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase">Chủ TK</p>
                  <p className="font-bold text-sm">NGUYEN THANH TRUONG</p>
                </div>
              </div>

              <div>
                <p className="text-xs text-gray-500 uppercase">Số tài khoản</p>
                <div className="flex items-center justify-between">
                  <p className="text-2xl font-mono font-bold text-blue-600 tracking-tighter">0000 3269 352</p>
                </div>
              </div>

              <div className="pt-4 border-t">
                <p className="text-xs text-gray-500 uppercase mb-1">Nội dung chuyển khoản</p>
                <p className="font-mono bg-yellow-100 p-2 rounded text-blue-800 font-bold text-center border-dashed border-2 border-yellow-400">
                  MISA {selectedPlan.code} {session?.user?.email?.split('@')?.[0] ?? ''}
                </p>
              </div>
            </div>
          </div>

          {/* QR Code */}
          <div className="bg-white rounded-xl shadow-lg p-8 border border-blue-100 flex flex-col items-center justify-center">
            <h3 className="text-lg font-bold mb-4">Quét mã VietQR</h3>
            <div className="relative w-full aspect-square bg-white rounded-lg border-2 border-gray-100 p-2">
              {/* Lưu ý: Bạn có thể dùng link API QR của VietQR để tự động cập nhật số tiền */}
              <Image
                src={`https://img.vietqr.io/image/tpbank-00003269352-compact2.png?amount=${selectedPlan.price.replace(/\./g, '').replace('₫', '')}&addInfo=MISA%20${selectedPlan.code}%20${session?.user?.email?.split('@')?.[0] ?? ''}`}
                alt="QR Code thanh toán"
                fill
                className="object-contain"
              />
            </div>
            <p className="text-[11px] text-gray-500 mt-4 italic text-center">
              * Mã QR tự động bao gồm số tiền và nội dung chuyển khoản
            </p>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-white rounded-xl shadow-lg p-8 mt-8 border border-gray-100">
          <h3 className="text-xl font-bold mb-6 flex items-center">
             <CheckCircle2 className="mr-2 text-green-500" /> Quy trình kích hoạt
          </h3>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { step: '1', title: 'Thanh toán', desc: 'Chọn gói và chuyển khoản qua QR/Banking' },
              { step: '2', title: 'Xác nhận', desc: 'Gửi ảnh bill cho Admin qua Zalo/Email' },
              { step: '3', title: 'Sử dụng', desc: 'Tài khoản kích hoạt sau 5-30 phút' },
            ].map((item) => (
              <div key={item.step} className="relative p-4 rounded-lg bg-gray-50 border border-gray-100">
                <span className="absolute -top-3 -left-2 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold shadow-lg">
                  {item.step}
                </span>
                <p className="font-bold mb-1 mt-2">{item.title}</p>
                <p className="text-xs text-gray-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}