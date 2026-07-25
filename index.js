const app = require('./src/app');
const { port } = require('./src/config');

app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
});
