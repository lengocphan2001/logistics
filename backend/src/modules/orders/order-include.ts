/**
 * The shape every endpoint that returns a single order uses. Kept in its own
 * file so the query service and the workflow service cannot drift apart on what
 * an order response contains.
 */
export const ORDER_INCLUDE = {
  customer: {
    select: {
      id: true,
      fullName: true,
      phone: true,
      username: true,
      balance: true,
    },
  },
  createdBy: { select: { id: true, name: true, email: true } },
  assignedTo: { select: { id: true, name: true, email: true } },
  driver: { select: { id: true, name: true, email: true } },
  warehouse: { select: { id: true, name: true, code: true } },
  cnWarehouse: { select: { id: true, name: true, code: true } },
  events: { orderBy: { createdAt: 'desc' as const }, take: 20 },
  items: { orderBy: { createdAt: 'asc' as const } },
};
