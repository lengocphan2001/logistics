export interface WarehouseOption {
  id: string;
  name: string;
  code: string;
}

export interface StaffUser {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  warehouseId?: string | null;
  warehouse?: WarehouseOption | null;
  createdAt: string;
}

export const roleLabels: Record<string, string> = {
  ADMIN: 'Quản trị hệ thống',
  SALES: 'Nhân viên kinh doanh',
  WAREHOUSE_MANAGER: 'Quản trị kho',
  DRIVER: 'Nhân viên giao hàng',
};

export const ROLES = ['ADMIN', 'SALES', 'WAREHOUSE_MANAGER', 'DRIVER'] as const;
