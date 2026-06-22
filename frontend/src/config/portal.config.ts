import type { OrderType } from '@/lib/order-type';
import type { LucideIcon } from 'lucide-react';

export type PortalNavIcon =
  | 'LayoutDashboard'
  | 'Package'
  | 'Wallet'
  | 'History'
  | 'User'
  | 'Search';

export interface PortalNavItem {
  label: string;
  href: string;
  icon: PortalNavIcon;
  /** Chỉ highlight khi path khớp chính xác (mặc định: false → prefix match) */
  exact?: boolean;
}

export interface PortalStatCardConfig {
  type: OrderType;
  label: string;
  description: string;
  icon: 'ShoppingBag' | 'Package' | 'Truck' | 'CreditCard';
  accent: string;
  iconClass: string;
}

export interface PortalQuickLink {
  label: string;
  href: string;
  icon?: 'ArrowDownToLine' | 'ArrowUpFromLine' | 'BookOpen' | 'MessageSquare' | 'Truck';
}

export interface PortalQuickPanelConfig {
  id: string;
  title: string;
  icon: 'Headphones' | 'Wallet' | 'Sparkles' | 'BookOpen';
  links: PortalQuickLink[];
}

export interface PortalOrderTableConfig {
  type: OrderType;
  title: string;
  limit: number;
  headerClass: string;
  viewAllHref: string;
}

export const portalConfig = {
  brand: {
    name: 'Taman Logistics',
    tagline: 'Trung Quốc → Việt Nam',
    homeHref: '/dashboard',
  },

  support: {
    staffLabel: 'Nhân viên CSKH',
    staffName: 'Đội ngũ Taman',
    phone: '1900 xxxx',
    email: 'support@tamanlogistics.vn',
  },

  nav: [
    { label: 'Tổng quan', href: '/dashboard', icon: 'LayoutDashboard', exact: true },
    { label: 'Đơn hàng', href: '/orders', icon: 'Package' },
    { label: 'Nạp / Rút ví', href: '/wallet', icon: 'Wallet' },
    { label: 'Lịch sử GD', href: '/wallet/transactions', icon: 'History' },
    { label: 'Tra cứu', href: '/orders?track=1', icon: 'Search' },
    { label: 'Hồ sơ', href: '/profile', icon: 'User' },
  ] satisfies PortalNavItem[],

  dashboard: {
    pageTitle: 'Tổng quan',
    statCards: [
      {
        type: 'PROXY_PURCHASE',
        label: 'Mua hộ',
        description: 'Đơn mua hộ',
        icon: 'ShoppingBag',
        accent: 'border-amber-400/30 bg-gradient-to-br from-amber-50 to-amber-100/50',
        iconClass: 'bg-amber-500/15 text-amber-700',
      },
      {
        type: 'PROXY_ORDER',
        label: 'Đặt hàng hộ',
        description: 'Đơn đặt hàng',
        icon: 'Package',
        accent: 'border-yellow-500/25 bg-gradient-to-br from-yellow-50 to-yellow-100/40',
        iconClass: 'bg-yellow-600/12 text-yellow-800',
      },
      {
        type: 'CONSIGNMENT',
        label: 'Ký gửi',
        description: 'Đơn ký gửi',
        icon: 'Truck',
        accent: 'border-orange-400/25 bg-gradient-to-br from-orange-50 to-orange-100/40',
        iconClass: 'bg-orange-500/12 text-orange-700',
      },
      {
        type: 'PROXY_PAYMENT',
        label: 'Thanh toán hộ',
        description: 'Đơn thanh toán',
        icon: 'CreditCard',
        accent: 'border-stone-400/25 bg-gradient-to-br from-stone-50 to-stone-100/50',
        iconClass: 'bg-stone-500/12 text-stone-700',
      },
    ] satisfies PortalStatCardConfig[],

    quickPanels: [
      {
        id: 'support',
        title: 'Nhân viên CSKH',
        icon: 'Headphones',
        links: [
          { label: 'support@tamanlogistics.vn', href: 'mailto:support@tamanlogistics.vn', icon: 'MessageSquare' },
          { label: 'Hotline 1900 xxxx', href: 'tel:1900', icon: 'MessageSquare' },
        ],
      },
      {
        id: 'wallet',
        title: 'Ví Taman',
        icon: 'Wallet',
        links: [
          { label: 'Nạp tiền', href: '/wallet?type=DEPOSIT', icon: 'ArrowDownToLine' },
          { label: 'Rút tiền', href: '/wallet?type=WITHDRAWAL', icon: 'ArrowUpFromLine' },
          { label: 'Lịch sử giao dịch', href: '/wallet/transactions' },
        ],
      },
      {
        id: 'utilities',
        title: 'Tiện ích',
        icon: 'Sparkles',
        links: [
          { label: 'Tra cứu vận đơn', href: '/orders?track=1', icon: 'Truck' },
          { label: 'Cập nhật hồ sơ', href: '/profile' },
        ],
      },
      {
        id: 'guides',
        title: 'Hướng dẫn',
        icon: 'BookOpen',
        links: [
          { label: 'Quy trình đặt hàng', href: '/#quy-trinh' },
          { label: 'Quy trình ký gửi', href: '/#dich-vu' },
        ],
      },
    ] satisfies PortalQuickPanelConfig[],

    orderTables: [
      {
        type: 'PROXY_PURCHASE',
        title: 'Đơn hàng mua hộ',
        limit: 5,
        headerClass: 'bg-amber-600/90 text-white',
        viewAllHref: '/orders?type=PROXY_PURCHASE',
      },
      {
        type: 'PROXY_ORDER',
        title: 'Đơn hàng đặt hàng hộ',
        limit: 5,
        headerClass: 'bg-yellow-700/90 text-white',
        viewAllHref: '/orders?type=PROXY_ORDER',
      },
    ] satisfies PortalOrderTableConfig[],
  },
} as const;

export type PortalConfig = typeof portalConfig;
