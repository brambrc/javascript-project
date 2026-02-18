const assert = require('assert');
const _ = require('lodash');

// Import modules
const { prepareProducts, prepareOrders, prepareCustomers } = require('../modules/dataPreparation');
const productManagement = require('../modules/productManagement');
const orderProcessing = require('../modules/orderProcessing');
const customerAnalytics = require('../modules/customerAnalytics');
const reporting = require('../modules/reporting');
const { formatCurrency, truncateText } = require('../utils/helpers');

// Import raw data
const rawProducts = require('../data/products.json');
const rawOrders = require('../data/orders.json');
const rawCustomers = require('../data/customers.json');

let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`  ✓ ${name}`);
    passed++;
  } catch (err) {
    console.log(`  ✗ ${name}`);
    console.log(`    Error: ${err.message}`);
    failed++;
  }
}

// ============================================================
// Setup
// ============================================================
const cleanProducts = prepareProducts(rawProducts);
const cleanOrders = prepareOrders(rawOrders);
const cleanCustomers = prepareCustomers(rawCustomers);

productManagement.initProducts(cleanProducts);
orderProcessing.initOrders(cleanOrders);

// ============================================================
// Data Preparation Tests
// ============================================================
console.log('\n📦 Data Preparation Tests');

test('should remove duplicate products', () => {
  assert.strictEqual(cleanProducts.length, 12);
});

test('should trim and normalize product names', () => {
  const product = _.find(cleanProducts, { id: 1 });
  assert.strictEqual(product.name, 'Samsung Galaxy S 24 Ultra');
});

test('should normalize category casing', () => {
  const product = _.find(cleanProducts, { id: 1 });
  assert.strictEqual(product.category, 'Electronics');
});

test('should set default brand for null values', () => {
  const product = _.find(cleanProducts, { id: 5 });
  assert.strictEqual(product.brand, 'Unknown');
});

test('should set default rating for null values', () => {
  const product = _.find(cleanProducts, { id: 6 });
  assert.strictEqual(product.rating, 0);
});

test('should add priceCategory feature', () => {
  const premium = _.find(cleanProducts, { id: 1 });
  assert.strictEqual(premium.priceCategory, 'Premium');
  const budget = _.find(cleanProducts, { id: 4 });
  assert.strictEqual(budget.priceCategory, 'Budget');
});

test('should add stockStatus feature', () => {
  const product = _.find(cleanProducts, { id: 3 });
  assert.strictEqual(product.stockStatus, 'Low Stock');
});

test('should add isPopular feature', () => {
  const popular = _.find(cleanProducts, { id: 1 });
  assert.strictEqual(popular.isPopular, true);
  const notPopular = _.find(cleanProducts, { id: 5 });
  assert.strictEqual(notPopular.isPopular, false);
});

test('should prepare orders without data loss', () => {
  assert.strictEqual(cleanOrders.length, 10);
});

test('should clean customer names', () => {
  const customer = _.find(cleanCustomers, { id: 1 });
  assert.strictEqual(customer.name, 'Budi Santoso');
});

test('should normalize customer cities', () => {
  const customer = _.find(cleanCustomers, { id: 1 });
  assert.strictEqual(customer.city, 'Jakarta');
});

test('should set default membership for null values', () => {
  const customer = _.find(cleanCustomers, { id: 4 });
  assert.strictEqual(customer.membershipLevel, 'Bronze');
});

// ============================================================
// Product Management Tests
// ============================================================
console.log('\n🛍️  Product Management Tests');

test('should get all active products', () => {
  const products = productManagement.getAllProducts();
  assert.ok(products.length >= 12);
});

test('should find product by ID', () => {
  const product = productManagement.getProductById(1);
  assert.strictEqual(product.id, 1);
  assert.ok(product.name.includes('Samsung'));
});

test('should add a new product', () => {
  const before = productManagement.getAllProducts().length;
  productManagement.addProduct({
    name: 'Test Product',
    category: 'Test',
    price: 100000,
    stock: 10,
  });
  const after = productManagement.getAllProducts().length;
  assert.strictEqual(after, before + 1);
});

test('should update a product', () => {
  const updated = productManagement.updateProduct(1, { price: 18999000 });
  assert.strictEqual(updated.price, 18999000);
});

test('should soft delete a product', () => {
  const before = productManagement.getAllProducts().length;
  const result = productManagement.deleteProduct(12);
  assert.strictEqual(result, true);
  const after = productManagement.getAllProducts().length;
  assert.strictEqual(after, before - 1);
});

test('should search products by name', () => {
  const results = productManagement.searchProducts('samsung');
  assert.ok(results.length >= 1);
  assert.ok(results[0].name.toLowerCase().includes('samsung'));
});

test('should search products by category', () => {
  const results = productManagement.searchProducts('electronics');
  assert.ok(results.length >= 3);
});

test('should filter products by price range', () => {
  const results = productManagement.filterProducts({ minPrice: 1000000, maxPrice: 5000000 });
  assert.ok(_.every(results, (p) => p.price >= 1000000 && p.price <= 5000000));
});

test('should filter products by category', () => {
  const results = productManagement.filterProducts({ category: 'Beauty' });
  assert.ok(_.every(results, (p) => p.category === 'Beauty'));
});

test('should sort products by price descending', () => {
  const results = productManagement.sortProducts('price', 'desc');
  for (let i = 1; i < results.length; i++) {
    assert.ok(results[i - 1].price >= results[i].price);
  }
});

// ============================================================
// Order Processing Tests
// ============================================================
console.log('\n📋 Order Processing Tests');

test('should get all orders', () => {
  const orders = orderProcessing.getOrders();
  assert.ok(orders.length >= 10);
});

test('should create a new order', () => {
  const before = orderProcessing.getOrders().length;
  const order = orderProcessing.createOrder(2, [
    { productId: 4, quantity: 1 },
  ]);
  assert.ok(order.id);
  assert.strictEqual(order.customerId, 2);
  assert.strictEqual(order.status, 'pending');
  assert.ok(order.totalAmount > 0);
  const after = orderProcessing.getOrders().length;
  assert.strictEqual(after, before + 1);
});

test('should calculate order total correctly', () => {
  const order = orderProcessing.createOrder(3, [
    { productId: 7, quantity: 2 },
  ]);
  const product7 = productManagement.getProductById(7);
  assert.strictEqual(order.totalAmount, product7.price * 2);
});

test('should update order status', () => {
  const orders = orderProcessing.getOrders();
  const pendingOrder = _.find(orders, { status: 'pending' });
  if (pendingOrder) {
    const updated = orderProcessing.updateOrderStatus(pendingOrder.id, 'processing');
    assert.strictEqual(updated.status, 'processing');
  }
});

test('should get orders by customer', () => {
  const orders = orderProcessing.getOrdersByCustomer(1);
  assert.ok(orders.length >= 1);
  assert.ok(_.every(orders, { customerId: 1 }));
});

test('should filter orders by status', () => {
  const completed = orderProcessing.getOrders('completed');
  assert.ok(_.every(completed, { status: 'completed' }));
});

test('should reject invalid status', () => {
  const result = orderProcessing.updateOrderStatus('ORD-001', 'invalid');
  assert.strictEqual(result, null);
});

// ============================================================
// Customer Analytics Tests
// ============================================================
console.log('\n📊 Customer Analytics Tests');

test('should get top customers', () => {
  const top = customerAnalytics.getTopCustomers(cleanCustomers, 3);
  assert.ok(top.length <= 3);
  assert.ok(top.length > 0);
  // Should be sorted by spending descending
  for (let i = 1; i < top.length; i++) {
    assert.ok(top[i - 1].totalSpent >= top[i].totalSpent);
  }
});

test('should group customers by city', () => {
  const byCity = customerAnalytics.getCustomersByCity(cleanCustomers);
  assert.ok(Object.keys(byCity).length > 0);
  assert.ok(byCity['Jakarta']);
});

test('should calculate average spending', () => {
  const avg = customerAnalytics.getAverageSpending(cleanCustomers);
  assert.ok(avg > 0);
  assert.ok(typeof avg === 'number');
});

test('should segment customers into tiers', () => {
  const segments = customerAnalytics.getCustomerSegments(cleanCustomers);
  const allTiers = Object.keys(segments);
  assert.ok(allTiers.length > 0);
});

test('should get customer profile', () => {
  const profile = customerAnalytics.getCustomerProfile(1, cleanCustomers);
  assert.ok(profile);
  assert.strictEqual(profile.name, 'Budi Santoso');
  assert.ok(profile.totalOrders > 0);
  assert.ok(profile.totalSpent >= 0);
});

test('should return null for non-existent customer profile', () => {
  const profile = customerAnalytics.getCustomerProfile(999, cleanCustomers);
  assert.strictEqual(profile, null);
});

test('should get order status distribution', () => {
  const dist = customerAnalytics.getOrderStatusDistribution();
  assert.ok(Object.keys(dist).length > 0);
  const total = Object.values(dist).reduce((a, b) => a + b, 0);
  assert.strictEqual(total, orderProcessing.getOrders().length);
});

// ============================================================
// Reporting Tests
// ============================================================
console.log('\n📈 Reporting Tests');

test('should generate sales summary', () => {
  const summary = reporting.getSalesSummary();
  assert.ok(summary.totalRevenue > 0);
  assert.ok(summary.totalOrders > 0);
  assert.ok(summary.avgOrderValue > 0);
  assert.ok(summary.totalRevenueFormatted.startsWith('Rp'));
});

test('should get revenue by category', () => {
  const byCategory = reporting.getRevenueByCategory();
  assert.ok(byCategory.length > 0);
  assert.ok(byCategory[0].category);
  assert.ok(byCategory[0].revenue > 0);
});

test('should get product performance', () => {
  const performance = reporting.getProductPerformance(3);
  assert.ok(performance.length <= 3);
  assert.ok(performance.length > 0);
  assert.ok(performance[0].totalRevenue >= performance[performance.length - 1].totalRevenue);
});

test('should generate inventory report', () => {
  const inventory = reporting.getInventoryReport();
  assert.ok(inventory.totalProducts > 0);
  assert.ok(inventory.totalStockValue > 0);
  assert.ok(inventory.priceDistribution);
  assert.ok(inventory.stockDistribution);
});

test('should get monthly trend', () => {
  const trend = reporting.getMonthlyTrend();
  assert.ok(trend.length > 0);
  assert.ok(trend[0].month);
  assert.ok(trend[0].revenue > 0);
});

test('should generate full report', () => {
  const report = reporting.generateFullReport(cleanCustomers);
  assert.ok(report.salesSummary);
  assert.ok(report.revenueByCategory);
  assert.ok(report.topProducts);
  assert.ok(report.inventory);
  assert.ok(report.monthlyTrend);
});

// ============================================================
// Utility Tests
// ============================================================
console.log('\n🔧 Utility Tests');

test('should format currency correctly', () => {
  const result = formatCurrency(1500000);
  assert.ok(result.includes('Rp'));
  assert.ok(result.includes('1'));
});

test('should truncate text', () => {
  const result = truncateText('This is a very long text that should be truncated', 20);
  assert.ok(result.length <= 20);
  assert.ok(result.endsWith('...'));
});

// ============================================================
// Results
// ============================================================
console.log(`\n${'='.repeat(60)}`);
console.log(`  Test Results: ${passed} passed, ${failed} failed, ${passed + failed} total`);
console.log(`${'='.repeat(60)}\n`);

if (failed > 0) {
  process.exit(1);
}
