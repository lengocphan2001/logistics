export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
export type ShipmentStatus = 'pending' | 'picked_up' | 'in_transit' | 'out_for_delivery' | 'delivered' | 'failed';

export interface Order {
  id: string;
  orderCode: string;
  status: OrderStatus;
  totalAmount: number;
  pickupAddress: string;
  deliveryAddress: string;
  createdAt: string;
  updatedAt: string;
}

export interface Shipment {
  id: string;
  trackingCode: string;
  orderId: string;
  status: ShipmentStatus;
  pickupAddress: string;
  deliveryAddress: string;
  estimatedDelivery?: string;
  actualDelivery?: string;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  createdAt: string;
}
