const _ = require('lodash');
const orderProcessing = require('./orderProcessing');
const { formatCurrency } = require('../utils/helpers');

/**
 * Get top customers by total spending
 */
function getTopCustomers(customers, limit = 5) {
  const orders = orderProcessing.getOrders();
  const completedOrders = _.filter(orders, { status: 'completed' });

  const customerSpending = _.chain(completedOrders)
    .groupBy('customerId')
    .map((customerOrders, customerId) => {
      const customer = _.find(customers, { id: _.toNumber(customerId) });
      return {
        customerId: _.toNumber(customerId),
        name: customer ? customer.name : 'Unknown',
        totalSpent: _.sumBy(customerOrders, 'totalAmount'),
        orderCount: customerOrders.length,
      };
    })
    .orderBy(['totalSpent'], ['desc'])
    .take(limit)
    .value();

  return customerSpending;
}

/**
 * Group customers by city
 */
function getCustomersByCity(customers) {
  return _.groupBy(customers, 'city');
}

/**
 * Get average spending per customer
 */
function getAverageSpending(customers) {
  const orders = orderProcessing.getOrders();
  const completedOrders = _.filter(orders, { status: 'completed' });

  if (completedOrders.length === 0) return 0;

  const customerSpending = _.chain(completedOrders)
    .groupBy('customerId')
    .map((customerOrders) => _.sumBy(customerOrders, 'totalAmount'))
    .value();

  return _.round(_.meanBy(customerSpending, (s) => s), 0);
}

/**
 * Segment customers into tiers based on spending
 */
function getCustomerSegments(customers) {
  const orders = orderProcessing.getOrders();
  const completedOrders = _.filter(orders, { status: 'completed' });

  const customerData = _.map(customers, (customer) => {
    const customerOrders = _.filter(completedOrders, { customerId: customer.id });
    const totalSpent = _.sumBy(customerOrders, 'totalAmount');

    let tier;
    if (totalSpent >= 10000000) {
      tier = 'Gold';
    } else if (totalSpent >= 1000000) {
      tier = 'Silver';
    } else {
      tier = 'Bronze';
    }

    return { ...customer, totalSpent, tier };
  });

  return _.groupBy(customerData, 'tier');
}

/**
 * Get detailed customer profile with order history
 */
function getCustomerProfile(customerId, customers) {
  const customer = _.find(customers, { id: customerId });
  if (!customer) return null;

  const customerOrders = orderProcessing.getOrdersByCustomer(customerId);
  const completedOrders = _.filter(customerOrders, { status: 'completed' });
  const totalSpent = _.sumBy(completedOrders, 'totalAmount');

  return {
    ...customer,
    orders: customerOrders,
    totalOrders: customerOrders.length,
    completedOrders: completedOrders.length,
    totalSpent,
    totalSpentFormatted: formatCurrency(totalSpent),
  };
}

/**
 * Get order status distribution
 */
function getOrderStatusDistribution() {
  const orders = orderProcessing.getOrders();
  return _.countBy(orders, 'status');
}

/**
 * Get inactive customers (no orders)
 */
function getInactiveCustomers(customers) {
  const orders = orderProcessing.getOrders();
  const activeCustomerIds = _.uniq(_.map(orders, 'customerId'));
  return _.reject(customers, (customer) => _.includes(activeCustomerIds, customer.id));
}

module.exports = {
  getTopCustomers,
  getCustomersByCity,
  getAverageSpending,
  getCustomerSegments,
  getCustomerProfile,
  getOrderStatusDistribution,
  getInactiveCustomers,
};
