const express = require('express');
const { createSeedProducts, seedOrders } = require('./data');
const { ObjectId } = require('mongodb');
const { withProductsCollection } = require('./database');

const router = express.Router();

router.get('/', (_request, response) => {
  response.send('Express server is running');
});

router.get('/api/products', async (request, response) => {
  try {
    const result = await withProductsCollection(async (collection) => {
      const limit = Math.min(100, Math.max(1, Number(request.query.limit) || 10));
      const offset = Math.max(0, Number(request.query.offset) || 0);
      const cursor = request.query.cursor ? String(request.query.cursor) : null;
      const paginationMode = String(request.query.pagination || 'offset').toLowerCase();
      const useCursor = paginationMode === 'cursor';

      if (useCursor) {
        let cursorFilter = {};

        if (cursor) {
          try {
            cursorFilter = { _id: { $gt: new ObjectId(cursor) } };
          } catch (error) {
            return {
              products: [],
              total: 0,
              pagination: {
                mode: 'cursor',
                limit,
                cursor,
                error: 'Invalid cursor'
              }
            };
          }
        }

        const [products, total] = await Promise.all([
          collection.find(cursorFilter).sort({ _id: 1 }).limit(limit).toArray(),
          collection.countDocuments({})
        ]);

        const nextCursor = products.length
          ? products[products.length - 1]._id.toString()
          : null;

        return {
          products,
          total,
          pagination: {
            mode: 'cursor',
            limit,
            cursor,
            nextCursor,
            hasMore: Boolean(nextCursor)
          }
        };
      }

      const [products, total] = await Promise.all([
        collection.find({}).skip(offset).limit(limit).toArray(),
        collection.countDocuments({})
      ]);

      return {
        products,
        total,
        pagination: {
          mode: 'offset',
          offset,
          limit,
          nextOffset: offset + products.length
        }
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
  try {
    const products = await withProductsCollection((collection) => (
      collection.find({}).toArray()
    ));

    response.json(products);
  } catch (error) {
    console.error('Unable to load unsafe products from MongoDB Atlas:', error.message);
    response.status(500).json({ error: 'Unable to load unsafe products' });
  }
});

router.use((_request, response) => {
  response.status(404).json({ error: 'Not found' });
});

module.exports = router;
