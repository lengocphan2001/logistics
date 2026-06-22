import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Email không hợp lệ'),
  password: z.string().min(6, 'Mật khẩu tối thiểu 6 ký tự'),
});

export const createOrderSchema = z.object({
  customerId: z.string().min(1, 'Vui lòng chọn khách hàng'),
  pickupAddress: z.string().min(5, 'Địa chỉ lấy hàng không hợp lệ'),
  deliveryAddress: z.string().min(5, 'Địa chỉ giao hàng không hợp lệ'),
  items: z.array(
    z.object({
      name: z.string().min(1, 'Tên hàng không được để trống'),
      quantity: z.number().min(1),
      weight: z.number().min(0.1),
      price: z.number().min(0),
    })
  ).min(1, 'Cần ít nhất 1 mặt hàng'),
});

export const createDriverSchema = z.object({
  name: z.string().min(2, 'Tên tối thiểu 2 ký tự'),
  email: z.string().email('Email không hợp lệ'),
  phone: z.string().min(10, 'Số điện thoại không hợp lệ'),
  licenseNumber: z.string().min(5, 'Số bằng lái không hợp lệ'),
});

export const createVehicleSchema = z.object({
  plateNumber: z.string().min(5, 'Biển số không hợp lệ'),
  type: z.string().min(1, 'Vui lòng chọn loại xe'),
  brand: z.string().min(1, 'Thương hiệu không được để trống'),
  model: z.string().min(1, 'Model không được để trống'),
  capacity: z.number().min(1, 'Tải trọng không hợp lệ'),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type CreateDriverInput = z.infer<typeof createDriverSchema>;
export type CreateVehicleInput = z.infer<typeof createVehicleSchema>;
