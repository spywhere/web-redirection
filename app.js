const express = require('express');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');

const port = process.env.PORT || 3000;
const app = express();

app.use(helmet());
app.use(cookieParser());

app.get('/', (req, res) => {
  res.send('Hello World');
});

app.get('/:keyword', (req, res) => {
  const baseUrl = `${req.protocol}://${req.get('host')}/`;
  const url = req.cookies[req.params.keyword] || baseUrl;

  console.log(JSON.stringify(req.cookies, undefined, 2));

  res.redirect(url);
});

app.listen(port, () => {
  console.log('listening on port', port);
});
