import Koa from 'koa';
import helmet from 'koa-helmet';
import compress from 'koa-compress';
import cookie from 'koa-cookie';
import Router from '@koa/router';

const port = process.env.PORT || 3000;
const app = new Koa();

app.use(helmet());
app.use(compress());
app.use(cookie.default());

const router = new Router();

router.get('/', async (ctx) => {
  ctx.body = 'hello world';
});

router.get('/:keyword', async (ctx) => {
  const cookies = ctx.cookie || {};
  const url = cookies[ctx.params.keyword] || '/';

  console.log(JSON.stringify(cookies, undefined, 2));

  ctx.redirect(url);
  ctx.body = '';
});

app.use(router.routes()).use(router.allowedMethods());

app.use(async (context) => {
  context.body = '';
  context.status = 404;
});

app.listen(port, () => {
  console.log('listening on port', port);
});
