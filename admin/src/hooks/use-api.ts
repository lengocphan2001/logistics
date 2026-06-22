import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { toast } from 'sonner';

// Generic fetch hook
export function useFetch<T>(key: string[], url: string, options?: object) {
  return useQuery<T>({
    queryKey: key,
    queryFn: async () => {
      const { data } = await api.get(url, options);
      return data?.data ?? data;
    },
  });
}

// Generic create hook
export function useCreate<TData, TPayload>(
  url: string,
  invalidateKeys: string[][],
  messages?: { success?: string; error?: string }
) {
  const queryClient = useQueryClient();

  return useMutation<TData, Error, TPayload>({
    mutationFn: async (payload) => {
      const { data } = await api.post(url, payload);
      return data?.data ?? data;
    },
    onSuccess: () => {
      invalidateKeys.forEach((key) => queryClient.invalidateQueries({ queryKey: key }));
      toast.success(messages?.success ?? 'Tạo thành công!');
    },
    onError: (error: any) => {
      toast.error(messages?.error ?? error?.response?.data?.message ?? 'Có lỗi xảy ra');
    },
  });
}

// Generic update hook
export function useUpdate<TData, TPayload>(
  url: string,
  invalidateKeys: string[][],
  messages?: { success?: string; error?: string }
) {
  const queryClient = useQueryClient();

  return useMutation<TData, Error, { id: string; payload: TPayload }>({
    mutationFn: async ({ id, payload }) => {
      const { data } = await api.put(`${url}/${id}`, payload);
      return data?.data ?? data;
    },
    onSuccess: () => {
      invalidateKeys.forEach((key) => queryClient.invalidateQueries({ queryKey: key }));
      toast.success(messages?.success ?? 'Cập nhật thành công!');
    },
    onError: (error: any) => {
      toast.error(messages?.error ?? error?.response?.data?.message ?? 'Có lỗi xảy ra');
    },
  });
}

// Generic delete hook
export function useRemove(
  url: string,
  invalidateKeys: string[][],
  messages?: { success?: string; error?: string }
) {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: async (id) => {
      await api.delete(`${url}/${id}`);
    },
    onSuccess: () => {
      invalidateKeys.forEach((key) => queryClient.invalidateQueries({ queryKey: key }));
      toast.success(messages?.success ?? 'Xóa thành công!');
    },
    onError: (error: any) => {
      toast.error(messages?.error ?? error?.response?.data?.message ?? 'Có lỗi xảy ra');
    },
  });
}
