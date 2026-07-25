const express = require('express');
const { createSeedProducts, seedOrders } = require('./data');
const { withProductsCollection } = require('./database');

const router = express.Router();

router.get('/', (_request, response) => {
  response.send('Express server is running');
});

router.get('/api/products', async (_request, response) => {
  try {
    const result = await withProductsCollection(async (collection) => {
      const products = await collection.find({}).toArray();
      const total = await collection.countDocuments();

      return { products, total };
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
