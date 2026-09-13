'use client';

import { useRouter } from 'next/navigation';
import { ChevronDown, Menu, Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { NotificationBell } from '@/components/layout/NotificationBell';
import { useUIStore } from '@/stores/ui.store';
import { useAuthStore } from '@/stores/auth.store';
import { icon } from '@/lib/icon';
import { roleLabels } from '@/components/staff/staff.types';

interface HeaderProps {
  title?: string;
}

export function Header({ title }: HeaderProps) {
  const { toggleSidebar, theme, setTheme } = useUIStore();
  const { user, logout } = useAuthStore();
  const router = useRouter();

  const toggleTheme = () => {
    // Determine the *actual* rendered theme to toggle from
    const isDark =
      theme === 'dark' ||
      (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    setTheme(isDark ? 'light' : 'dark');
  };

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'A';

  return (
    <header className="sticky top-0 z-20 flex h-14 shrink-0 items-center gap-3 border-b border-[var(--rule)] bg-[var(--sheet-white)] px-4 sm:px-6">
      <Button
        variant="ghost"
        size="icon"
        className="shrink-0 lg:hidden"
        onClick={toggleSidebar}
        id="header-menu-toggle"
        aria-label="Mở thanh điều hướng"
      >
        <Menu {...icon('control')} aria-hidden />
      </Button>

      {title && (
        <p className="hidden truncate text-sm font-semibold text-[var(--ink)] sm:block">
          {title}
        </p>
      )}

      <div className="ml-auto flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          id="header-theme-toggle"
          aria-label="Đổi giao diện sáng tối"
        >
          {theme === 'dark' ? (
            <Sun {...icon('control')} aria-hidden />
          ) : (
            <Moon {...icon('control')} aria-hidden />
          )}
        </Button>

        <NotificationBell />

        <DropdownMenu>
          <DropdownMenuTrigger
            className="ml-1 flex cursor-pointer items-center gap-2.5 rounded-[var(--radius-control)] px-1.5 py-1 hover:bg-[var(--wash)]"
            id="header-user-menu"
          >
            <Avatar className="size-8 rounded-[var(--radius-control)]">
              <AvatarImage src={user?.avatar} />
              <AvatarFallback className="rounded-[var(--radius-control)] bg-[var(--navy-wash)] text-[11px] font-bold text-[var(--manifest-navy)]">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="hidden text-left sm:block">
              <p className="text-sm font-medium leading-tight text-[var(--ink)]">
                {user?.name ?? 'Admin'}
              </p>
              <p className="text-[11px] leading-tight text-[var(--graphite)]">
                {roleLabels[(user?.role ?? '').toUpperCase()] ?? 'Quản trị hệ thống'}
              </p>
            </div>
            <ChevronDown
              {...icon('inline')}
              aria-hidden
              className="hidden text-[var(--graphite)] sm:block"
            />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <div className="mb-1 border-b border-[var(--rule)] px-2 py-2">
              <p className="truncate text-sm font-semibold text-[var(--ink)]">
                {user?.name ?? 'Admin'}
              </p>
              <p className="truncate text-xs text-[var(--graphite)]">{user?.email ?? ''}</p>
            </div>
            <DropdownMenuGroup>
              <DropdownMenuItem id="header-profile-link" onClick={() => router.push('/settings')}>
                Hồ sơ cá nhân
              </DropdownMenuItem>
              <DropdownMenuItem id="header-settings-link" onClick={() => router.push('/settings')}>
                Cài đặt
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem id="header-logout" onClick={handleLogout} variant="destructive">
                Đăng xuất
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
