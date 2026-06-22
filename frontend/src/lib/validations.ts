import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Email không hợp lệ'),
  password: z.string().min(6, 'Mật khẩu tối thiểu 6 ký tự'),
});

export const registerSchema = z.object({
  username: z.string().min(3, 'Username tối thiểu 3 ký tự'),
  fullName: z.string().min(2, 'Họ tên tối thiểu 2 ký tự'),
  email: z.string().email('Email không hợp lệ'),
  phone: z.string().min(10, 'Số điện thoại không hợp lệ'),
  password: z.string().min(6, 'Mật khẩu tối thiểu 6 ký tự'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Mật khẩu xác nhận không khớp',
  path: ['confirmPassword'],
});

export const createOrderSchema = z.object({
  pickupAddress: z.string().min(5, 'Địa chỉ lấy hàng không hợp lệ'),
  deliveryAddress: z.string().min(5, 'Địa chỉ giao hàng không hợp lệ'),
  note: z.string().optional(),
  items: z.array(
    z.object({
      name: z.string().min(1),
      quantity: z.number().min(1),
      weight: z.number().min(0.1),
    })
  ).min(1, 'Cần ít nhất 1 mặt hàng'),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type CreateOrderInput = z.infer<typeof createOrderSchema>;
