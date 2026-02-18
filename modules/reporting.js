const _ = require('lodash');
const orderProcessing = require('./orderProcessing');
const productManagement = require('./productManagement');
const { formatCurrency } = require('../utils/helpers');

/**
 * Get overall sales summary
 */
function getSalesSummary() {
  const orders = orderProcessing.getOrders();
  const completedOrders = _.filter(orders, { status: 'completed' });

  const totalRevenue = _.sumBy(completedOrders, 'totalAmount');
  const totalOrders = orders.length;
  const completedCount = completedOrders.length;
  const avgOrderValue = completedCount > 0 ? _.round(totalRevenue / completedCount, 0) : 0;

  return {
    totalRevenue,
    totalRevenueFormatted: formatCurrency(totalRevenue),
    totalOrders,
    completedOrders: completedCount,
    cancelledOrders: _.filter(orders, { status: 'cancelled' }).length,
    pendingOrders: _.filter(orders, { status: 'pending' }).length,
    processingOrders: _.filter(orders, { status: 'processing' }).length,
    avgOrderValue,
    avgOrderValueFormatted: formatCurrency(avgOrderValue),
  };
}

/**
 * Get revenue breakdown by product category
 */
function getRevenueByCategory() {
  const orders = orderProcessing.getOrders();
  const completedOrders = _.filter(orders, { status: 'completed' });

  const allItems = _.flatMap(completedOrders, 'items');

  const categoryRevenue = _.chain(allItems)
    .groupBy((item) => {
      const product = productManagement.getProductById(item.productId);
      return product ? product.category : 'Unknown';
    })
    .map((items, category) => ({
      category,
      revenue: _.sumBy(items, (item) => item.price * item.quantity),
      itemsSold: _.sumBy(items, 'quantity'),
    }))
    .orderBy(['revenue'], ['desc'])
    .value();

  return categoryRevenue;
}

/**
 * Get top performing products by sales volume
 */
function getProductPerformance(limit = 5) {
  const orders = orderProcessing.getOrders();
  const completedOrders = _.filter(orders, { status: 'completed' });
  const allItems = _.flatMap(completedOrders, 'items');

  const productSales = _.chain(allItems)
    .groupBy('productId')
    .map((items, productId) => {
      const product = productManagement.getProductById(_.toNumber(productId));
      return {
        productId: _.toNumber(productId),
        name: product ? product.name : 'Unknown',
        totalQuantity: _.sumBy(items, 'quantity'),
        totalRevenue: _.sumBy(items, (item) => item.price * item.quantity),
      };
    })
    .orderBy(['totalRevenue'], ['desc'])
    .take(limit)
    .value();

  return productSales;
}

/**
 * Get inventory report with stock analysis
 */
function getInventoryReport() {
  const products = productManagement.getAllProducts();

  const totalStockValue = _.sumBy(products, (p) => p.price * p.stock);
  const avgPrice = _.round(_.meanBy(products, 'price'), 0);
  const avgStock = _.round(_.meanBy(products, 'stock'), 0);

  const priceDistribution = _.countBy(products, 'priceCategory');
  const stockDistribution = _.countBy(products, 'stockStatus');

  const lowStockProducts = _.filter(products, (p) => p.stock <= 10);

  return {
    totalProducts: products.length,
    totalStockValue,
    totalStockValueFormatted: formatCurrency(totalStockValue),
    avgPrice,
    avgPriceFormatted: formatCurrency(avgPrice),
    avgStock,
    priceDistribution,
    stockDistribution,
    lowStockProducts: _.map(lowStockProducts, (p) => ({
      name: p.name,
      stock: p.stock,
      price: formatCurrency(p.price),
    })),
  };
}

/**
 * Get monthly revenue trend
 */
function getMonthlyTrend() {
  const orders = orderProcessing.getOrders();
  const completedOrders = _.filter(orders, { status: 'completed' });

  const monthlyData = _.chain(completedOrders)
    .groupBy((order) => order.orderDate.substring(0, 7))
    .map((monthOrders, month) => ({
      month,
      revenue: _.sumBy(monthOrders, 'totalAmount'),
      revenueFormatted: formatCurrency(_.sumBy(monthOrders, 'totalAmount')),
      orderCount: monthOrders.length,
    }))
    .sortBy('month')
    .value();

  return monthlyData;
}

/**
 * Generate a complete report combining all analytics
 */
function generateFullReport(customers) {
  return {
    salesSummary: getSalesSummary(),
    revenueByCategory: getRevenueByCategory(),
    topProducts: getProductPerformance(),
    inventory: getInventoryReport(),
    monthlyTrend: getMonthlyTrend(),
  };
}

module.exports = {
  getSalesSummary,
  getRevenueByCategory,
  getProductPerformance,
  getInventoryReport,
  getMonthlyTrend,
  generateFullReport,
};
