import { Fzf, byLengthAsc } from 'fzf';

const ERRORS = {
  NO_ENTRY: (keyword) => `No redirection available for '${ keyword }'.`,
  INVALID: (keyword) => `Redirection for '${ keyword }' is either missing or invalid.`
};

function isValidKey(key) {
  return !key.startsWith('_') && key !== 'config';
}

function getUrl(cookies, keyword, query) {
  const filterCookies = Object
    .entries(cookies || {})
    .filter(([key]) => isValidKey(key));
  const keys = filterCookies.map(([key]) => key);

  if (keys.length === 0) {
    return {
      error: ERRORS.NO_ENTRY(keyword)
    };
  }

  const fzf = new Fzf(keys, {
    limit: 1,
    tiebreakers: [byLengthAsc]
  });
  const entries = fzf.find(keyword);

  const url = entries[0];
  if (!url || typeof(url) !== 'string') {
    return {
      error: ERRORS.INVALID(keyword),
      entries: filterCookies
    };
  }

  return {
    url: url.replace('%s', query || ''),
    entries: filterCookies
  };
}

export default async function redirect(ctx, cookies, keyword, query) {
  const { url, error } = getUrl(cookies, keyword, query);
  if (url) {
    // TODO: renew cookie expiration time
    ctx.redirect(url);
    ctx.body = '';
  } else {
    return ctx.render('index', { error });
  }
}
