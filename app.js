import * as path from 'path';
import * as url from 'url';

import Koa from 'koa';
import helmet from 'koa-helmet';
import compress from 'koa-compress';
import cookie from 'koa-cookie';
import render from '@koa/ejs';
import Router from '@koa/router';

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));

const port = process.env.PORT || 3000;
const app = new Koa();

app.use(helmet());
app.use(compress());
app.use(cookie.default());
render(app, {
  root: path.join(__dirname, 'view'),
  caches: false
});

const router = new Router();

router.use(async (ctx, next) => {
  ctx.state = {
    keyword: undefined,
    url: undefined
  };
  return next();
});
router.get('/', async (ctx) => {
  await ctx.render('index');
});

router.get('/:keyword', async (ctx) => {
  const cookies = ctx.cookie || {};
  const keyword = ctx.params.keyword;
  const url = cookies[keyword];

  if (url) {
    ctx.redirect(url);
    ctx.body = '';
  } else {
    await ctx.render('index', { keyword, url });
  }
});

app.use(router.routes()).use(router.allowedMethods());

app.use(async (context) => {
  context.body = '';
  context.status = 404;
});

app.listen(port, () => {
  console.log('listening on port', port);
});
