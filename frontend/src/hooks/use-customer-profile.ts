'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { profileService, type CustomerProfile } from '@/services/profile.service';

/**
 * Shared cache key. The top bar and the checkout read the same profile, so a
 * balance change after an order has to reach both without a page reload.
 */
export const customerProfileKey = ['customer', 'profile'] as const;

export function useCustomerProfile() {
  const queryClient = useQueryClient();

  const { data, isLoading, isError } = useQuery<CustomerProfile>({
    queryKey: customerProfileKey,
    queryFn: async () => (await profileService.get()).data,
    staleTime: 30 * 1000,
  });

  return {
    profile: data ?? null,
    loading: isLoading,
    error: isError ? 'Không thể tải hồ sơ' : null,
    refresh: () => queryClient.invalidateQueries({ queryKey: customerProfileKey }),
  };
}
