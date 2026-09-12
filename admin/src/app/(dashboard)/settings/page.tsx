'use client';

import { useEffect, useState } from 'react';
import { Loader2, Save } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LoadingState } from '@/components/ui/loading-state';
import { PageHeader } from '@/components/layout/PageHeader';
import { useAuthStore } from '@/stores/auth.store';
import { settingsService } from '@/services/settings.service';
import { formatCny, formatVnd, cnyToVnd } from '@/lib/currency';
import { apiErrorMessage } from '@/lib/api-error';
import { icon } from '@/lib/icon';

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
    } catch (err) {
      toast.error(apiErrorMessage(err, 'Không thể cập nhật tỉ giá'));
    } finally {
      setSubmitting(false);
    }
  };

  const previewRate = Number(vndPerCny) || savedRate || 3500;

  if (loading) {
    return <LoadingState label="Đang tải cấu hình" />;
  }

  return (
    <div className="max-w-2xl space-y-5">
      <PageHeader
        title="Cài đặt"
        description="Tỉ giá quy đổi và các thông số chung của hệ thống."
      />

      <section className="panel overflow-hidden">
        <h2 className="border-b border-[var(--rule)] px-5 py-3.5 font-heading text-base font-semibold text-[var(--ink)]">
          Tỉ giá quy đổi
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5 px-5 py-4">
          <p data-prose className="text-sm">
            Số dư ví khách hàng được quản lý bằng nhân dân tệ. Tỉ giá này dùng để quy
            đổi sang tiền Việt khi hiển thị tham khảo.
          </p>

          <div className="space-y-1.5">
            <Label htmlFor="vndPerCny">Một nhân dân tệ bằng bao nhiêu đồng</Label>
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
              <p className="text-xs text-[var(--graphite)]">
                Chỉ quản trị hệ thống mới thay đổi được tỉ giá.
              </p>
            )}
          </div>

          <dl className="border-t border-[var(--rule)] pt-4 text-sm">
            <div className="flex items-baseline justify-between gap-3">
              <dt className="text-[var(--graphite)]">Ví dụ quy đổi</dt>
              <dd data-numeric className="font-semibold text-[var(--ink)]">
                {formatCny(100)} ≈ {formatVnd(cnyToVnd(100, previewRate))}
              </dd>
            </div>
            <div className="mt-1.5 flex items-baseline justify-between gap-3">
              <dt className="text-[var(--graphite)]">Tỉ giá đang áp dụng</dt>
              <dd data-numeric className="font-semibold text-[var(--ink)]">
                {formatVnd(previewRate)}
              </dd>
            </div>
          </dl>

          {isAdmin && (
            <div className="flex justify-end">
              <Button type="submit" disabled={submitting}>
                {submitting ? (
                  <Loader2 {...icon('inline')} aria-hidden className="animate-spin" />
                ) : (
                  <Save {...icon('inline')} aria-hidden />
                )}
                Lưu tỉ giá
              </Button>
            </div>
          )}
        </form>
      </section>
    </div>
  );
}
