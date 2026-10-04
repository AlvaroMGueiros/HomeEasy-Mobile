import { Order, Proposal } from '../types/api';

export interface ProfessionalDashboardMetrics {
  proposalsSent: number;
  proposalsAccepted: number;
  conversionRate: number;
  activeOrders: number;
  completedOrders: number;
  grossRevenue: number;
}

const activeOrderStatuses = new Set(['accepted', 'scheduled', 'in_progress']);

export function calculateProfessionalDashboard(proposals: Proposal[], orders: Order[]): ProfessionalDashboardMetrics {
  const proposalsAccepted = proposals.reduce((total, proposal) => total + (proposal.status === 'accepted' ? 1 : 0), 0);
  const activeOrders = orders.reduce((total, order) => total + (activeOrderStatuses.has(order.status) ? 1 : 0), 0);
  const completedOrders = orders.reduce((total, order) => total + (order.status === 'completed' ? 1 : 0), 0);
  const grossRevenue = orders.reduce((total, order) => total + (order.status === 'completed' ? Number(order.agreedPrice) : 0), 0);

  return {
    proposalsSent: proposals.length,
    proposalsAccepted,
    conversionRate: proposals.length ? Math.round((proposalsAccepted / proposals.length) * 100) : 0,
    activeOrders,
    completedOrders,
    grossRevenue
  };
}

export function findUpcomingOrders(orders: Order[], now = new Date()) {
  return orders
    .filter(order => activeOrderStatuses.has(order.status) && order.scheduledAt && new Date(order.scheduledAt).getTime() >= now.getTime())
    .sort((first, second) => new Date(first.scheduledAt as string).getTime() - new Date(second.scheduledAt as string).getTime())
    .slice(0, 5);
}
