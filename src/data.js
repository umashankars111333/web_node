function createSeedProducts() {
  return Array.from({ length: 200 }, (_, index) => ({
    name: `Practice Product ${index + 1}`,
    price: Number((5 + (index % 50) * 1.25).toFixed(2)),
    inStock: index % 5 !== 0,
  }));
}

const seedOrders = Array.from({ length: 100 }, (_, index) => ({
  productId: (index % 200) + 1,
  quantity: (index % 5) + 1,
}));

module.exports = { createSeedProducts, seedOrders };
