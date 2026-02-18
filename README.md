# E-Commerce Data Management System

A JavaScript-based e-commerce data management system built with Lodash for a bootcamp assignment. This project demonstrates data cleaning, product management (CRUD), order processing, customer analytics, and business reporting.

## Installation

```bash
cd ecommerce-data-management
npm install
```

## Usage

```bash
# Run the full demo
npm start

# Run tests
npm test
```

## Project Structure

```
ecommerce-data-management/
├── package.json
├── README.md
├── main.js                        # Entry point - demonstrates all modules
├── data/
│   ├── products.json              # 13 sample products (with data issues for cleaning demo)
│   ├── orders.json                # 10 sample orders
│   └── customers.json             # 6 sample customers
├── modules/
│   ├── dataPreparation.js         # Data cleaning & feature engineering
│   ├── productManagement.js       # CRUD + Search/Filter/Sort
│   ├── orderProcessing.js         # Order creation, totals, stock updates
│   ├── customerAnalytics.js       # Customer insights & segmentation
│   └── reporting.js               # Aggregation & statistics
├── utils/
│   └── helpers.js                 # Shared formatting utilities
└── tests/
    └── test.js                    # Test runner for all modules
```

## Modules

### 1. Data Preparation (`modules/dataPreparation.js`)
Cleans and normalizes raw data before use:
- Removes duplicates using `_.uniqBy()`
- Handles missing/null values with `_.defaultTo()` and `_.defaults()`
- Normalizes text formatting with `_.trim()`, `_.startCase()`, `_.toLower()`
- Adds computed features: `priceCategory`, `stockStatus`, `isPopular`
- Validates data integrity with `_.filter()`

### 2. Product Management (`modules/productManagement.js`)
Full CRUD operations with search and filtering:
- **Create**: `addProduct()` - Add new products with auto-generated IDs
- **Read**: `getAllProducts()`, `getProductById()` - Retrieve product data
- **Update**: `updateProduct()` - Modify product attributes
- **Delete**: `deleteProduct()` - Soft delete (marks as deleted)
- **Search**: `searchProducts()` - Search by name or category
- **Filter**: `filterProducts()` - Filter by price range, category, rating
- **Sort**: `sortProducts()` - Sort by any field with `_.orderBy()`

### 3. Order Processing (`modules/orderProcessing.js`)
Handles order lifecycle management:
- `createOrder()` - Creates orders with auto-calculated totals and stock updates
- `updateOrderStatus()` - Manages status transitions (pending → processing → completed)
- `getOrders()` - Retrieve orders with optional status filtering
- `getOrdersByCustomer()` - Get order history for a specific customer
- Stock restoration on order cancellation

### 4. Customer Analytics (`modules/customerAnalytics.js`)
Provides customer insights and segmentation:
- `getTopCustomers()` - Ranking by total spending using `_.chain()`
- `getCustomersByCity()` - Geographic grouping with `_.groupBy()`
- `getAverageSpending()` - Average spend calculation with `_.meanBy()`
- `getCustomerSegments()` - Gold/Silver/Bronze tier segmentation
- `getCustomerProfile()` - Detailed customer profile with order history
- `getOrderStatusDistribution()` - Status breakdown with `_.countBy()`
- `getInactiveCustomers()` - Customers with no orders using `_.reject()`

### 5. Reporting (`modules/reporting.js`)
Business intelligence and analytics:
- `getSalesSummary()` - Revenue, order counts, and averages
- `getRevenueByCategory()` - Category revenue using `_.flatMap()` and `_.groupBy()`
- `getProductPerformance()` - Top selling products by revenue
- `getInventoryReport()` - Stock analysis with price/stock distributions
- `getMonthlyTrend()` - Monthly revenue trend analysis
- `generateFullReport()` - Combined business dashboard

## Lodash Functions Used (30 distinct)

| # | Function | Module(s) | Purpose |
|---|----------|-----------|---------|
| 1 | `_.uniqBy` | dataPreparation | Remove duplicate entries |
| 2 | `_.map` | dataPreparation, customerAnalytics, reporting | Transform arrays |
| 3 | `_.defaultTo` | dataPreparation, productManagement | Handle null/undefined values |
| 4 | `_.defaults` | dataPreparation | Merge default values into objects |
| 5 | `_.filter` | dataPreparation, productManagement, orderProcessing, reporting | Filter arrays by criteria |
| 6 | `_.trim` | dataPreparation, productManagement | Remove whitespace |
| 7 | `_.startCase` | dataPreparation, productManagement | Convert to Title Case |
| 8 | `_.toLower` | dataPreparation, productManagement | Convert to lowercase |
| 9 | `_.find` | productManagement, customerAnalytics | Find single matching element |
| 10 | `_.findIndex` | productManagement, orderProcessing | Find index of matching element |
| 11 | `_.cloneDeep` | productManagement, orderProcessing | Deep clone objects |
| 12 | `_.includes` | productManagement, orderProcessing, customerAnalytics | Check if value exists in collection |
| 13 | `_.orderBy` | productManagement, customerAnalytics, reporting | Sort with multiple criteria |
| 14 | `_.sortBy` | main, reporting | Simple sort by property |
| 15 | `_.forEach` | orderProcessing | Iterate over collections |
| 16 | `_.sumBy` | orderProcessing, customerAnalytics, reporting | Sum numeric values |
| 17 | `_.chain` | customerAnalytics, reporting | Method chaining |
| 18 | `_.take` | customerAnalytics, reporting | Get first N elements |
| 19 | `_.groupBy` | customerAnalytics, reporting | Group by property |
| 20 | `_.countBy` | customerAnalytics, reporting | Count by property |
| 21 | `_.meanBy` | customerAnalytics, reporting | Calculate average |
| 22 | `_.flatMap` | reporting | Flatten mapped arrays |
| 23 | `_.round` | customerAnalytics, reporting | Round numbers |
| 24 | `_.repeat` | helpers | Repeat strings |
| 25 | `_.reject` | customerAnalytics | Filter out matching elements |
| 26 | `_.uniq` | customerAnalytics | Get unique values |
| 27 | `_.truncate` | helpers | Truncate long strings |
| 28 | `_.upperCase` | helpers | Convert to UPPER CASE |
| 29 | `_.toNumber` | helpers, dataPreparation, reporting | Convert to number |
| 30 | `_.every` | main | Check if all elements match |

## Sample Data

The sample data includes intentional data quality issues to demonstrate data cleaning:
- **Products**: Inconsistent casing (ELECTRONICS, electronics, Electronics), whitespace in names, null brands/ratings, one duplicate entry
- **Orders**: Various statuses across different dates
- **Customers**: Inconsistent city casing, whitespace in names, null membership levels
