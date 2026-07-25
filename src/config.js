require('dotenv').config();

module.exports = {
  port: Number(process.env.PORT) || 3000,
  mongoUri: process.env.MONGODB_URI,
  databaseName: process.env.MONGODB_DATABASE || 'ecommerce',
  collectionName: process.env.MONGODB_COLLECTION || 'products',
};
