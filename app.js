const express = require('express');
const cookieParser = require('cookie-parser');

const port = process.env.PORT || 3000;
const app = express();

app.use(cookieParser());

app.get('/', (req, res) => {
  res.send('Hello World');
});

app.get('/:keyword', (req, res) => {
  const baseUrl = `${req.protocol}://${req.get('host')}/`;
  const cookies = JSON.stringify(req.cookies, undefined, 2);
  const url = cookies[req.params.keyword] || baseUrl;

  console.log(cookies);

  res.redirect(url);
});

app.listen(port, () => {
  console.log('listening on port', port);
});
