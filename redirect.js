function getUrl(cookies, keyword, query) {
  // TODO: option to allow prefix / contain / exact match
  const url = cookies[keyword];
  if (!url || typeof(url) !== 'string') {
    return url;
  }

  return url.replace('%s', query || '');
}

export default async function redirect(ctx, cookies, keyword, query) {
  const url = getUrl(cookies, keyword, query);
  if (url) {
    // TODO: renew cookie expiration time
    ctx.redirect(url);
    ctx.body = '';
  } else {
    return ctx.render('index', { keyword });
  }
}
