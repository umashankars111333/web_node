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