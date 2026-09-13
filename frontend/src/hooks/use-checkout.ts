'use client';

import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { cartService } from '@/services/cart.service';
import { warehousesService } from '@/services/warehouses.service';
import { useCartStore } from '@/stores/cart.store';
import { useCustomerProfile } from '@/hooks/use-customer-profile';
import { useExchangeRate } from '@/hooks/use-exchange-rate';
import { groupCartByShop } from '@/lib/cart-groups';
import { PURCHASE_FEE_RATE, SHIPPING_METHODS } from '@/config/shop.config';
import { cnyToVnd } from '@/lib/currency';
import { apiErrorMessage } from '@/lib/api-error';

export type CheckoutForm = {
  receiverName: string;
  receiverPhone: string;
  receiverAddress: string;
  receiverProvince: string;
  receiverDistrict: string;
  note: string;
  cnWarehouseId: string;
  vnWarehouseId: string;
  shippingMethod: string;
};

const EMPTY_FORM: CheckoutForm = {
  receiverName: '',
  receiverPhone: '',
  receiverAddress: '',
  receiverProvince: '',
  receiverDistrict: '',
  note: '',
  cnWarehouseId: '',
  vnWarehouseId: '',
  shippingMethod: SHIPPING_METHODS[0].value,
};

/**
 * All checkout state in one place: the cart to be ordered, the warehouse
 * options, the receiver form, the totals and the submit.
 *
 * Fields the customer has not touched fall back to their profile, so the
 * stored form only ever holds real edits.
 */
export function useCheckout(selectedIds: string[]) {
  const invalidate = useCartStore((s) => s.invalidate);
  const { profile } = useCustomerProfile();
  const { vndPerCny } = useExchangeRate();

  const { data: cart, isLoading: cartLoading } = useQuery({
    queryKey: ['cart', 'checkout', { enrich: true }],
    queryFn: () => cartService.getCart({ enrichProperties: true }),
    staleTime: 0,
  });

  const { data: cnWarehouses = [], isLoading: cnLoading } = useQuery({
    queryKey: ['warehouses', 'CN'],
    queryFn: () => warehousesService.listForCustomer('CN'),
    staleTime: 5 * 60 * 1000,
  });

  const { data: vnWarehouses = [], isLoading: vnLoading } = useQuery({
    queryKey: ['warehouses', 'VN'],
    queryFn: () => warehousesService.listForCustomer('VN'),
    staleTime: 5 * 60 * 1000,
  });

  const [form, setForm] = useState<CheckoutForm>(EMPTY_FORM);
  const [services, setServices] = useState<Record<string, boolean>>({});
  const [agreed, setAgreed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [orderIds, setOrderIds] = useState<string[] | null>(null);

  const setField = <K extends keyof CheckoutForm>(key: K, value: CheckoutForm[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const cnWarehouseId = form.cnWarehouseId || cnWarehouses[0]?.id || '';
  const vnWarehouseId = form.vnWarehouseId || vnWarehouses[0]?.id || '';
  const receiverName = form.receiverName || profile?.name || '';
  const receiverPhone = form.receiverPhone || profile?.phone || '';
  const receiverAddress =
    form.receiverAddress || profile?.shippingAddress || profile?.address || '';

  const selectedItems = useMemo(
    () =>
      cart?.items.filter((i) => selectedIds.length === 0 || selectedIds.includes(i.id)) ?? [],
    [cart?.items, selectedIds],
  );

  const shopGroups = useMemo(() => groupCartByShop(selectedItems), [selectedItems]);

  const goodsTotalCny = selectedItems.reduce(
    (sum, i) => sum + Number(i.priceCny) * i.quantity,
    0,
  );
  const goodsTotalVnd = cnyToVnd(goodsTotalCny, vndPerCny);
  const serviceFeeVnd = Math.round(goodsTotalVnd * PURCHASE_FEE_RATE);
  const grandTotalVnd = goodsTotalVnd + serviceFeeVnd;

  const submit = async () => {
    if (!receiverName || !receiverPhone || !receiverAddress) {
      toast.error('Vui lòng điền đầy đủ thông tin người nhận');
      return;
    }
    if (!cnWarehouseId) {
      toast.error(
        cnWarehouses.length === 0
          ? 'Hệ thống chưa có kho Trung Quốc. Vui lòng liên hệ nhân viên hỗ trợ.'
          : 'Vui lòng chọn kho Trung Quốc',
      );
      return;
    }
    if (!vnWarehouseId) {
      toast.error(
        vnWarehouses.length === 0
          ? 'Hệ thống chưa có kho Việt Nam. Vui lòng liên hệ nhân viên hỗ trợ.'
          : 'Vui lòng chọn kho Việt Nam',
      );
      return;
    }
    if (!agreed) {
      toast.error('Vui lòng đồng ý với điều khoản');
      return;
    }

    setSubmitting(true);
    try {
      const result = await cartService.checkout({
        receiverName,
        receiverPhone,
        receiverAddress,
        receiverProvince: form.receiverProvince || undefined,
        receiverDistrict: form.receiverDistrict || undefined,
        note: form.note || undefined,
        cartItemIds: selectedIds.length > 0 ? selectedIds : undefined,
        cnWarehouseId,
        vnWarehouseId,
        shippingMethod:
          SHIPPING_METHODS.find((m) => m.value === form.shippingMethod)?.label ??
          form.shippingMethod,
      });
      invalidate();
      setOrderIds(result.orderIds);
    } catch (err) {
      toast.error(apiErrorMessage(err, 'Đặt hàng thất bại'));
    } finally {
      setSubmitting(false);
    }
  };

  return {
    cart,
    cartLoading,
    vndPerCny,
    selectedItems,
    shopGroups,

    warehouses: {
      cn: cnWarehouses,
      vn: vnWarehouses,
      cnLoading,
      vnLoading,
      cnWarehouseId,
      vnWarehouseId,
    },

    form,
    setField,
    receiver: { receiverName, receiverPhone, receiverAddress },

    services,
    toggleService: (id: string, checked: boolean) =>
      setServices((prev) => ({ ...prev, [id]: checked })),

    agreed,
    setAgreed,

    totals: { goodsTotalCny, goodsTotalVnd, serviceFeeVnd, grandTotalVnd },

    submitting,
    submit,
    orderIds,
  };
}
