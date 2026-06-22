'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Loader2, Zap } from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { InputGroup, InputGroupAction, InputGroupInput } from '@/components/ui/input-group';
import { Label } from '@/components/ui/label';
import { loginSchema, type LoginInput } from '@/lib/validations';
import { useAuthStore } from '@/stores/auth.store';
import api from '@/lib/api';

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
      toast.success('Đăng nhập thành công!');
      router.push('/dashboard');
    } catch (err: any) {
      const message = err.response?.data?.message || 'Email hoặc mật khẩu không đúng';
      toast.error(message);
    }
  };

  return (
    <div className="min-h-screen flex bg-background">
      {/* Left panel — branding (luôn tối, không phụ thuộc theme) */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-[oklch(0.22_0.045_264)] text-white">
        {/* Background grid */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              'linear-gradient(oklch(1 0 0 / 8%) 1px, transparent 1px), linear-gradient(90deg, oklch(1 0 0 / 8%) 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />
        {/* Glow orb */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/30 rounded-full blur-3xl" />

        <div className="relative z-10 flex flex-col justify-center px-16 w-full">
          <div className="flex items-center gap-3 mb-16">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary">
              <Zap className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-xl text-white">Logistics Admin</span>
          </div>

          <h2 className="text-4xl font-bold text-white leading-tight mb-4">
            Quản lý vận chuyển<br />
            <span className="text-primary-foreground/90">thông minh hơn.</span>
          </h2>
          <p className="text-white/75 text-lg leading-relaxed max-w-sm">
            Nền tảng quản trị logistics hiện đại — theo dõi, điều phối và tối ưu toàn bộ chuỗi vận chuyển.
          </p>

          {/* Feature list */}
          <ul className="mt-10 space-y-3">
            {['Quản lý đơn hàng realtime', 'Theo dõi GPS tài xế', 'Báo cáo & phân tích thông minh'].map((f) => (
              <li key={f} className="flex items-center gap-3 text-white/80 text-sm">
                <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                {f}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Right panel — login form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className="w-full max-w-sm"
        >
          {/* Mobile logo */}
          <div className="flex items-center gap-2.5 mb-8 lg:hidden">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary">
              <Zap className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-bold text-foreground">Logistics Admin</span>
          </div>

          <div className="mb-8">
            <h1 className="text-2xl font-bold text-foreground mb-1">Đăng nhập</h1>
            <p className="text-muted-foreground text-sm">Nhập thông tin tài khoản admin của bạn</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" id="login-form">
            <div className="space-y-1.5">
              <Label htmlFor="login-email">Email</Label>
              <Input
                id="login-email"
                type="email"
                placeholder="admin@logistics.vn"
                autoComplete="email"
                {...register('email')}
                className={errors.email ? 'border-destructive focus-visible:ring-destructive/30' : ''}
              />
              {errors.email && (
                <p className="text-xs text-destructive">{errors.email.message}</p>
              )}
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
                  id="login-toggle-password"
                  aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </InputGroupAction>
              </InputGroup>
              {errors.password && (
                <p className="text-xs text-destructive">{errors.password.message}</p>
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
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Đang đăng nhập...
                </>
              ) : (
                'Đăng nhập'
              )}
            </Button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
