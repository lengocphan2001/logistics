// ---- Generic ----
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

export interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// ---- User ----
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'staff';
  avatar?: string;
  phone?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// ---- Order ----
export type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

export interface Order {
  id: string;
  orderCode: string;
  customerId: string;
  customer?: Customer;
  status: OrderStatus;
  totalAmount: number;
  items: OrderItem[];
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  id: string;
  orderId: string;
  name: string;
  quantity: number;
  weight: number;
  price: number;
}

// ---- Shipment ----
export type ShipmentStatus = 'pending' | 'picked_up' | 'in_transit' | 'out_for_delivery' | 'delivered' | 'failed';

export interface Shipment {
  id: string;
  trackingCode: string;
  orderId: string;
  order?: Order;
  driverId?: string;
  driver?: Driver;
  vehicleId?: string;
  vehicle?: Vehicle;
  status: ShipmentStatus;
  pickupAddress: string;
  deliveryAddress: string;
  estimatedDelivery?: string;
  actualDelivery?: string;
  createdAt: string;
  updatedAt: string;
}

// ---- Customer ----
export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// ---- Driver ----
export type DriverStatus = 'available' | 'on_delivery' | 'offline';

export interface Driver {
  id: string;
  name: string;
  email: string;
  phone: string;
  licenseNumber: string;
  status: DriverStatus;
  vehicleId?: string;
  vehicle?: Vehicle;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// ---- Vehicle ----
export type VehicleStatus = 'active' | 'maintenance' | 'inactive';

export interface Vehicle {
  id: string;
  plateNumber: string;
  type: string;
  brand: string;
  model: string;
  capacity: number;
  status: VehicleStatus;
  createdAt: string;
  updatedAt: string;
}
