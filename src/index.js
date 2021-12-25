const express = require("express");
require('dotenv').config();

require('./db/mongoose');
const reporterRouter = require('./routers/reporter');
const newsRouter = require('./routers/news');

const app = express();
const port = process.env.PORT;

app.use(express.json());
app.use(reporterRouter);
app.use(newsRouter);

app.listen(port, () => {
  console.log(`Your server is running on port: ${port}`);
});