'use client';

import { useEffect, useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  FileSpreadsheet,
  Upload,
  Loader2,
  LogOut,
  Calendar,
  User,
  Shield,
} from 'lucide-react';
import { toast } from 'sonner';

export default function DashboardPage() {
  const { data: session, status } = useSession() || {};
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  useEffect(() => {
    if (status === 'loading') return;

    if (!session?.user) {
      router.replace('/login');
      return;
    }

    // Check expiry
    const expiryDate = (session.user as any)?.expiryDate;
    if (!expiryDate || new Date(expiryDate) < new Date()) {
      router.replace('/payment');
    }
  }, [session, status, router]);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer?.files?.[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (
        droppedFile.type ===
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
        droppedFile.type === 'application/vnd.ms-excel'
      ) {
        setFile(droppedFile);
      } else {
        toast.error('Vui lòng chọn file Excel (.xlsx hoặc .xls)');
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target?.files?.[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleProcess = async () => {
    if (!file) {
      toast.error('Vui lòng chọn file Excel');
      return;
    }

    setProcessing(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/excel/process', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        toast.error(error.error || 'Xử lý file thất bại');
        return;
      }

      // Download file
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `MISA_Invoice_${Date.now()}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success('Xử lý thành công! File đang được tải xuống');
      setFile(null);
    } catch (error) {
      console.error('Processing error:', error);
      toast.error('Đã xảy ra lỗi khi xử lý file');
    } finally {
      setProcessing(false);
    }
  };

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return 'Chưa kích hoạt';
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const isAdmin = (session?.user as any)?.isAdmin ?? false;

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <FileSpreadsheet className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">
                HĐĐT
              </span>
            </div>
            <div className="flex items-center space-x-4">
              {isAdmin && (
                <Button
                  variant="outline"
                  onClick={() => router.push('/admin')}
                >
                  <Shield className="h-4 w-4 mr-2" />
                  Admin Panel
                </Button>
              )}
              <Button
                variant="outline"
                onClick={() => signOut({ callbackUrl: '/' })}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Đăng xuất
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* User Info */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-xl font-bold mb-4">Thông tin tài khoản</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-100 p-2 rounded-lg">
                <User className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="font-semibold">{session?.user?.email ?? ''}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="bg-blue-100 p-2 rounded-lg">
                <Calendar className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Ngày hết hạn</p>
                <p className="font-semibold">
                  {formatDate((session?.user as any)?.expiryDate)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Upload Section */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-bold mb-6 text-center">
            Chuyển đổi file Excel
          </h2>

          <div
            className={`border-2 border-dashed rounded-xl p-12 text-center transition-colors ${
              dragActive
                ? 'border-blue-600 bg-blue-50'
                : 'border-gray-300 hover:border-blue-400'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <div className="flex flex-col items-center">
              <div className="bg-blue-100 p-4 rounded-full mb-4">
                <Upload className="h-12 w-12 text-blue-600" />
              </div>

              {file ? (
                <div className="mb-4">
                  <p className="text-lg font-semibold text-gray-900">
                    {file.name}
                  </p>
                  <p className="text-sm text-gray-600">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              ) : (
                <>
                  <p className="text-lg font-semibold text-gray-900 mb-2">
                    Kéo thả file vào đây
                  </p>
                  <p className="text-gray-600 mb-4">hoặc</p>
                </>
              )}

              <input
                type="file"
                id="file-upload"
                accept=".xlsx,.xls"
                onChange={handleFileChange}
                className="hidden"
              />
              <label htmlFor="file-upload">
                <Button variant="outline" type="button" asChild>
                  <span className="cursor-pointer">
                    Chọn file từ máy tính
                  </span>
                </Button>
              </label>

              {file && (
                <Button
                  variant="ghost"
                  onClick={() => setFile(null)}
                  className="mt-2 text-red-600 hover:text-red-700"
                >
                  Xóa file
                </Button>
              )}
            </div>
          </div>

          <div className="mt-8 text-center">
            <Button
              onClick={handleProcess}
              disabled={!file || processing}
              size="lg"
              className="bg-blue-600 hover:bg-blue-700"
            >
              {processing ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Đang xử lý...
                </>
              ) : (
                <>
                  <FileSpreadsheet className="mr-2 h-5 w-5" />
                  Bắt đầu chuyển đổi
                </>
              )}
            </Button>
          </div>

          <div className="mt-8 bg-blue-50 rounded-lg p-4">
            <h3 className="font-semibold mb-2">Lưu ý:</h3>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• File đầu vào phải có cột "Mã đơn hàng"</li>
              <li>
                • Hệ thống sẽ tự động gộp các dòng có cùng mã đơn hàng
              </li>
              <li>• Thuế VAT 8% sẽ được tính tự động</li>
              <li>• File đầu ra sẽ theo đúng chuẩn MISA meInvoice</li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}
