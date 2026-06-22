'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Warehouse as WarehouseIcon, 
  Plus, 
  MapPin, 
  Barcode, 
  Users, 
  Edit2, 
  Trash2, 
  Loader2, 
  X,
  AlertTriangle 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SearchInput } from '@/components/ui/input-group';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import api from '@/lib/api';

interface Warehouse {
  id: string;
  name: string;
  code: string;
  address: string;
  users?: { id: string; name: string; email: string }[];
  _count?: { users: number };
}

export default function WarehousesPage() {
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal states
  const [isOpen, setIsOpen] = useState(false);
  const [editingWarehouse, setEditingWarehouse] = useState<Warehouse | null>(null);
  const [formData, setFormData] = useState({ name: '', code: '', address: '' });
  const [submitting, setSubmitting] = useState(false);

  // Delete states
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const fetchWarehouses = async () => {
    try {
      setLoading(true);
      const res = await api.get('/warehouses');
      setWarehouses(res.data);
    } catch (err: any) {
      toast.error('Không thể tải danh sách kho: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWarehouses();
  }, []);

  const handleOpenCreate = () => {
    setEditingWarehouse(null);
    setFormData({ name: '', code: '', address: '' });
    setIsOpen(true);
  };

  const handleOpenEdit = (wh: Warehouse) => {
    setEditingWarehouse(wh);
    setFormData({ name: wh.name, code: wh.code, address: wh.address });
    setIsOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.code.trim() || !formData.address.trim()) {
      toast.error('Vui lòng điền đầy đủ thông tin');
      return;
    }

    try {
      setSubmitting(true);
      if (editingWarehouse) {
        // Update
        await api.patch(`/warehouses/${editingWarehouse.id}`, formData);
        toast.success('Cập nhật kho thành công');
      } else {
        // Create
        await api.post('/warehouses', formData);
        toast.success('Tạo kho mới thành công');
      }
      setIsOpen(false);
      fetchWarehouses();
    } catch (err: any) {
      toast.error('Lỗi: ' + (err.response?.data?.message || err.message));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/warehouses/${id}`);
      toast.success('Xóa kho thành công');
      setDeleteConfirmId(null);
      fetchWarehouses();
    } catch (err: any) {
      toast.error('Lỗi khi xóa kho: ' + (err.response?.data?.message || err.message));
    }
  };

  const filteredWarehouses = warehouses.filter(
    (wh) =>
      wh.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      wh.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      wh.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <WarehouseIcon className="w-8 h-8 text-primary" />
            Quản lý Kho hàng
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Xem, tạo mới và quản lý các địa điểm kho của hệ thống.
          </p>
        </div>
        <Button onClick={handleOpenCreate} className="font-semibold shadow-sm flex items-center gap-2">
          <Plus className="w-4 h-4" /> Thêm kho mới
        </Button>
      </div>

      {/* Control bar */}
      <div className="flex items-center gap-4 bg-card/80 p-4 rounded-2xl border border-border/70 shadow-sm backdrop-blur-sm">
        <div className="flex-1 max-w-sm">
          <SearchInput
            placeholder="Tìm kiếm kho (tên, mã, địa chỉ)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Main content grid */}
      {loading ? (
        <div className="flex flex-col justify-center items-center h-64 gap-2">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Đang tải dữ liệu kho...</p>
        </div>
      ) : filteredWarehouses.length === 0 ? (
        <div className="flex flex-col justify-center items-center h-64 border border-dashed rounded-xl bg-card gap-3">
          <WarehouseIcon className="w-12 h-12 text-muted-foreground" />
          <p className="text-muted-foreground text-sm">Không tìm thấy thông tin kho nào.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredWarehouses.map((wh) => (
            <motion.div
              layout
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              key={wh.id}
              className="bg-card rounded-xl border border-border shadow-sm overflow-hidden flex flex-col justify-between hover:shadow-md transition-all group"
            >
              {/* Card body */}
              <div className="p-5 space-y-4">
                <div className="flex justify-between items-start gap-2">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <WarehouseIcon className="w-5 h-5 text-primary" />
                  </div>
                  <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-secondary text-secondary-foreground border">
                    <Barcode className="w-3.5 h-3.5" />
                    {wh.code}
                  </span>
                </div>

                <div>
                  <h3 className="font-semibold text-lg text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                    {wh.name}
                  </h3>
                  <div className="flex items-start gap-2 mt-2.5 text-sm text-muted-foreground">
                    <MapPin className="w-4 h-4 shrink-0 mt-0.5 text-muted-foreground" />
                    <span className="line-clamp-2">{wh.address}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-border/60">
                  <Users className="w-4 h-4 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground font-medium">
                    {wh._count?.users || wh.users?.length || 0} nhân viên quản trị kho
                  </span>
                </div>
              </div>

              {/* Actions footer */}
              <div className="px-5 py-3.5 bg-muted/30 border-t border-border flex justify-end gap-2.5">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleOpenEdit(wh)}
                  className="h-8 text-xs font-semibold flex items-center gap-1"
                >
                  <Edit2 className="w-3.5 h-3.5" /> Sửa
                </Button>

                {deleteConfirmId === wh.id ? (
                  <div className="flex items-center gap-2 animate-in fade-in slide-in-from-right-3 duration-250">
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(wh.id)}
                      className="h-8 text-xs font-semibold flex items-center gap-1"
                    >
                      Xác nhận
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
                    onClick={() => setDeleteConfirmId(wh.id)}
                    className="h-8 text-xs font-semibold text-destructive hover:bg-destructive/10 hover:text-destructive flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Xóa
                  </Button>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Modal Add / Edit */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 16 }}
              className="bg-card w-full max-w-md rounded-2xl border border-border shadow-2xl overflow-hidden"
            >
              {/* Modal header */}
              <div className="flex justify-between items-center px-6 py-4 border-b border-border">
                <h2 className="text-xl font-bold flex items-center gap-2 text-foreground">
                  <WarehouseIcon className="w-5 h-5 text-primary" />
                  {editingWarehouse ? 'Cập nhật Kho hàng' : 'Thêm Kho hàng mới'}
                </h2>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded-lg hover:bg-accent"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal form */}
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="wh-name">Tên kho hàng</Label>
                  <Input
                    id="wh-name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ví dụ: Kho Hà Nội Cầu Giấy"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="wh-code">Mã kho hàng (Unique)</Label>
                  <Input
                    id="wh-code"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    placeholder="Ví dụ: WH-HN-03"
                    disabled={!!editingWarehouse} // Don't let code change if editing for stability
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="wh-address">Địa chỉ chi tiết</Label>
                  <Input
                    id="wh-address"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="Số 123 Cầu Giấy, Hà Nội"
                    required
                  />
                </div>

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
                      'Lưu thông tin'
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
