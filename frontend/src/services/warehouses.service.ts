import api from '@/lib/api';

export type WarehouseCountry = 'CN' | 'VN';

export interface WarehouseOption {
  id: string;
  name: string;
  code: string;
  address: string;
  country: WarehouseCountry;
}

export const warehousesService = {
  listForCustomer: (country?: WarehouseCountry): Promise<WarehouseOption[]> =>
    api.get('/customer/warehouses', { params: country ? { country } : {} }).then((r) => r.data),
};
