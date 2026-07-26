const express = require('express');
const { ObjectId } = require('mongodb');
const { seedOrders } = require('./data');
const { withProductsCollection } = require('./database');

const router = express.Router();
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

function getCursorPagination(query) {
  const parsedLimit = Number.parseInt(query.limit, 10);
  const limit = Number.isNaN(parsedLimit)
    ? DEFAULT_LIMIT
    : Math.min(Math.max(parsedLimit, 1), MAX_LIMIT);

  if (query.cursor && !ObjectId.isValid(query.cursor)) {
    const error = new Error('cursor must be a valid MongoDB ObjectId');
    error.statusCode = 400;
    throw error;
  }

  return {
    limit,
    cursor: query.cursor ? new ObjectId(query.cursor) : null,
  };
}

function getOffsetPagination(query) {
  const parsedOffset = Number.parseInt(query.offset, 10);
  const parsedLimit = Number.parseInt(query.limit, 10);
  const offset = Number.isNaN(parsedOffset) ? 0 : Math.max(parsedOffset, 0);
  const limit = Number.isNaN(parsedLimit)
    ? DEFAULT_LIMIT
    : Math.min(Math.max(parsedLimit, 1), MAX_LIMIT);

  return { offset, limit };
}

router.get('/', (_request, response) => {
  response.send('Express server is running');
});

router.get('/api/products', async (request, response) => {
  try {
    if (request.query.pagination === 'offset' || request.query.offset !== undefined) {
      const { offset, limit } = getOffsetPagination(request.query);
      const result = await withProductsCollection(async (collection) => {
        const [data, total] = await Promise.all([
          collection.find({}).sort({ _id: 1 }).skip(offset).limit(limit).toArray(),
          collection.countDocuments(),
        ]);

        return { data, total };
      });

      response.json({
        pagination: 'offset',
        offset,
        limit,
        total: result.total,
        hasMore: offset + result.data.length < result.total,
        data: result.data,
      });
      return;
    }

    const { cursor, limit } = getCursorPagination(request.query);
    const filter = cursor ? { _id: { $gt: cursor } } : {};
    const products = await withProductsCollection((collection) => (
      collection
        .find(filter)
        .sort({ _id: 1 })
        .limit(limit + 1)
        .toArray()
    ));
    const hasMore = products.length > limit;
    const data = hasMore ? products.slice(0, limit) : products;
    const nextCursor = hasMore ? data[data.length - 1]._id.toString() : null;

    response.json({
      pagination: 'cursor',
      limit,
      hasMore,
      nextCursor,
      data,
    });
  } catch (error) {
    if (error.statusCode) {
      response.status(error.statusCode).json({ error: error.message });
      return;
    }

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
    response.status(500).json({
      error: 'Unable to load unsafe products',
      details: error.message,
    });
  }
});

router.use((_request, response) => {
  response.status(404).json({ error: 'Not found' });
});

module.exports = router;
