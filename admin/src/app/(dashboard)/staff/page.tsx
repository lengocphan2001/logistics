'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  UserCog,
  Plus,
  Mail,
  User,
  Shield,
  Warehouse as WarehouseIcon,
  Edit2,
  Trash2,
  Loader2,
  X,
  Lock,
  CheckCircle,
  Eye,
  EyeOff
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { InputGroup, InputGroupAction, InputGroupIcon, InputGroupInput, SearchInput } from '@/components/ui/input-group';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import api from '@/lib/api';

interface Warehouse {
  id: string;
  name: string;
  code: string;
}

interface StaffUser {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  warehouseId?: string | null;
  warehouse?: Warehouse | null;
  createdAt: string;
}

const roleLabels: Record<string, string> = {
  ADMIN: 'Hệ thống Admin',
  SALES: 'Nhân viên kinh doanh',
  WAREHOUSE_MANAGER: 'Quản trị kho',
  DRIVER: 'Nhân viên giao hàng',
};

const roleColors: Record<string, string> = {
  ADMIN: 'bg-red-500/15 text-red-900 border-red-500/25 dark:text-red-300',
  SALES: 'bg-blue-500/15 text-blue-900 border-blue-500/25 dark:text-blue-300',
  WAREHOUSE_MANAGER: 'bg-amber-500/15 text-amber-900 border-amber-500/25 dark:text-amber-300',
  DRIVER: 'bg-green-500/15 text-green-900 border-green-500/25 dark:text-green-300',
};

export default function StaffPage() {
  const [users, setUsers] = useState<StaffUser[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');

  // Modal States
  const [isOpen, setIsOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<StaffUser | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  // Form States
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'SALES',
    warehouseId: '',
    status: 'ACTIVE',
  });
  const [submitting, setSubmitting] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [usersRes, whsRes] = await Promise.all([
        api.get('/users'),
        api.get('/warehouses'),
      ]);
      setUsers(usersRes.data);
      setWarehouses(whsRes.data);
    } catch (err: any) {
      toast.error('Lỗi khi tải dữ liệu: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenCreate = () => {
    setEditingUser(null);
    setFormData({
      name: '',
      email: '',
      password: '',
      role: 'SALES',
      warehouseId: '',
      status: 'ACTIVE',
    });
    setShowPassword(false);
    setIsOpen(true);
  };

  const handleOpenEdit = (user: StaffUser) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      password: '', // Clear password field for security
      role: user.role,
      warehouseId: user.warehouseId || '',
      status: user.status,
    });
    setShowPassword(false);
    setIsOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.email.trim()) {
      toast.error('Vui lòng nhập đầy đủ Tên và Email');
      return;
    }

    if (!editingUser && !formData.password) {
      toast.error('Vui lòng nhập mật khẩu cho tài khoản mới');
      return;
    }

    // Prepare body payload
    const payload: any = {
      name: formData.name,
      email: formData.email,
      role: formData.role,
      status: formData.status,
    };

    if (formData.password) {
      payload.password = formData.password;
    }

    if (formData.role === 'WAREHOUSE_MANAGER') {
      if (!formData.warehouseId) {
        toast.error('Quản trị kho cần thuộc một kho cụ thể');
        return;
      }
      payload.warehouseId = formData.warehouseId;
    } else {
      payload.warehouseId = null;
    }

    try {
      setSubmitting(true);
      if (editingUser) {
        await api.patch(`/users/${editingUser.id}`, payload);
        toast.success('Cập nhật tài khoản nhân viên thành công');
      } else {
        await api.post('/users', payload);
        toast.success('Tạo tài khoản nhân viên thành công');
      }
      setIsOpen(false);
      fetchData();
    } catch (err: any) {
      toast.error('Lỗi khi lưu thông tin: ' + (err.response?.data?.message || err.message));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/users/${id}`);
      toast.success('Xóa tài khoản nhân viên thành công');
      setDeleteConfirmId(null);
      fetchData();
    } catch (err: any) {
      toast.error('Lỗi khi xóa nhân viên: ' + (err.response?.data?.message || err.message));
    }
  };

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <UserCog className="w-8 h-8 text-primary" />
            Quản lý Nhân viên
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Phân quyền hệ thống, cấp tài khoản và điều phối nhân sự của các bộ phận.
          </p>
        </div>
        <Button onClick={handleOpenCreate} className="font-semibold shadow-sm flex items-center gap-2">
          <Plus className="w-4 h-4" /> Cấp tài khoản nhân viên
        </Button>
      </div>

      {/* Filter and control bar */}
      <div className="flex flex-col sm:flex-row gap-4 bg-card/80 p-4 rounded-2xl border border-border/70 shadow-sm backdrop-blur-sm">
        <div className="flex-1 max-w-sm">
          <SearchInput
            placeholder="Tìm kiếm nhân viên (tên, email)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="w-full sm:w-48 shrink-0">
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Lọc theo quyền" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Tất cả chức vụ</SelectItem>
              <SelectItem value="ADMIN">Hệ thống Admin</SelectItem>
              <SelectItem value="SALES">Nhân viên kinh doanh</SelectItem>
              <SelectItem value="WAREHOUSE_MANAGER">Quản trị kho</SelectItem>
              <SelectItem value="DRIVER">Nhân viên giao hàng</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Main Table Content */}
      {loading ? (
        <div className="flex flex-col justify-center items-center h-64 gap-2">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Đang tải dữ liệu nhân viên...</p>
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="flex flex-col justify-center items-center h-64 border border-dashed rounded-xl bg-card gap-3">
          <UserCog className="w-12 h-12 text-muted-foreground" />
          <p className="text-muted-foreground text-sm">Không tìm thấy tài khoản nhân viên nào.</p>
        </div>
      ) : (
        <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-muted/40 border-b border-border text-foreground/65 text-xs font-semibold uppercase tracking-wider">
                  <th className="px-6 py-4">Nhân viên</th>
                  <th className="px-6 py-4">Chức vụ</th>
                  <th className="px-6 py-4">Địa điểm làm việc (Kho)</th>
                  <th className="px-6 py-4">Trạng thái</th>
                  <th className="px-6 py-4 text-right">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-sm">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-muted/10 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm shrink-0">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-foreground">{user.name}</p>
                          <p className="text-xs text-muted-foreground">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-0.5 rounded-full border ${roleColors[user.role] || ''}`}>
                        <Shield className="w-3 h-3" />
                        {roleLabels[user.role] || user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {user.role === 'WAREHOUSE_MANAGER' ? (
                        user.warehouse ? (
                          <div className="flex items-center gap-1.5 text-foreground font-medium">
                            <WarehouseIcon className="w-4 h-4 text-primary" />
                            <span>{user.warehouse.name}</span>
                            <span className="text-xs text-muted-foreground font-normal">({user.warehouse.code})</span>
                          </div>
                        ) : (
                          <span className="text-xs text-destructive flex items-center gap-1">
                            <WarehouseIcon className="w-4 h-4" /> Chưa phân kho
                          </span>
                        )
                      ) : (
                        <span className="text-muted-foreground text-xs">Văn phòng chính (Hệ thống)</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 text-xs font-semibold ${user.status === 'ACTIVE' ? 'text-emerald-700 dark:text-emerald-400' : 'text-muted-foreground'}`}>
                        <CheckCircle className="w-3.5 h-3.5" />
                        {user.status === 'ACTIVE' ? 'Hoạt động' : 'Tạm khóa'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenEdit(user)}
                          className="h-8 text-xs font-semibold flex items-center gap-1"
                        >
                          <Edit2 className="w-3 h-3" /> Sửa
                        </Button>

                        {deleteConfirmId === user.id ? (
                          <div className="flex items-center gap-1.5 animate-in fade-in slide-in-from-right-3 duration-250">
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDelete(user.id)}
                              className="h-8 text-xs font-semibold"
                            >
                              Có
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setDeleteConfirmId(null)}
                              className="h-8 text-xs font-semibold"
                            >
                              Hủy
                            </Button>
                          </div>
                        ) : (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDeleteConfirmId(user.id)}
                            className="h-8 text-xs font-semibold text-destructive hover:bg-destructive/10 hover:text-destructive flex items-center gap-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" /> Xóa
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Add / Edit Staff */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 16 }}
              className="bg-card w-full max-w-md rounded-2xl border border-border shadow-2xl overflow-hidden"
            >
              {/* Header */}
              <div className="flex justify-between items-center px-6 py-4 border-b border-border">
                <h2 className="text-xl font-bold flex items-center gap-2 text-foreground">
                  <UserCog className="w-5 h-5 text-primary" />
                  {editingUser ? 'Sửa thông tin nhân viên' : 'Cấp tài khoản nhân viên'}
                </h2>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded-lg hover:bg-accent"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="staff-name">Họ và tên</Label>
                  <InputGroup>
                    <InputGroupIcon><User className="size-4" /></InputGroupIcon>
                    <InputGroupInput
                      id="staff-name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Nguyễn Văn A"
                      required
                    />
                  </InputGroup>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="staff-email">Email đăng nhập</Label>
                  <InputGroup>
                    <InputGroupIcon><Mail className="size-4" /></InputGroupIcon>
                    <InputGroupInput
                      id="staff-email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="email@logistics.vn"
                      required
                    />
                  </InputGroup>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="staff-password">
                    {editingUser ? 'Mật khẩu mới (Để trống nếu giữ nguyên)' : 'Mật khẩu khởi tạo'}
                  </Label>
                  <InputGroup>
                    <InputGroupIcon><Lock className="size-4" /></InputGroupIcon>
                    <InputGroupInput
                      id="staff-password"
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      placeholder="••••••••"
                      className="pr-11"
                      required={!editingUser}
                    />
                    <InputGroupAction onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </InputGroupAction>
                  </InputGroup>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="staff-role">Chức vụ / Vai trò</Label>
                  <Select
                    value={formData.role}
                    onValueChange={(val) => setFormData({ ...formData, role: val })}
                  >
                    <SelectTrigger id="staff-role">
                      <SelectValue placeholder="Chọn chức vụ" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ADMIN">Hệ thống Admin</SelectItem>
                      <SelectItem value="SALES">Nhân viên kinh doanh</SelectItem>
                      <SelectItem value="WAREHOUSE_MANAGER">Quản trị kho</SelectItem>
                      <SelectItem value="DRIVER">Nhân viên giao hàng (Tài xế)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Conditional Warehouse Select Field */}
                {formData.role === 'WAREHOUSE_MANAGER' && (
                  <div className="space-y-1.5 animate-in fade-in slide-in-from-top-2 duration-200">
                    <Label htmlFor="staff-warehouse">Kho hàng phụ trách</Label>
                    <Select
                      value={formData.warehouseId}
                      onValueChange={(val) => setFormData({ ...formData, warehouseId: val })}
                    >
                      <SelectTrigger id="staff-warehouse">
                        <SelectValue placeholder="Chọn kho để phân công" />
                      </SelectTrigger>
                      <SelectContent>
                        {warehouses.map((wh) => (
                          <SelectItem key={wh.id} value={wh.id}>
                            {wh.name} ({wh.code})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {editingUser && (
                  <div className="space-y-1.5">
                    <Label htmlFor="staff-status">Trạng thái tài khoản</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(val) => setFormData({ ...formData, status: val })}
                    >
                      <SelectTrigger id="staff-status">
                        <SelectValue placeholder="Trạng thái" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ACTIVE">Hoạt động</SelectItem>
                        <SelectItem value="INACTIVE">Khóa tài khoản</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Footer buttons */}
                <div className="flex justify-end gap-3 pt-4 border-t border-border mt-6">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsOpen(false)}
                    disabled={submitting}
                  >
                    Hủy
                  </Button>
                  <Button type="submit" disabled={submitting} className="font-semibold">
                    {submitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Đang lưu...
                      </>
                    ) : (
                      'Lưu tài khoản'
                    )}
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
