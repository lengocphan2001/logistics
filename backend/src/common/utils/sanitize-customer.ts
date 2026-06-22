import { Customer } from '@prisma/client';

export type SafeCustomer = Omit<Customer, 'password'>;

export function sanitizeCustomer<T extends Customer>(customer: T): SafeCustomer {
  const { password: _password, ...safe } = customer;
  return safe;
}
