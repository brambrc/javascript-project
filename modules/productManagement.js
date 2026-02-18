const _ = require('lodash');
const { formatCurrency } = require('../utils/helpers');

let products = [];

/**
 * Initialize product management with prepared data
 */
function initProducts(preparedProducts) {
  products = _.cloneDeep(preparedProducts);
}

/**
 * Get all active products
 */
function getAllProducts() {
  return _.filter(products, (p) => !p.deleted);
}

/**
 * Get product by ID
 */
function getProductById(id) {
  return _.find(products, { id, deleted: undefined }) || _.find(products, (p) => p.id === id && !p.deleted);
}

/**
 * Add a new product
 */
function addProduct(productData) {
  const maxId = _.maxBy(products, 'id')?.id || 0;
  const newProduct = {
    id: maxId + 1,
    name: _.startCase(_.toLower(_.trim(productData.name))),
    category: _.startCase(_.toLower(_.trim(productData.category))),
    brand: _.defaultTo(productData.brand, 'Unknown'),
    rating: _.defaultTo(productData.rating, 0),
    price: _.toNumber(productData.price),
    stock: _.toNumber(productData.stock),
    description: productData.description || '',
    priceCategory:
      productData.price >= 10000000
        ? 'Premium'
        : productData.price >= 1000000
          ? 'Mid-Range'
          : 'Budget',
    stockStatus:
      productData.stock <= 10
        ? 'Low Stock'
        : productData.stock <= 50
          ? 'In Stock'
          : 'Abundant',
    isPopular: (productData.rating || 0) >= 4.5,
  };

  products.push(newProduct);
  return newProduct;
}

/**
 * Update an existing product
 */
function updateProduct(id, updates) {
  const index = _.findIndex(products, (p) => p.id === id && !p.deleted);
  if (index === -1) return null;

  products[index] = { ...products[index], ...updates };
  return products[index];
}

/**
 * Soft delete a product
 */
function deleteProduct(id) {
  const index = _.findIndex(products, (p) => p.id === id && !p.deleted);
  if (index === -1) return false;

  products[index].deleted = true;
  return true;
}

/**
 * Search products by name or category
 */
function searchProducts(query) {
  const lowerQuery = _.toLower(_.trim(query));
  return _.filter(getAllProducts(), (product) => {
    return (
      _.includes(_.toLower(product.name), lowerQuery) ||
      _.includes(_.toLower(product.category), lowerQuery)
    );
  });
}

/**
 * Filter products by criteria
 */
function filterProducts({ minPrice, maxPrice, category, minRating } = {}) {
  return _.filter(getAllProducts(), (product) => {
    if (minPrice && product.price < minPrice) return false;
    if (maxPrice && product.price > maxPrice) return false;
    if (category && _.toLower(product.category) !== _.toLower(category)) return false;
    if (minRating && product.rating < minRating) return false;
    return true;
  });
}

/**
 * Sort products by a given field
 */
function sortProducts(field = 'price', order = 'asc') {
  return _.orderBy(getAllProducts(), [field], [order]);
}

/**
 * Update stock for a product
 */
function updateStock(productId, quantityChange) {
  const index = _.findIndex(products, (p) => p.id === productId && !p.deleted);
  if (index === -1) return false;

  products[index].stock += quantityChange;
  if (products[index].stock < 0) products[index].stock = 0;
  return true;
}

/**
 * Get current products array reference (for other modules)
 */
function getProducts() {
  return products;
}

module.exports = {
  initProducts,
  getAllProducts,
  getProductById,
  addProduct,
  updateProduct,
  deleteProduct,
  searchProducts,
  filterProducts,
  sortProducts,
  updateStock,
  getProducts,
};
