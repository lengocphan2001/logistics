import type { LucideIcon } from 'lucide-react';
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  BookOpen,
  CreditCard,
  Headphones,
  History,
  LayoutDashboard,
  MessageSquare,
  Package,
  Search,
  ShoppingBag,
  ShoppingCart,
  Sparkles,
  Store,
  Truck,
  User,
  Wallet,
} from 'lucide-react';
import type { PortalNavIcon } from '@/config/portal.config';

export const portalNavIcons: Record<PortalNavIcon, LucideIcon> = {
  LayoutDashboard,
  Package,
  Wallet,
  History,
  User,
  Search,
  Store,
  ShoppingCart,
};

export const portalStatIcons = {
  ShoppingBag,
  Package,
  Truck,
  CreditCard,
} as const;

export const portalQuickPanelIcons = {
  Headphones,
  Wallet,
  Sparkles,
  BookOpen,
} as const;

export const portalQuickLinkIcons = {
  ArrowDownToLine,
  ArrowUpFromLine,
  BookOpen,
  MessageSquare,
  Truck,
} as const;
