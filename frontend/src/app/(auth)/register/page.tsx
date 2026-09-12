'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { InputGroup, InputGroupAction, InputGroupInput } from '@/components/ui/input-group';
import { Label } from '@/components/ui/label';
import { AuthShell } from '@/components/auth/auth-shell';
import { apiErrorMessages } from '@/lib/api-error';
import { registerSchema, type RegisterInput } from '@/lib/validations';
import { useAuthStore } from '@/stores/auth.store';
import api from '@/lib/api';

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const login = useAuthStore((s) => s.login);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({ resolver: zodResolver(registerSchema) });

  const onSubmit = async (data: RegisterInput) => {
    try {
      const { confirmPassword: _confirmPassword, ...payload } = data;
      const response = await api.post('/auth/customer/register', payload);
      const { user, token } = response.data;

      login(user, token);
      toast.success('Đăng ký thành công!');
      router.push('/dashboard');
    } catch (err) {
      toast.error(
        apiErrorMessages(err)?.join(', ') ?? 'Không thể đăng ký tài khoản',
      );
    }
  };

  return (
    <AuthShell
      heroTitle="Tạo tài khoản khách hàng"
      heroSubtitle="Đăng ký một lần để theo dõi đơn hàng, nạp ví ¥ và nhận thông báo vận chuyển."
      formTitle="Đăng ký"
      formSubtitle="Tạo tài khoản để sử dụng hệ thống"
      className="lg:max-w-xl"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="username">Username</Label>
            <Input id="username" placeholder="khachhang01" {...register('username')} />
            {errors.username && <p className="text-xs text-destructive">{errors.username.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="fullName">Họ và tên</Label>
            <Input id="fullName" placeholder="Nguyễn Văn A" {...register('fullName')} />
            {errors.fullName && <p className="text-xs text-destructive">{errors.fullName.message}</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="phone">Số điện thoại</Label>
            <Input id="phone" placeholder="0901234567" {...register('phone')} />
            {errors.phone && <p className="text-xs text-destructive">{errors.phone.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="email@example.com" {...register('email')} />
            {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="password">Mật khẩu</Label>
            <InputGroup>
              <InputGroupInput
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                className={`pr-11 ${errors.password ? 'border-destructive ' : ''}`}
                {...register('password')}
              />
              <InputGroupAction
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </InputGroupAction>
            </InputGroup>
            {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="confirmPassword">Xác nhận mật khẩu</Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="••••••••"
              className={errors.confirmPassword ? 'border-destructive ' : ''}
              {...register('confirmPassword')}
            />
            {errors.confirmPassword && (
              <p className="text-xs text-destructive">{errors.confirmPassword.message}</p>
            )}
          </div>
        </div>

        <Button
          type="submit"
          size="lg"
          className="w-full "
          disabled={isSubmitting}
        >
          {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Đăng ký'}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-[var(--graphite)]">
        Đã có tài khoản?{' '}
        <Link href="/login" className="font-semibold text-[var(--manifest-navy)] hover:underline">
          Đăng nhập
        </Link>
      </p>
    </AuthShell>
  );
}
