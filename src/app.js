const express = require('express');
const routes = require('./routes');
const statusCodeExercises = require('./status-code-exercises');

const app = express();

app.use(express.json());
app.use('/api/status-exercises', statusCodeExercises);
app.use(routes);

module.exports = app;
