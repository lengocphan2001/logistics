import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { toast } from 'sonner';

export function useFetch<T>(key: string[], url: string, options?: object) {
  return useQuery<T>({
    queryKey: key,
    queryFn: async () => {
      const { data } = await api.get(url, options);
      return data?.data ?? data;
    },
  });
}

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
      toast.success(messages?.success ?? 'Thành công!');
    },
    onError: (error: any) => {
      toast.error(messages?.error ?? error?.response?.data?.message ?? 'Có lỗi xảy ra');
    },
  });
}

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
