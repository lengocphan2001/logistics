'use client';

import { Menu, Moon, Sun, ChevronDown } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { SearchInput } from '@/components/ui/input-group';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { NotificationBell } from '@/components/layout/NotificationBell';
import { useUIStore } from '@/stores/ui.store';
import { useAuthStore } from '@/stores/auth.store';
import { useRouter } from 'next/navigation';

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
    <header className="sticky top-0 z-20 flex items-center h-16 px-6 bg-background/80 backdrop-blur-md border-b border-border gap-4">
      {/* Mobile menu toggle */}
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden shrink-0"
        onClick={toggleSidebar}
        id="header-menu-toggle"
      >
        <Menu className="w-5 h-5" />
      </Button>

      {/* Page title */}
      {title && (
        <motion.h1
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-lg font-semibold text-foreground hidden sm:block"
        >
          {title}
        </motion.h1>
      )}

      {/* Search */}
      <div className="flex-1 max-w-sm hidden md:block">
        <SearchInput
          placeholder="Tìm kiếm..."
          className="bg-muted/40 border-transparent focus-visible:bg-background"
          id="header-search"
        />
      </div>

      <div className="flex items-center gap-2 ml-auto">
        {/* Theme toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          className="h-9 w-9 text-muted-foreground hover:text-foreground"
          id="header-theme-toggle"
        >
          {theme === 'dark' ? (
            <Sun className="w-4 h-4" />
          ) : (
            <Moon className="w-4 h-4" />
          )}
        </Button>

        {/* Notifications */}
        <NotificationBell />

        {/* User menu */}
        <DropdownMenu>
          <DropdownMenuTrigger
            className="flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-lg hover:bg-accent transition-colors cursor-pointer"
            id="header-user-menu"
          >
            <Avatar className="h-7 w-7">
              <AvatarImage src={user?.avatar} />
              <AvatarFallback className="bg-primary text-primary-foreground text-xs font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="hidden sm:block text-left">
              <p className="text-sm font-medium leading-tight text-foreground">
                {user?.name ?? 'Admin'}
              </p>
              <p className="text-[11px] text-muted-foreground leading-tight capitalize">
                {user?.role ?? 'admin'}
              </p>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-muted-foreground hidden sm:block" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52">
            {/* User info — plain div, not GroupLabel (requires Group context) */}
            <div className="px-2 py-2 border-b border-border mb-1">
              <p className="font-semibold text-sm text-foreground truncate">{user?.name ?? 'Admin'}</p>
              <p className="text-xs text-muted-foreground truncate">{user?.email ?? ''}</p>
            </div>
            <DropdownMenuGroup>
              <DropdownMenuLabel>Tài khoản</DropdownMenuLabel>
              <DropdownMenuItem id="header-profile-link" onClick={() => router.push('/settings')}>
                Hồ sơ cá nhân
              </DropdownMenuItem>
              <DropdownMenuItem id="header-settings-link" onClick={() => router.push('/settings')}>
                Cài đặt
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem
                id="header-logout"
                onClick={handleLogout}
                className="text-destructive"
              >
                Đăng xuất
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
