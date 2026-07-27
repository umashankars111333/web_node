const { withProductsCollection } = require('../database');

async function searchProductsByName(searchName) {
  return withProductsCollection(async (collection) => {
    const escapedName = searchName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    return collection.find({
      name: {
        $regex: escapedName,
        $options: 'i'
      }
    }).toArray();
  });
}

module.exports = { searchProductsByName };
