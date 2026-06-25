import { Customer } from '@prisma/client';

export type SafeCustomer = Omit<Customer, 'password'>;

export function sanitizeCustomer<T extends Customer>(
  customer: T,
): SafeCustomer {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { password, ...safe } = customer;
  return safe;
}
