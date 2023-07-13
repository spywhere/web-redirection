export default () => async (ctx, next) => {
  /** @type {string?} */
  const cookieHeader = ctx.headers.cookie;
  if (!cookieHeader) {
    return next();
  }

  const cookies = cookieHeader.split(';');
  ctx.cookie = cookies.reduce((c, i) => {
    const [name, ...values] = i.split('=');
    return {
      ...c,
      [name.trim()]: values.join('=').trim()
    };
  }, {});

  return next();
};
