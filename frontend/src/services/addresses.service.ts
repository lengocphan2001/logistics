import api from '@/lib/api';

export interface CustomerAddress {
  id: string;
  label?: string | null;
  receiverName: string;
  receiverPhone: string;
  receiverAddress: string;
  receiverProvince?: string | null;
  receiverDistrict?: string | null;
  isDefault: boolean;
}

export type UpsertAddressPayload = Omit<CustomerAddress, 'id' | 'isDefault'> & {
  isDefault?: boolean;
};

const BASE = '/customer/addresses';

export const addressesService = {
  list: () => api.get<CustomerAddress[]>(BASE),
  create: (payload: UpsertAddressPayload) =>
    api.post<CustomerAddress>(BASE, payload),
  update: (id: string, payload: UpsertAddressPayload) =>
    api.patch<CustomerAddress>(`${BASE}/${id}`, payload),
  remove: (id: string) => api.delete(`${BASE}/${id}`),
};
