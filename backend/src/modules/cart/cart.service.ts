import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { ProductsService } from '../products/products.service';
import { UpsertCartItemDto } from './dto/upsert-cart-item.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';

type CartItemProperty = { name: string; value: string };

function serializeCartItem<T extends { priceCny: { toString(): string } | number; properties?: unknown }>(
  item: T,
): Omit<T, 'priceCny' | 'properties'> & { priceCny: number; properties?: CartItemProperty[] } {
  const props = item.properties;
  const properties = Array.isArray(props)
    ? (props as CartItemProperty[])
    : props && typeof props === 'object'
      ? Object.entries(props as Record<string, string>).map(([name, value]) => ({
          name,
          value: String(value),
        }))
      : undefined;

  return {
    ...item,
    priceCny: Number(item.priceCny),
    properties,
  };
}

function hasProperties(props: unknown): boolean {
  return Array.isArray(props) && props.length > 0;
}

@Injectable()
export class CartService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly productsService: ProductsService,
  ) {}

  private async ensureCart(customerId: string) {
    return this.prisma.cart.upsert({
      where: { customerId },
      create: { customerId },
      update: {},
    });
  }

  private async enrichItemProperties(item: {
    id: string;
    itemId: string;
    providerAlias: string;
    skuId?: string | null;
    properties?: unknown;
  }) {
    if (hasProperties(item.properties)) {
      return serializeCartItem(item as any);
    }

    const resolved = await this.productsService.resolveSkuProperties(
      item.providerAlias,
      item.itemId,
      item.skuId,
    );

    if (resolved.length === 0) {
      return serializeCartItem(item as any);
    }

    await this.prisma.cartItem.update({
      where: { id: item.id },
      data: { properties: resolved as any },
    });

    return serializeCartItem({ ...item, properties: resolved } as any);
  }

  async getCart(customerId: string, enrichProperties = false) {
    const cart = await this.prisma.cart.findUnique({
      where: { customerId },
      include: { items: { orderBy: { createdAt: 'asc' } } },
    });
    if (!cart) return { items: [], total: 0 };

    let items = cart.items.map((i) => serializeCartItem(i as any));

    if (enrichProperties) {
      items = await Promise.all(
        cart.items.map((raw) => this.enrichItemProperties(raw)),
      );
    }

    const total = items.reduce((sum, i) => sum + i.priceCny * i.quantity, 0);
    return { items, total };
  }

  async upsertItem(customerId: string, dto: UpsertCartItemDto) {
    const cart = await this.ensureCart(customerId);
    const priceCny = Number(dto.priceCny);

    const existing = await this.prisma.cartItem.findFirst({
      where: { cartId: cart.id, itemId: dto.itemId, skuId: dto.skuId ?? null },
    });

    if (existing) {
      const updated = await this.prisma.cartItem.update({
        where: { id: existing.id },
        data: {
          quantity: dto.quantity,
          priceCny,
          ...(dto.properties?.length ? { properties: dto.properties as any } : {}),
        },
      });
      return serializeCartItem(updated as any);
    }

    const created = await this.prisma.cartItem.create({
      data: {
        cartId: cart.id,
        itemId: dto.itemId,
        providerAlias: dto.providerAlias,
        skuId: dto.skuId,
        title: dto.title,
        image: dto.image,
        url: dto.url,
        shopId: dto.shopId,
        shopName: dto.shopName,
        platform: dto.platform,
        priceCny,
        quantity: dto.quantity,
        note: dto.note,
        properties: (dto.properties ?? []) as any,
      },
    });
    return serializeCartItem(created as any);
  }

  async updateItem(customerId: string, cartItemId: string, dto: UpdateCartItemDto) {
    const cart = await this.prisma.cart.findUnique({ where: { customerId } });
    if (!cart) throw new NotFoundException('Giỏ hàng không tồn tại');

    const item = await this.prisma.cartItem.findFirst({
      where: { id: cartItemId, cartId: cart.id },
    });
    if (!item) throw new NotFoundException('Mục không tồn tại trong giỏ hàng');

    const data: { quantity?: number; note?: string | null } = {};

    if (dto.quantity !== undefined && dto.quantity !== null && dto.quantity !== '') {
      const q = Math.floor(Number(dto.quantity));
      if (!Number.isFinite(q) || q < 1) {
        throw new BadRequestException('Số lượng phải là số nguyên >= 1');
      }
      data.quantity = q;
    }

    if (dto.note !== undefined) {
      data.note = dto.note.trim() || null;
    }

    if (Object.keys(data).length === 0) {
      throw new BadRequestException('Không có dữ liệu cập nhật');
    }

    const updated = await this.prisma.cartItem.update({
      where: { id: cartItemId },
      data,
    });
    return serializeCartItem(updated as any);
  }

  async removeShopItems(customerId: string, shopKey: string) {
    const cart = await this.prisma.cart.findUnique({ where: { customerId } });
    if (!cart) throw new NotFoundException('Giỏ hàng không tồn tại');

    const items = await this.prisma.cartItem.findMany({ where: { cartId: cart.id } });
    const toDelete = items.filter((i) => (i.shopId || i.shopName || '__unknown__') === shopKey);
    if (toDelete.length === 0) return { success: true, deleted: 0 };

    await this.prisma.cartItem.deleteMany({
      where: { id: { in: toDelete.map((i) => i.id) } },
    });
    return { success: true, deleted: toDelete.length };
  }

  async removeItem(customerId: string, cartItemId: string) {
    const cart = await this.prisma.cart.findUnique({ where: { customerId } });
    if (!cart) throw new NotFoundException('Giỏ hàng không tồn tại');

    const item = await this.prisma.cartItem.findFirst({
      where: { id: cartItemId, cartId: cart.id },
    });
    if (!item) throw new NotFoundException('Mục không tồn tại trong giỏ hàng');

    await this.prisma.cartItem.delete({ where: { id: cartItemId } });
    return { success: true };
  }

  async clearCart(customerId: string) {
    const cart = await this.prisma.cart.findUnique({ where: { customerId } });
    if (cart) {
      await this.prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
    }
    return { success: true };
  }
}
