const express = require('express');
const { ObjectId } = require('mongodb');
const { withProductsCollection } = require('./database');
const router = express.Router();

router.get('/products/:id', async (request, response) => {
  try {
    const product = await withProductsCollection((collection) => (
      collection.findOne({ _id: new ObjectId(request.params.id) })
    ));

    response.status(200).json(product);
  } catch (error) {
    response.status(500).json({ error: error.message });
  }
});

router.post('/products', async (request, response) => {
  try {
    const result = await withProductsCollection((collection) => (
      collection.insertOne(request.body)
    ));

    response.status(200).json(result);
  } catch (error) {
    response.status(500).json({ error: error.message });
  }
});

router.delete('/products/:id', async (request, response) => {
  try {
    const result = await withProductsCollection((collection) => (
      collection.deleteOne({ _id: new ObjectId(request.params.id) })
    ));

    response.status(200).json({
      deletedCount: result.deletedCount,
      message: 'Deleted',
    });
  } catch (error) {
    response.status(500).json({ error: error.message });
  }
});

router.get('/admin/products', (_request, response) => {
  response.status(500).json({ error: 'Authentication required' });
});


router.delete('/admin/users/:id', (_request, response) => {
  response.status(500).json({ error: 'You are not allowed to delete users' });
});

module.exports = router;
