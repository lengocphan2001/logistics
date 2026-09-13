import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // 1. Create some Warehouses
  // A purchase order always travels CN warehouse -> VN warehouse, so the seed
  // has to provide at least one of each. `country` defaults to VN in the
  // schema, which is why it is set explicitly here.
  const whCn = await prisma.warehouse.upsert({
    where: { code: 'WH-GZ-01' },
    update: { country: 'CN' },
    create: {
      name: 'Kho Quảng Châu',
      code: 'WH-GZ-01',
      address: 'Bạch Vân, Quảng Châu, Quảng Đông, Trung Quốc',
      country: 'CN',
    },
  });

  const wh1 = await prisma.warehouse.upsert({
    where: { code: 'WH-HN-01' },
    update: { country: 'VN' },
    create: {
      name: 'Kho Hà Nội Bắc Từ Liêm',
      code: 'WH-HN-01',
      address: 'Số 10 Đường Cầu Diễn, Bắc Từ Liêm, Hà Nội',
      country: 'VN',
    },
  });

  const wh2 = await prisma.warehouse.upsert({
    where: { code: 'WH-SG-01' },
    update: { country: 'VN' },
    create: {
      name: 'Kho Sài Gòn Quận 12',
      code: 'WH-SG-01',
      address: 'Số 150 Quốc lộ 1A, Quận 12, TP. Hồ Chí Minh',
      country: 'VN',
    },
  });

  // Bảng giá vận chuyển mặc định, khớp với SHIPPING_METHODS ở frontend.
  const shippingRates = [
    {
      method: 'standard',
      name: 'Line Thường',
      pricePerKgVnd: 25000,
      minChargeVnd: 25000,
      estimatedDays: '5 đến 7 ngày',
      sortOrder: 1,
    },
    {
      method: 'express',
      name: 'Line Nhanh',
      pricePerKgVnd: 38000,
      minChargeVnd: 38000,
      estimatedDays: '3 đến 4 ngày',
      sortOrder: 2,
    },
    {
      method: 'economy',
      name: 'Line Tiết Kiệm',
      pricePerKgVnd: 18000,
      minChargeVnd: 20000,
      estimatedDays: '8 đến 12 ngày',
      sortOrder: 3,
    },
  ];

  for (const rate of shippingRates) {
    await prisma.shippingRate.upsert({
      where: { method: rate.method },
      update: {},
      create: rate,
    });
  }

  console.log('Warehouses seeded:', { whCn, wh1, wh2 });

  // 2. Hash Password
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash('123456', salt);

  // 3. Create Users
  const admin = await prisma.user.upsert({
    where: { email: 'admin@logistics.vn' },
    update: { password: passwordHash },
    create: {
      email: 'admin@logistics.vn',
      password: passwordHash,
      name: 'Hệ thống Admin',
      role: Role.ADMIN,
      status: 'ACTIVE',
    },
  });

  const sales = await prisma.user.upsert({
    where: { email: 'sales@logistics.vn' },
    update: { password: passwordHash },
    create: {
      email: 'sales@logistics.vn',
      password: passwordHash,
      name: 'Nguyễn Văn Kinh Doanh',
      role: Role.SALES,
      status: 'ACTIVE',
    },
  });

  const whManager = await prisma.user.upsert({
    where: { email: 'warehouse@logistics.vn' },
    update: { password: passwordHash, warehouseId: wh1.id },
    create: {
      email: 'warehouse@logistics.vn',
      password: passwordHash,
      name: 'Trần Văn Thủ Kho',
      role: Role.WAREHOUSE_MANAGER,
      warehouseId: wh1.id,
      status: 'ACTIVE',
    },
  });

  const driver = await prisma.user.upsert({
    where: { email: 'driver@logistics.vn' },
    update: { password: passwordHash },
    create: {
      email: 'driver@logistics.vn',
      password: passwordHash,
      name: 'Lê Văn Tài Xế',
      role: Role.DRIVER,
      status: 'ACTIVE',
    },
  });

  console.log('Users seeded:', { admin, sales, whManager, driver });
  console.log('Database seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
