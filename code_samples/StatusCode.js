const express = require('express');
const { ObjectId } = require('mongodb');
const { withProductsCollection } = require('./database');

const router = express.Router();

router.get('/products/:id', async (request, response) => {
  // An invalid ID is a client input problem, so return 400 Bad Request.
  if (!ObjectId.isValid(request.params.id)) {
    response.status(400).json({ error: 'Product ID must be a valid ObjectId' });
    return;
  }

  try {
    const product = await withProductsCollection((collection) => (
      collection.findOne({ _id: new ObjectId(request.params.id) })
    ));

    // A valid request can still refer to a product that does not exist.
    if (!product) {
      response.status(404).json({ error: 'Product not found' });
      return;
    }

    response.status(200).json(product);
  } catch (error) {
    // Database failures are server errors, not client errors.
    console.error('Unable to find product:', error.message);
    response.status(500).json({ error: 'Unable to find product' });
  }
});

router.post('/products', async (request, response) => {
  // Reject invalid input before attempting a database operation.
  if (!request.body || typeof request.body !== 'object' || Array.isArray(request.body)) {
    response.status(400).json({ error: 'Product data is required' });
    return;
  }

  try {
    const result = await withProductsCollection((collection) => (
      collection.insertOne(request.body)
    ));

    // 201 Created indicates that a new resource was successfully created.
    response.status(201).json({ id: result.insertedId, message: 'Product created' });
  } catch (error) {
    console.error('Unable to create product:', error.message);
    response.status(500).json({ error: 'Unable to create product' });
  }
});

router.delete('/products/:id', async (request, response) => {
  if (!ObjectId.isValid(request.params.id)) {
    response.status(400).json({ error: 'Product ID must be a valid ObjectId' });
    return;
  }

  try {
    const result = await withProductsCollection((collection) => (
      collection.deleteOne({ _id: new ObjectId(request.params.id) })
    ));

    if (result.deletedCount === 0) {
      response.status(404).json({ error: 'Product not found' });
      return;
    }

    // 204 No Content means deletion succeeded and has no response body.
    response.status(204).send();
  } catch (error) {
    console.error('Unable to delete product:', error.message);
    response.status(500).json({ error: 'Unable to delete product' });
  }
});

router.get('/admin/products', (request, response) => {
  // 401 means the client has not authenticated, so the server does not know who it is.
  if (!request.headers.authorization) {
    response.status(401).json({ error: 'Authentication required' });
    return;
  }

  response.status(200).json({ message: 'Admin products available' });
});

router.delete('/admin/users/:id', (_request, response) => {
  // 403 means the user is known but does not have permission for this action.
  response.status(403).json({ error: 'You are not allowed to delete users' });
});

module.exports = router;