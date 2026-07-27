const { searchProductsByName } = require('../repositories/productRepository');

function formatProduct(product) {
  return {
    ...product,
    formattedPrice: `₹${product.price}`,
    inStock: typeof product.stock === 'number' ? product.stock > 0 : Boolean(product.inStock)
  };
}

async function searchProducts(searchName) {
  const trimmedName = searchName?.trim();

  if (!trimmedName) {
    const error = new Error('Search name is required');
    error.statusCode = 400;
    throw error;
  }

  const products = await searchProductsByName(trimmedName);
  const formattedProducts = products.map(formatProduct);

  return {
    total: formattedProducts.length,
    search: trimmedName,
    products: formattedProducts
  };
}

module.exports = { searchProducts };
