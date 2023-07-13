import * as path from 'path';
import * as url from 'url';

import Koa from 'koa';
import helmet from 'koa-helmet';
import compress from 'koa-compress';
import cookie from 'koa-cookie';
import render from 'koa-ejs';
import Router from '@koa/router';

import { redirect, getEntries } from './redirect.js'

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
    error: undefined,
    entries: undefined
  };
  return next();
});

router.get('/', async (ctx) => ctx.render('index', {
  entries: getEntries(ctx.cookie)
}));
router.get('/:keyword', async (ctx) => redirect(
  ctx, ctx.cookie, ctx.params.keyword
));
router.get('/:keyword/:query', async (ctx) => redirect(
  ctx, ctx.cookie, ctx.params.keyword, ctx.params.query
));

app.use(router.routes()).use(router.allowedMethods());

app.use(async (context) => {
  context.body = '';
  context.status = 404;
});

app.listen(port, () => {
  console.info('listening on port', port);
});
