const _ = require('lodash');
const productManagement = require('./productManagement');

let orders = [];

/**
 * Initialize order processing with prepared data
 */
function initOrders(preparedOrders) {
  orders = _.cloneDeep(preparedOrders);
}

/**
 * Create a new order
 */
function createOrder(customerId, items) {
  // Calculate item totals
  const itemsWithTotals = _.map(items, (item) => {
    const product = productManagement.getProductById(item.productId);
    const price = product ? product.price : item.price;
    return {
      productId: item.productId,
      quantity: item.quantity,
      price: price,
    };
  });

  const totalAmount = _.sumBy(itemsWithTotals, (item) => item.price * item.quantity);

  const newOrder = {
    id: `ORD-${String(orders.length + 1).padStart(3, '0')}`,
    customerId,
    items: itemsWithTotals,
    totalAmount,
    status: 'pending',
    orderDate: new Date().toISOString().split('T')[0],
  };

  // Update stock for each item
  _.forEach(itemsWithTotals, (item) => {
    productManagement.updateStock(item.productId, -item.quantity);
  });

  orders.push(newOrder);
  return newOrder;
}

/**
 * Update order status
 */
function updateOrderStatus(orderId, newStatus) {
  const validStatuses = ['pending', 'processing', 'completed', 'cancelled'];
  if (!_.includes(validStatuses, newStatus)) return null;

  const index = _.findIndex(orders, { id: orderId });
  if (index === -1) return null;

  const oldStatus = orders[index].status;
  orders[index].status = newStatus;

  // Restore stock if order is cancelled
  if (newStatus === 'cancelled' && oldStatus !== 'cancelled') {
    _.forEach(orders[index].items, (item) => {
      productManagement.updateStock(item.productId, item.quantity);
    });
  }

  return orders[index];
}

/**
 * Get all orders
 */
function getOrders(status) {
  if (status) {
    return _.filter(orders, { status });
  }
  return _.cloneDeep(orders);
}

/**
 * Get orders by customer ID
 */
function getOrdersByCustomer(customerId) {
  return _.filter(orders, { customerId });
}

/**
 * Get order by ID
 */
function getOrderById(orderId) {
  return _.find(orders, { id: orderId });
}

module.exports = {
  initOrders,
  createOrder,
  updateOrderStatus,
  getOrders,
  getOrdersByCustomer,
  getOrderById,
};
