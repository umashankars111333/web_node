const http = require('node:http');

const port = Number(process.env.PORT) || 3000;
const products = [
  { id: 1, name: 'Wireless Mouse', price: 19.99, inStock: true },
  { id: 2, name: 'Mechanical Keyboard', price: 59.99, inStock: true },
  { id: 3, name: 'USB-C Hub', price: 29.99, inStock: false },
];
const orders = [
  { id: 1, productId: 1, quantity: 2 },
  { id: 2, productId: 2, quantity: 1 },
  { id: 3, productId: 3, quantity: 5 },
];

const server = http.createServer((request, response) => {
  if (request.method === 'GET' && request.url === '/api/products') {
    response.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    response.end(JSON.stringify(products));
    return;
  }

  if (request.method === 'GET' && request.url === '/api/orders') {
    response.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    response.end(JSON.stringify(orders));
    return;
  }

  if (request.url === '/') {
    response.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
    response.end('Node.js server is running\n');
    return;
  }

  response.writeHead(404, { 'Content-Type': 'application/json; charset=utf-8' });
  response.end(JSON.stringify({ error: 'Not found' }));
});

server.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
});
