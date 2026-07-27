const express = require('express');
const { createSeedProducts, seedOrders } = require('./data');
const { ObjectId } = require('mongodb');
const { withProductsCollection } = require('./database');

const router = express.Router();

router.get('/', (_request, response) => {
  response.send('Express server is running');
});

router.get('/api/search/:name', async (request, response) => {
  const searchName = request.params.name?.trim();

  if (!searchName) {
    return response.status(400).json({
      message: 'Search name is required'
    });
  }

  try {
    const result = await withProductsCollection(async (collection) => {
      const escapedName = searchName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

      const products = await collection.find({
        name: {
          $regex: escapedName,
          $options: 'i'
        }
      }).toArray();

      const formattedProducts = products.map((product) => ({
        ...product,
        formattedPrice: `₹${product.price}`,
        inStock: typeof product.stock === 'number' ? product.stock > 0 : Boolean(product.inStock)
      }));

      return {
        total: formattedProducts.length,
        search: searchName,
        products: formattedProducts
      };
    });

    return response.status(200).json(result);
  } catch (error) {
    console.error('Search API Error:', error);

    return response.status(500).json({
      message: 'Unable to search products'
    });
  }
});

router.get('/api/products', async (request, response) => {
  try {
    const page = Number(request.query.page) || 1;
    const limit = Number(request.query.limit) || 10;
    const category = request.query.category || '';
    const sortBy = request.query.sortBy || 'name';
    const sortOrder = request.query.sortOrder === 'desc' ? -1 : 1;

    const result = await withProductsCollection(async (collection) => {
      const products = await collection.find({}).toArray();
      const total = await collection.countDocuments();

      let filteredProducts = products;
      if (category) {
        filteredProducts = products.filter((product) => product.category === category);
      }

      let sortedProducts = filteredProducts;
      if (sortBy) {
        sortedProducts = filteredProducts.sort((a, b) => {
          if (a[sortBy] < b[sortBy]) return -1 * sortOrder;
          if (a[sortBy] > b[sortBy]) return 1 * sortOrder;
          return 0;
        });
      }

      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const pagedProducts = sortedProducts.slice(startIndex, endIndex);

      return {
        products: pagedProducts,
        total,
        page,
        limit,
        category,
        sortBy,
        sortOrder,
        message: 'This route mixes too many concerns in one place'
      };
    });

    response.json(result);
  } catch (error) {
    console.error('Unable to load products from MongoDB Atlas:', error.message);
    response.status(500).json({ error: 'Unable to load products' });
  }
});

router.get('/api/orders', (_request, response) => {
  response.json(seedOrders);
});

router.get('/api/unsafe-products', async (_request, response) => {
  const products = await withProductsCollection((collection) => (
    collection.find({}).toArray()
  ));

  response.json(products);
});

router.use((_request, response) => {
  response.status(404).json({ error: 'Not found' });
});

module.exports = router;
