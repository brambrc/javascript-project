const _ = require('lodash');

/**
 * Prepare and clean product data
 */
function prepareProducts(rawProducts) {
  console.log(`\n  Raw products count: ${rawProducts.length}`);

  // 1. Clean and normalize each product first
  let products = _.map(rawProducts, (product) => {
    return {
      ...product,
      name: _.startCase(_.toLower(_.trim(product.name))),
      category: _.startCase(_.toLower(_.trim(product.category))),
      brand: _.defaultTo(product.brand, 'Unknown'),
      rating: _.defaultTo(product.rating, 0),
      price: _.toNumber(product.price),
      stock: _.toNumber(product.stock),
    };
  });

  // 2. Remove duplicates by normalized name
  products = _.uniqBy(products, 'name');
  console.log(`  After deduplication: ${products.length}`);

  // 3. Add computed features
  products = _.map(products, (product) => {
    const priceCategory =
      product.price >= 10000000
        ? 'Premium'
        : product.price >= 1000000
          ? 'Mid-Range'
          : 'Budget';

    const stockStatus =
      product.stock <= 10
        ? 'Low Stock'
        : product.stock <= 50
          ? 'In Stock'
          : 'Abundant';

    const isPopular = product.rating >= 4.5;

    return _.defaults({ priceCategory, stockStatus, isPopular }, product);
  });

  // 4. Validate - filter out products with invalid data
  products = _.filter(products, (p) => p.price > 0 && p.stock >= 0 && p.name.length > 0);
  console.log(`  After validation: ${products.length} products ready`);

  return products;
}

/**
 * Prepare and clean order data
 */
function prepareOrders(rawOrders) {
  console.log(`\n  Raw orders count: ${rawOrders.length}`);

  let orders = _.uniqBy(rawOrders, 'id');

  // Validate order structure
  orders = _.filter(orders, (order) => {
    return order.id && order.customerId && order.items && order.items.length > 0;
  });

  console.log(`  After validation: ${orders.length} orders ready`);
  return _.cloneDeep(orders);
}

/**
 * Prepare and clean customer data
 */
function prepareCustomers(rawCustomers) {
  console.log(`\n  Raw customers count: ${rawCustomers.length}`);

  let customers = _.uniqBy(rawCustomers, 'id');

  customers = _.map(customers, (customer) => {
    return {
      ...customer,
      name: _.trim(customer.name),
      city: _.startCase(_.toLower(_.trim(customer.city))),
      membershipLevel: _.defaultTo(customer.membershipLevel, 'Bronze'),
    };
  });

  console.log(`  After cleaning: ${customers.length} customers ready`);
  return customers;
}

module.exports = { prepareProducts, prepareOrders, prepareCustomers };
