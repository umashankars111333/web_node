const { searchProducts } = require('../services/productService');

async function searchProductsController(request, response) {
  try {
    const result = await searchProducts(request.params.name);
    return response.status(200).json(result);
  } catch (error) {
    if (error.statusCode === 400) {
      return response.status(400).json({
        message: error.message
      });
    }

    console.error('Search API Error:', error);

    return response.status(500).json({
      message: 'Unable to search products'
    });
  }
}

module.exports = { searchProductsController };
