'use client';

import { useEffect, useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  FileSpreadsheet,
  LogOut,
  Calendar,
  Loader2,
  CheckCircle2,
  XCircle,
  AlertCircle,
} from 'lucide-react';
import { toast } from 'sonner';

interface User {
  id: string;
  email: string;
  expiryDate: string | null;
  isAdmin: boolean;
  createdAt: string;
}

export default function AdminPage() {
  const { data: session, status } = useSession() || {};
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [extendingUserId, setExtendingUserId] = useState<string | null>(null);
  const [daysToExtend, setDaysToExtend] = useState<{ [key: string]: number }>(
    {}
  );

  useEffect(() => {
    if (status === 'loading') return;

    if (!session?.user) {
      router.replace('/login');
      return;
    }

    // Check if user is admin
    if (!(session.user as any).isAdmin) {
      router.replace('/dashboard');
      return;
    }

    fetchUsers();
  }, [session, status, router]);

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/admin/users');
      const data = await response.json();
      if (response.ok) {
        setUsers(data.users || []);
      } else {
        toast.error('Failed to fetch users');
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Error loading users');
    } finally {
      setLoading(false);
    }
  };

  const handleExtend = async (userId: string) => {
    const days = daysToExtend[userId] || 30;

    if (days <= 0) {
      toast.error('Số ngày phải lớn hơn 0');
      return;
    }

    setExtendingUserId(userId);

    try {
      const response = await fetch('/api/admin/extend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, days }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(`Gia hạn thành công ${days} ngày`);
        fetchUsers();
      } else {
        toast.error(data.error || 'Gia hạn thất bại');
      }
    } catch (error) {
      console.error('Error extending user:', error);
      toast.error('Đã xảy ra lỗi');
    } finally {
      setExtendingUserId(null);
    }
  };

  const getStatus = (expiryDate: string | null) => {
    if (!expiryDate) {
      return { label: 'Chưa kích hoạt', color: 'gray', icon: AlertCircle };
    }
    const expiry = new Date(expiryDate);
    const now = new Date();
    if (expiry < now) {
      return { label: 'Hết hạn', color: 'red', icon: XCircle };
    }
    return { label: 'Còn hạn', color: 'green', icon: CheckCircle2 };
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  if (loading || status === 'loading') {
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
                HDDT- Admin
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                onClick={() => router.push('/dashboard')}
              >
                Dashboard
              </Button>
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
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">Quản lý người dùng</h1>
            <Button onClick={fetchUsers} variant="outline">
              <Calendar className="h-4 w-4 mr-2" />
              Làm mới
            </Button>
          </div>

          {/* Users Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">Email</th>
                  <th className="text-left py-3 px-4">Ngày đăng ký</th>
                  <th className="text-left py-3 px-4">Ngày hết hạn</th>
                  <th className="text-left py-3 px-4">Trạng thái</th>
                  <th className="text-left py-3 px-4">Role</th>
                  <th className="text-left py-3 px-4">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => {
                  const status = getStatus(user.expiryDate);
                  const StatusIcon = status.icon;

                  return (
                    <tr key={user.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium">{user.email}</td>
                      <td className="py-3 px-4 text-gray-600">
                        {formatDate(user.createdAt)}
                      </td>
                      <td className="py-3 px-4 text-gray-600">
                        {formatDate(user.expiryDate)}
                      </td>
                      <td className="py-3 px-4">
                        <div
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            status.color === 'green'
                              ? 'bg-green-100 text-green-800'
                              : status.color === 'red'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {status.label}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        {user.isAdmin ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            Admin
                          </span>
                        ) : (
                          <span className="text-gray-500 text-xs">User</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-2">
                          <Input
                            type="number"
                            placeholder="Ngày"
                            value={daysToExtend[user.id] || 30}
                            onChange={(e) =>
                              setDaysToExtend({
                                ...daysToExtend,
                                [user.id]: parseInt(e.target.value) || 0,
                              })
                            }
                            className="w-20"
                          />
                          <Button
                            size="sm"
                            onClick={() => handleExtend(user.id)}
                            disabled={extendingUserId === user.id}
                            className="bg-blue-600 hover:bg-blue-700"
                          >
                            {extendingUserId === user.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              'Gia hạn'
                            )}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {users.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                Chưa có người dùng nào
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
