const express = require('express');
const { ObjectId } = require('mongodb');
const { withProductsCollection } = require('./database');
const router = express.Router();

router.get('/products/:id', async (request, response) => {
  try {
    if (!ObjectId.isValid(request.params.id)) {
      return response.status(400).json({ error: 'Invalid product id' });
    }

    const product = await withProductsCollection((collection) => (
      collection.findOne({ _id: new ObjectId(request.params.id) })
    ));

    if (!product) {
      return response.status(404).json({ error: 'Product not found' });
    }

    response.status(200).json(product);
  } catch (error) {
    response.status(500).json({ error: error.message });
  }
});

router.post('/products', async (request, response) => {
  try {
    if (!request.body || Object.keys(request.body).length === 0) {
      return response.status(400).json({ error: 'Product data is required' });
    }

    const result = await withProductsCollection((collection) => (
      collection.insertOne(request.body)
    ));

    response.status(201).json(result);
  } catch (error) {
    response.status(500).json({ error: error.message });
  }
});

router.delete('/products/:id', async (request, response) => {
  try {
    if (!ObjectId.isValid(request.params.id)) {
      return response.status(400).json({ error: 'Invalid product id' });
    }

    const result = await withProductsCollection((collection) => (
      collection.deleteOne({ _id: new ObjectId(request.params.id) })
    ));

    if (result.deletedCount === 0) {
      return response.status(404).json({ error: 'Product not found' });
    }

    response.status(200).json({
      deletedCount: result.deletedCount,
      message: 'Deleted',
    });
  } catch (error) {
    response.status(500).json({ error: error.message });
  }
});

router.get('/admin/products', (_request, response) => {
  response.status(401).json({ error: 'Authentication required' });
});

router.delete('/admin/users/:id', (_request, response) => {
  response.status(403).json({ error: 'You are not allowed to delete users' });
});

module.exports = router;
