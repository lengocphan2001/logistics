'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Loader2, Settings, Coins, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { useAuthStore } from '@/stores/auth.store';
import { settingsService } from '@/services/settings.service';
import { formatCny, formatVnd, cnyToVnd } from '@/lib/currency';

export default function SettingsPage() {
  const user = useAuthStore((s) => s.user);
  const isAdmin = user?.role === 'ADMIN';

  const [vndPerCny, setVndPerCny] = useState('');
  const [savedRate, setSavedRate] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    settingsService
      .getExchangeRate()
      .then((res) => {
        setVndPerCny(String(res.data.vndPerCny));
        setSavedRate(res.data.vndPerCny);
      })
      .catch(() => toast.error('Không thể tải cấu hình tỉ giá'))
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const rate = Number(vndPerCny);
    if (!rate || rate <= 0) {
      toast.error('Tỉ giá phải là số dương');
      return;
    }

    try {
      setSubmitting(true);
      const res = await settingsService.updateExchangeRate(rate);
      setSavedRate(res.data.vndPerCny);
      toast.success('Đã cập nhật tỉ giá thành công');
    } catch (err: any) {
      toast.error('Lỗi: ' + (err.response?.data?.message || err.message));
    } finally {
      setSubmitting(false);
    }
  };

  const previewRate = Number(vndPerCny) || savedRate || 3500;

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-2xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <Settings className="w-8 h-8 text-primary" />
          Cài đặt hệ thống
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Cấu hình tỉ giá và các thông số chung của hệ thống.
        </p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden"
      >
        <div className="px-6 py-4 border-b border-border flex items-center gap-2">
          <Coins className="w-5 h-5 text-primary" />
          <h2 className="font-semibold text-foreground">Tỉ giá quy đổi (VND / ¥)</h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <p className="text-sm text-muted-foreground leading-relaxed">
            Số dư ví khách hàng được quản lý bằng <strong className="text-foreground">¥ (CNY)</strong>.
            Tỉ giá này dùng để quy đổi sang VND khi hiển thị tham khảo trên admin.
          </p>

          <div className="space-y-1.5">
            <Label htmlFor="vndPerCny">1 ¥ (CNY) = ? VND</Label>
            <Input
              id="vndPerCny"
              type="number"
              min="1"
              step="1"
              value={vndPerCny}
              onChange={(e) => setVndPerCny(e.target.value)}
              placeholder="3500"
              disabled={!isAdmin}
            />
            {!isAdmin && (
              <p className="text-xs text-muted-foreground">Chỉ Admin mới có quyền thay đổi tỉ giá.</p>
            )}
          </div>

          <div className="rounded-xl bg-muted/40 border border-border p-4 space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Ví dụ quy đổi</p>
            <p className="text-sm text-foreground">
              {formatCny(100)} ≈ {formatVnd(cnyToVnd(100, previewRate))}
            </p>
            <p className="text-xs text-muted-foreground">
              Tỉ giá: 1 ¥ = {formatVnd(previewRate)}
            </p>
          </div>

          {isAdmin && (
            <div className="flex justify-end pt-2">
              <Button type="submit" disabled={submitting} className="gap-2">
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Lưu tỉ giá
              </Button>
            </div>
          )}
        </form>
      </motion.div>
    </div>
  );
}
