const { MongoClient } = require('mongodb');
const { mongoUri, databaseName, collectionName } = require('./config');

async function withProductsCollection(operation) {
  if (!mongoUri) {
    const error = new Error('MONGODB_URI is not configured');
    error.code = 'MISSING_MONGODB_URI';
    throw error;
  }

  const client = new MongoClient(mongoUri);

  try {
    await client.connect();
    const collection = client.db(databaseName).collection(collectionName);
    return await operation(collection);
  } finally {
    await client.close();
  }
}

module.exports = { withProductsCollection };
