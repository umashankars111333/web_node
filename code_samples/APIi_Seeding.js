router.post('/api/seed-products', async (_request, response) => {
  try {
    const result = await withProductsCollection((collection) => (
      collection.insertMany(createSeedProducts())
    ));

    response.status(201).json({
      message: 'MongoDB connection successful',
      insertedCount: result.insertedCount,
      insertedIds: result.insertedIds,
    });
  } catch (error) {
    console.error('Unable to insert products into MongoDB Atlas:', error.message);
    response.status(500).json({
      error: error.code === 'MISSING_MONGODB_URI'
        ? error.message
        : 'MongoDB connection or insert failed',
      details: error.code === 'MISSING_MONGODB_URI' ? undefined : error.message,
    });
  }
});