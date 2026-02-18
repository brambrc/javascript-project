const _ = require('lodash');

/**
 * Format number as Indonesian Rupiah currency
 */
function formatCurrency(amount) {
  const num = _.toNumber(amount);
  return `Rp ${num.toLocaleString('id-ID')}`;
}

/**
 * Print a formatted section header
 */
function printSection(title) {
  const line = _.repeat('=', 60);
  console.log(`\n${line}`);
  console.log(`  ${_.upperCase(title)}`);
  console.log(line);
}

/**
 * Truncate text to specified length
 */
function truncateText(text, length = 30) {
  return _.truncate(text, { length, omission: '...' });
}

module.exports = { formatCurrency, printSection, truncateText };
