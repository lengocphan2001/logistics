'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { InputGroup, InputGroupAction, InputGroupInput } from '@/components/ui/input-group';
import { Label } from '@/components/ui/label';
import { loginSchema, type LoginInput } from '@/lib/validations';
import { useAuthStore } from '@/stores/auth.store';
import api from '@/lib/api';
import { apiErrorMessage } from '@/lib/api-error';
import { icon } from '@/lib/icon';

const capabilities = [
  'Quản lý đơn hàng theo thời gian thực',
  'Theo dõi hành trình từ kho Trung Quốc về Việt Nam',
  'Đối soát phí, ví khách hàng và công nợ',
];

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const login = useAuthStore((s) => s.login);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (data: LoginInput) => {
    try {
      const response = await api.post('/auth/login', data);
      const { user, token } = response.data;

      login(user, token);
      toast.success('Đăng nhập thành công');
      router.push('/dashboard');
    } catch (err) {
      toast.error(apiErrorMessage(err, 'Email hoặc mật khẩu không đúng'));
    }
  };

  return (
    <div className="flex min-h-screen bg-[var(--dock-grey)]">
      {/* Two panels split by a straight edge: navy states who this is for,
          white holds the form. No glow, no grid, no entry animation. */}
      <div
        data-chrome
        className="relative hidden bg-[var(--manifest-navy)] lg:flex lg:w-[42%]"
      >
        <div className="relative z-10 flex w-full flex-col justify-center px-14">
          <span className="font-heading text-[1.0625rem] font-bold tracking-[-0.02em] text-white">
            Logistics Admin
          </span>

          <h2 className="mt-14 max-w-md text-4xl font-bold leading-tight text-white">
            Quản trị toàn bộ chuỗi vận chuyển
          </h2>
          <p className="mt-4 max-w-sm text-base leading-relaxed text-white/80">
            Theo dõi, điều phối và đối soát đơn hàng giữa Trung Quốc và Việt Nam
            trên một hệ thống.
          </p>

          <ul className="mt-10 space-y-3">
            {capabilities.map((item) => (
              <li key={item} className="flex items-start gap-3 text-sm text-white/80">
                <span aria-hidden className="mt-2 size-1 shrink-0 bg-white/60" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="flex flex-1 items-center justify-center p-6 sm:p-8">
        <div className="w-full max-w-sm">
          <p className="mb-8 font-heading text-base font-bold text-[var(--ink)] lg:hidden">
            Logistics Admin
          </p>

          <div className="mb-7 border-b border-[var(--rule)] pb-5">
            <h1 className="text-2xl font-bold text-[var(--ink)]">Đăng nhập</h1>
            <p className="mt-1 text-sm text-[var(--graphite)]">
              Nhập thông tin tài khoản quản trị của bạn.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" id="login-form">
            <div className="space-y-1.5">
              <Label htmlFor="login-email">Email</Label>
              <Input
                id="login-email"
                type="email"
                autoComplete="email"
                aria-invalid={!!errors.email}
                {...register('email')}
              />
              {errors.email && (
                <p className="text-xs text-[var(--seal-red)]">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="login-password">Mật khẩu</Label>
              <InputGroup>
                <InputGroupInput
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  aria-invalid={!!errors.password}
                  className="pl-3 pr-11"
                  {...register('password')}
                />
                <InputGroupAction
                  onClick={() => setShowPassword(!showPassword)}
                  id="login-toggle-password"
                  aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                >
                  {showPassword ? (
                    <EyeOff {...icon('inline')} aria-hidden />
                  ) : (
                    <Eye {...icon('inline')} aria-hidden />
                  )}
                </InputGroupAction>
              </InputGroup>
              {errors.password && (
                <p className="text-xs text-[var(--seal-red)]">{errors.password.message}</p>
              )}
            </div>

            <Button
              type="submit"
              size="lg"
              className="w-full"
              disabled={isSubmitting}
              id="login-submit"
            >
              {isSubmitting ? (
                <>
                  <Loader2 {...icon('inline')} aria-hidden className="animate-spin" />
                  Đang đăng nhập
                </>
              ) : (
                'Đăng nhập'
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
