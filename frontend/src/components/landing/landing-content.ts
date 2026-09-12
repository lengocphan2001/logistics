import { Box, Sparkles, Truck, Wallet, type LucideIcon } from 'lucide-react';

export const platforms = ['Taobao', '1688', 'Tmall', 'Alibaba'];

export const services: { icon: LucideIcon; title: string; desc: string }[] = [
  {
    icon: Box,
    title: 'Ký gửi hàng',
    desc: 'Gửi hàng từ Trung Quốc về Việt Nam với quy trình minh bạch, cân đo chuẩn xác và báo phí rõ ràng.',
  },
  {
    icon: Sparkles,
    title: 'Mua hộ và thanh toán hộ',
    desc: 'Đặt hàng, thanh toán đơn Tmall, Taobao, 1688. Đội ngũ xử lý mua và kiểm tra hàng giúp bạn.',
  },
  {
    icon: Wallet,
    title: 'Ví nhân dân tệ',
    desc: 'Nạp và rút ví CNY, lịch sử giao dịch chi tiết, thanh toán đơn hàng chỉ với vài thao tác.',
  },
  {
    icon: Truck,
    title: 'Theo dõi thời gian thực',
    desc: 'Cập nhật trạng thái từ kho Trung Quốc đến kho Việt Nam và giao tận tay khách hàng.',
  },
];

export const steps = [
  {
    title: 'Đăng ký và nạp ví',
    desc: 'Tạo tài khoản miễn phí, cập nhật hồ sơ nhận hàng và nạp số dư để sẵn sàng đặt hàng.',
  },
  {
    title: 'Tạo đơn hoặc ký gửi',
    desc: 'Gửi link sản phẩm hoặc mã vận đơn Trung Quốc. Hệ thống ghi nhận, báo phí và xử lý ngay.',
  },
  {
    title: 'Theo dõi và nhận hàng',
    desc: 'Theo dõi hành trình đơn hàng, thanh toán phí cuối và nhận hàng tại Việt Nam.',
  },
];

export const stats = [
  { value: '10K+', label: 'Đơn hàng đã xử lý' },
  { value: '99,2%', label: 'Giao đúng hạn' },
  { value: '24/7', label: 'Hỗ trợ khách hàng' },
  { value: '2 đến 5 ngày', label: 'Thời gian vận chuyển' },
];

export const highlights = [
  'Phí minh bạch, không phát sinh bất ngờ',
  'Kho tại Quảng Châu và Hà Nội',
  'Đối soát cân nặng và hoàn tiền khi sai lệch',
];

/** The worked example shown beside the hero copy. */
export const exampleShipment = {
  code: 'VN-28491',
  weight: '3,2 kg',
  shippingFee: '¥ 48,50',
  legs: [
    { label: 'Kho Quảng Châu', sub: 'Đã xuất kho ngày 12/06', done: true },
    { label: 'Đang về kho Hà Nội', sub: 'Dự kiến 2 ngày nữa', done: true },
    { label: 'Giao hàng tận nơi', sub: 'Chờ xác nhận địa chỉ', done: false },
  ],
};
