// server.js

const express = require('express');

const app = express();
const port = process.env.PORT || 5000;

// import routes
const routes = require('./routes/index');

// use routes
app.use('/', routes);

// start server
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
