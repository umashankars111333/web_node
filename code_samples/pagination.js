router.get('/api/products', async (request, response) => {
  try {
    const { page, limit, skip } = getPagination(request.query);
    const result = await withProductsCollection(async (collection) => {
      const [products, total] = await Promise.all([
        collection.find({}).sort({ _id: 1 }).skip(skip).limit(limit).toArray(),
        collection.countDocuments(),
      ]);

      return { products, total };
    });

    response.json({
      page,
      limit,
      total: result.total,
      totalPages: Math.ceil(result.total / limit),
      data: result.products,
    });
  } catch (error) {
    console.error('Unable to load products from MongoDB Atlas:', error.message);
    response.status(500).json({ error: 'Unable to load products' });
  }
});