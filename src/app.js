const express = require('express');
const routes = require('./routes');
const statusCodeExercises = require('./status-code-exercises');

const app = express();

app.use(express.json());
// Also expose the exercise routes at their short URLs for classroom testing.
app.use(statusCodeExercises);
app.use('/api/status-exercises', statusCodeExercises);
app.use(routes);

module.exports = app;
