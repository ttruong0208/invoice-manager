import Link from 'next/link';
import { FileSpreadsheet, CheckCircle2, Shield, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-sm bg-white/80 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <FileSpreadsheet className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">
                MISA Invoice Manager
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/login">
                <Button variant="ghost">Đăng nhập</Button>
              </Link>
              <Link href="/signup">
                <Button className="bg-blue-600 hover:bg-blue-700">
                  Đăng ký ngay
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Quản lý hóa đơn <span className="text-blue-600">thông minh</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Tự động gộp đơn hàng, tính thuế VAT 8% chính xác và xuất file MISA
            meInvoice chuẩn chỉ trong vài giây
          </p>
          <div className="flex justify-center space-x-4">
            <Link href="/signup">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                Bắt đầu ngay - Miễn phí
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline">
                Đăng nhập
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">
          Tính năng nổi bật
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
            <div className="bg-blue-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
              <Zap className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold mb-2">Tự động gộp đơn</h3>
            <p className="text-gray-600">
              Hệ thống tự động gộp tất cả các dòng có cùng mã đơn hàng thành một
              đơn duy nhất, tiết kiệm thời gian xử lý thủ công
            </p>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
            <div className="bg-blue-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
              <CheckCircle2 className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold mb-2">Tính thuế chính xác</h3>
            <p className="text-gray-600">
              Tính toán thuế VAT 8% chính xác từ cột "Tiền về túi", tự động tính
              thành tiền trước thuế và đơn giá
            </p>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
            <div className="bg-blue-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
              <Shield className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold mb-2">Xuất file chuẩn</h3>
            <p className="text-gray-600">
              Xuất file MISA meInvoice với đầy đủ các cột theo đúng chuẩn, sẵn sàng
              import vào hệ thống MISA
            </p>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">Cách sử dụng</h2>
        <div className="grid md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="bg-blue-600 text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
              1
            </div>
            <h3 className="font-semibold mb-2">Đăng ký tài khoản</h3>
            <p className="text-gray-600 text-sm">
              Tạo tài khoản miễn phí chỉ với email
            </p>
          </div>
          <div className="text-center">
            <div className="bg-blue-600 text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
              2
            </div>
            <h3 className="font-semibold mb-2">Kích hoạt gói dịch vụ</h3>
            <p className="text-gray-600 text-sm">
              Chuyển khoản và liên hệ admin kích hoạt
            </p>
          </div>
          <div className="text-center">
            <div className="bg-blue-600 text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
              3
            </div>
            <h3 className="font-semibold mb-2">Tải file Excel</h3>
            <p className="text-gray-600 text-sm">
              Kéo thả file Excel từ sàn TMĐT vào hệ thống
            </p>
          </div>
          <div className="text-center">
            <div className="bg-blue-600 text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
              4
            </div>
            <h3 className="font-semibold mb-2">Nhận file MISA</h3>
            <p className="text-gray-600 text-sm">
              Tự động tải file MISA meInvoice đã xử lý
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-blue-600 py-16">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-3xl font-bold text-white mb-4">
            Sẵn sàng bắt đầu?
          </h2>
          <p className="text-blue-100 mb-8">
            Đăng ký ngay hôm nay và trải nghiệm quản lý hóa đơn thông minh
          </p>
          <Link href="/signup">
            <Button
              size="lg"
              className="bg-white text-blue-600 hover:bg-gray-100"
            >
              Đăng ký miễn phí
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p>&copy; 2026 MISA Invoice Manager. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
