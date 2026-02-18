const _ = require('lodash');
const { printSection, formatCurrency, truncateText } = require('./utils/helpers');

// Import data
const rawProducts = require('./data/products.json');
const rawOrders = require('./data/orders.json');
const rawCustomers = require('./data/customers.json');

// Import modules
const { prepareProducts, prepareOrders, prepareCustomers } = require('./modules/dataPreparation');
const productManagement = require('./modules/productManagement');
const orderProcessing = require('./modules/orderProcessing');
const customerAnalytics = require('./modules/customerAnalytics');
const reporting = require('./modules/reporting');

// ============================================================
// 1. DATA PREPARATION
// ============================================================
printSection('Data Preparation');

console.log('\n--- Preparing Products ---');
const cleanProducts = prepareProducts(rawProducts);

console.log('\n--- Preparing Orders ---');
const cleanOrders = prepareOrders(rawOrders);

console.log('\n--- Preparing Customers ---');
const cleanCustomers = prepareCustomers(rawCustomers);

// Initialize modules with clean data
productManagement.initProducts(cleanProducts);
orderProcessing.initOrders(cleanOrders);

// ============================================================
// 2. PRODUCT MANAGEMENT
// ============================================================
printSection('Product Management');

// Display all products
console.log('\n--- All Products ---');
const allProducts = productManagement.getAllProducts();
allProducts.forEach((p) => {
  console.log(`  [${p.id}] ${p.name} | ${p.category} | ${formatCurrency(p.price)} | Stock: ${p.stock} | Rating: ${p.rating}`);
});

// Add a new product
console.log('\n--- Adding New Product ---');
const newProduct = productManagement.addProduct({
  name: '  xiaomi redmi note 13  ',
  category: 'ELECTRONICS',
  price: 2499000,
  stock: 40,
  brand: 'Xiaomi',
  rating: 4.4,
  description: 'Mid-range smartphone with great camera',
});
console.log(`  Added: [${newProduct.id}] ${newProduct.name} - ${formatCurrency(newProduct.price)}`);

// Update a product
console.log('\n--- Updating Product ---');
const updated = productManagement.updateProduct(4, { price: 49000, stock: 180 });
console.log(`  Updated: ${updated.name} -> New price: ${formatCurrency(updated.price)}, Stock: ${updated.stock}`);

// Delete a product (soft)
console.log('\n--- Soft Deleting Product ---');
const deleted = productManagement.deleteProduct(12);
console.log(`  Deleted product ID 12: ${deleted}`);
console.log(`  Active products count: ${productManagement.getAllProducts().length}`);

// Search products
console.log('\n--- Search: "samsung" ---');
const searchResults = productManagement.searchProducts('samsung');
searchResults.forEach((p) => {
  console.log(`  [${p.id}] ${p.name} - ${formatCurrency(p.price)}`);
});

// Filter products
console.log('\n--- Filter: Electronics, Min Rating 4.5 ---');
const filtered = productManagement.filterProducts({ category: 'Electronics', minRating: 4.5 });
filtered.forEach((p) => {
  console.log(`  [${p.id}] ${p.name} | Rating: ${p.rating} | ${formatCurrency(p.price)}`);
});

// Sort products
console.log('\n--- Sort by Price (Descending) ---');
const sorted = productManagement.sortProducts('price', 'desc');
sorted.slice(0, 5).forEach((p) => {
  console.log(`  [${p.id}] ${p.name} - ${formatCurrency(p.price)}`);
});

// ============================================================
// 3. ORDER PROCESSING
// ============================================================
printSection('Order Processing');

// Display existing orders
console.log('\n--- Existing Orders ---');
const existingOrders = orderProcessing.getOrders();
existingOrders.forEach((o) => {
  console.log(`  ${o.id} | Customer: ${o.customerId} | ${formatCurrency(o.totalAmount)} | Status: ${o.status} | Date: ${o.orderDate}`);
});

// Create a new order
console.log('\n--- Creating New Order ---');
const newOrder = orderProcessing.createOrder(1, [
  { productId: 2, quantity: 2 },
  { productId: 9, quantity: 1 },
]);
console.log(`  New Order: ${newOrder.id} | Total: ${formatCurrency(newOrder.totalAmount)} | Status: ${newOrder.status}`);
newOrder.items.forEach((item) => {
  console.log(`    - Product ${item.productId}: ${item.quantity}x @ ${formatCurrency(item.price)}`);
});

// Update order status
console.log('\n--- Updating Order Status ---');
const updatedOrder = orderProcessing.updateOrderStatus('ORD-004', 'completed');
console.log(`  ${updatedOrder.id}: ${updatedOrder.status}`);

// Cancel an order (stock restored)
console.log('\n--- Cancelling Order ---');
const cancelledOrder = orderProcessing.updateOrderStatus('ORD-006', 'cancelled');
console.log(`  ${cancelledOrder.id}: ${cancelledOrder.status} (stock restored)`);

// Orders by customer
console.log('\n--- Orders for Customer 1 ---');
const customerOrders = orderProcessing.getOrdersByCustomer(1);
customerOrders.forEach((o) => {
  console.log(`  ${o.id} | ${formatCurrency(o.totalAmount)} | ${o.status}`);
});

// ============================================================
// 4. CUSTOMER ANALYTICS
// ============================================================
printSection('Customer Analytics');

// Top customers
console.log('\n--- Top Customers by Spending ---');
const topCustomers = customerAnalytics.getTopCustomers(cleanCustomers);
topCustomers.forEach((c, i) => {
  console.log(`  ${i + 1}. ${c.name} - ${formatCurrency(c.totalSpent)} (${c.orderCount} orders)`);
});

// Customers by city
console.log('\n--- Customers by City ---');
const byCity = customerAnalytics.getCustomersByCity(cleanCustomers);
Object.entries(byCity).forEach(([city, customers]) => {
  console.log(`  ${city}: ${customers.map((c) => c.name).join(', ')}`);
});

// Average spending
console.log('\n--- Average Spending ---');
const avgSpending = customerAnalytics.getAverageSpending(cleanCustomers);
console.log(`  Average spending per customer: ${formatCurrency(avgSpending)}`);

// Customer segments
console.log('\n--- Customer Segments ---');
const segments = customerAnalytics.getCustomerSegments(cleanCustomers);
Object.entries(segments).forEach(([tier, customers]) => {
  console.log(`  ${tier}: ${customers.map((c) => `${c.name} (${formatCurrency(c.totalSpent)})`).join(', ')}`);
});

// Customer profile
console.log('\n--- Customer Profile: Budi Santoso ---');
const profile = customerAnalytics.getCustomerProfile(1, cleanCustomers);
if (profile) {
  console.log(`  Name: ${profile.name}`);
  console.log(`  City: ${profile.city}`);
  console.log(`  Membership: ${profile.membershipLevel}`);
  console.log(`  Total Orders: ${profile.totalOrders}`);
  console.log(`  Completed Orders: ${profile.completedOrders}`);
  console.log(`  Total Spent: ${profile.totalSpentFormatted}`);
}

// Order status distribution
console.log('\n--- Order Status Distribution ---');
const statusDist = customerAnalytics.getOrderStatusDistribution();
Object.entries(statusDist).forEach(([status, count]) => {
  console.log(`  ${status}: ${count}`);
});

// Inactive customers
console.log('\n--- Inactive Customers ---');
const inactive = customerAnalytics.getInactiveCustomers(cleanCustomers);
if (inactive.length === 0) {
  console.log('  All customers have placed orders!');
} else {
  inactive.forEach((c) => console.log(`  ${c.name} (${c.city})`));
}

// ============================================================
// 5. REPORTING
// ============================================================
printSection('Reporting Dashboard');

// Sales summary
console.log('\n--- Sales Summary ---');
const sales = reporting.getSalesSummary();
console.log(`  Total Revenue: ${sales.totalRevenueFormatted}`);
console.log(`  Total Orders: ${sales.totalOrders}`);
console.log(`  Completed: ${sales.completedOrders} | Pending: ${sales.pendingOrders} | Processing: ${sales.processingOrders} | Cancelled: ${sales.cancelledOrders}`);
console.log(`  Average Order Value: ${sales.avgOrderValueFormatted}`);

// Revenue by category
console.log('\n--- Revenue by Category ---');
const categoryRevenue = reporting.getRevenueByCategory();
categoryRevenue.forEach((c) => {
  console.log(`  ${c.category}: ${formatCurrency(c.revenue)} (${c.itemsSold} items sold)`);
});

// Top products
console.log('\n--- Top Performing Products ---');
const topProducts = reporting.getProductPerformance();
topProducts.forEach((p, i) => {
  console.log(`  ${i + 1}. ${p.name} - ${p.totalQuantity} sold - ${formatCurrency(p.totalRevenue)}`);
});

// Inventory report
console.log('\n--- Inventory Report ---');
const inventory = reporting.getInventoryReport();
console.log(`  Total Products: ${inventory.totalProducts}`);
console.log(`  Total Stock Value: ${inventory.totalStockValueFormatted}`);
console.log(`  Avg Price: ${inventory.avgPriceFormatted} | Avg Stock: ${inventory.avgStock}`);
console.log(`  Price Distribution: ${JSON.stringify(inventory.priceDistribution)}`);
console.log(`  Stock Distribution: ${JSON.stringify(inventory.stockDistribution)}`);
if (inventory.lowStockProducts.length > 0) {
  console.log(`  Low Stock Alert:`);
  inventory.lowStockProducts.forEach((p) => {
    console.log(`    - ${p.name}: ${p.stock} units (${p.price})`);
  });
}

// Monthly trend
console.log('\n--- Monthly Revenue Trend ---');
const monthly = reporting.getMonthlyTrend();
monthly.forEach((m) => {
  console.log(`  ${m.month}: ${m.revenueFormatted} (${m.orderCount} orders)`);
});

// Full report summary
console.log('\n--- Full Report Generated ---');
const fullReport = reporting.generateFullReport(cleanCustomers);
console.log(`  Report sections: ${Object.keys(fullReport).join(', ')}`);

// ============================================================
// DEMO: Lodash utility showcase
// ============================================================
printSection('Lodash Utility Showcase');

console.log('\n--- _.truncate demo ---');
const longText = 'This is a very long product description that needs to be truncated for display';
console.log(`  Original: ${longText}`);
console.log(`  Truncated: ${truncateText(longText, 40)}`);

console.log('\n--- _.every demo ---');
const allInStock = _.every(productManagement.getAllProducts(), (p) => p.stock > 0);
console.log(`  All products in stock: ${allInStock}`);

console.log('\n--- _.sortBy demo ---');
const sortedByName = _.sortBy(productManagement.getAllProducts(), 'name');
console.log(`  Products sorted alphabetically: ${sortedByName.slice(0, 3).map((p) => p.name).join(', ')}...`);

printSection('Demo Complete');
console.log('\n  All modules executed successfully!\n');
