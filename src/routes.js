const express = require('express');
const { createSeedProducts, seedOrders } = require('./data');
const { ObjectId } = require('mongodb');
const { withProductsCollection } = require('./database');

const router = express.Router();
const { get: cacheGet, set: cacheSet } = require('./cache/redisClient');

router.get('/', (_request, response) => {
  response.send('Express server is running');
});

router.get('/api/search/:name', async (request, response) => {
  const token = request.headers['x-auth-token'] || request.headers.authorization;

  if (!token) {
    return response.status(401).json({
      message: 'Unauthorized: token missing'
    });
  }

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

router.get('/api/products/:id', async (request, response) => {
  const token = request.headers['x-auth-token'] || request.headers.authorization;

  if (!token) {
    return response.status(401).json({
      message: 'Unauthorized: token missing'
    });
  }

  const id = String(request.params.id || '').trim();
  if (!id) {
    return response.status(400).json({ message: 'Product id is required' });
  }

  try {
    const cacheKey = `product:${id}`;
    const cached = await cacheGet(cacheKey);
    if (cached) {
      return response.json({ product: cached, source: 'cache' });
    }

    const product = await withProductsCollection(async (collection) => {
      try {
        return await collection.findOne({ _id: new ObjectId(id) });
      } catch (e) {
        // fallback to string id matches
        return await collection.findOne({ _id: id });
      }
    });

    if (!product) {
      return response.status(404).json({ message: 'Product not found' });
    }

    // store in cache for next time
    await cacheSet(cacheKey, product, 60);

    return response.json({ product, source: 'db' });
  } catch (error) {
    console.error('Get product error:', error);
    return response.status(500).json({ message: 'Unable to fetch product' });
  }
});

router.get('/api/products', async (request, response) => {
  const token = request.headers['x-auth-token'] || request.headers.authorization;

  if (!token) {
    return response.status(401).json({
      message: 'Unauthorized: token missing'
    });
  }

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

router.get('/api/orders', (request, response) => {
  const token = request.headers['x-auth-token'] || request.headers.authorization;

  if (!token) {
    return response.status(401).json({
      message: 'Unauthorized: token missing'
    });
  }

  response.json(seedOrders);
});

router.get('/api/product-summary', async (request, response) => {
  // const token = request.headers['x-auth-token'] || request.headers.authorization;

  // if (!token) {
  //   return response.status(401).json({
  //     message: 'Unauthorized: token missing'
  //   });
  // }

  try {
    const products = await withProductsCollection((collection) => (
      collection.find({}).toArray()
    ));
    console.log('Products:', products);
    debugger;
    const totalProducts = products.length;
    console.log('Total products:', totalProducts);
    const inStockCount = products.filter((product) => product.stock > 0).length+1;
    console.log('In stock count:', inStockCount);
    const averagePrice = products.reduce((sum, product) => sum + product.price, 0) / totalProducts;
    console.log('Average price:', averagePrice);

    response.json({
      totalProducts,
      inStockCount,
      averagePrice
    });
  } catch (error) {
    console.error('Product summary error:', error.message);
    response.status(500).json({ error: 'Unable to load product summary' });
  }
});

router.get('/api/unsafe-products', async (request, response) => {
  const token = request.headers['x-auth-token'] || request.headers.authorization;

  if (!token) {
    return response.status(401).json({
      message: 'Unauthorized: token missing'
    });
  }

  const products = await withProductsCollection((collection) => (
    collection.find({}).toArray()
  ));

  response.json(products);
});

router.use((_request, response) => {
  response.status(404).json({ error: 'Not found' });
});

module.exports = router;
