# Node.js ECommerce Backend Development

## Start the server

```powershell
npm install
$env:MONGODB_URI="mongodb+srv://<username>:<password>@<cluster>/<database>"
npm start
```

The MongoDB database and collection default to `ecommerce` and `products`. Override them when needed:

```powershell
$env:MONGODB_DATABASE="ecommerce"
$env:MONGODB_COLLECTION="products"
```

## Practice API

`GET http://localhost:3000/api/products?pagination=offset&offset=0&limit=20` uses offset pagination. The next page uses `offset=20`.

`GET http://localhost:3000/api/products?limit=20` uses cursor pagination by default. Use the returned `nextCursor` value for the next request: `GET http://localhost:3000/api/products?limit=20&cursor=<nextCursor>`. The default limit is 20, and the maximum limit is 100.

`POST http://localhost:3000/api/seed-products` connects to MongoDB Atlas and inserts 200 generated sample products. A successful response confirms that the connection and insert worked.

`GET http://localhost:3000/api/slow-products` loads up to 1,000 records from MongoDB Atlas. This endpoint is intentionally implemented inefficiently by opening a new database connection for every request, so students can practice improving its response time.