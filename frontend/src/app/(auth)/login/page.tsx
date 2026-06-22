'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { InputGroup, InputGroupAction, InputGroupInput } from '@/components/ui/input-group';
import { Label } from '@/components/ui/label';
import { AuthShell } from '@/components/auth/auth-shell';
import { loginSchema, type LoginInput } from '@/lib/validations';
import { useAuthStore } from '@/stores/auth.store';
import api from '@/lib/api';

function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirect');
  const login = useAuthStore((s) => s.login);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (data: LoginInput) => {
    try {
      const response = await api.post('/auth/customer/login', data);
      const { user, token } = response.data;

      login(user, token);
      toast.success('Đăng nhập thành công!');
      router.push(redirectTo && redirectTo.startsWith('/') ? redirectTo : '/dashboard');
    } catch (err: any) {
      const message = err.response?.data?.message || 'Email hoặc mật khẩu không đúng';
      toast.error(message);
    }
  };

  return (
    <AuthShell
      heroTitle={
        <>
          Vận chuyển quốc tế
          <span className="mt-1 block text-[var(--auth-hero-muted)]">mượt mà & minh bạch.</span>
        </>
      }
      heroSubtitle="Theo dõi đơn hàng, quản lý ví ¥ và nhận hàng tại Việt Nam — tất cả trên một nền tảng."
      formTitle="Đăng nhập"
      formSubtitle="Đăng nhập tài khoản khách hàng của bạn"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="space-y-1.5">
          <Label htmlFor="login-email">Email</Label>
          <Input
            id="login-email"
            type="email"
            placeholder="email@example.com"
            autoComplete="email"
            {...register('email')}
            className={errors.email ? 'border-destructive focus-visible:ring-destructive/30' : ''}
          />
          {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="login-password">Mật khẩu</Label>
          <InputGroup>
            <InputGroupInput
              id="login-password"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              autoComplete="current-password"
              className={`pr-11 ${errors.password ? 'border-destructive focus-visible:ring-destructive/30' : ''}`}
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

        <Button
          type="submit"
          size="lg"
          className="w-full bg-[var(--auth-accent)] text-white hover:bg-[oklch(0.44_0.095_72)]"
          disabled={isSubmitting}
        >
          {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Đăng nhập'}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-[var(--auth-body-muted)]">
        Chưa có tài khoản?{' '}
        <Link href="/register" className="font-semibold text-[var(--auth-accent)] hover:underline">
          Đăng ký ngay
        </Link>
      </p>
    </AuthShell>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="auth-page flex min-h-screen items-center justify-center bg-[var(--auth-surface)]">
          <Loader2 className="h-8 w-8 animate-spin text-[var(--auth-accent)]" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
