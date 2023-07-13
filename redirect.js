import { Fzf, byLengthAsc } from 'fzf';
import isUrl from 'is-url';

const ERRORS = {
  NO_ENTRY: () => 'No redirection available. Try setting up one using a cookie editor.',
  NOT_FOUND: (keyword) => `No redirection available for '${ keyword }'.`,
  INVALID: (keyword, url) => `Redirection for '${ keyword }' is invalid. Expected an URL but got '${ url }' instead.`
};

function isValidKey(key) {
  return !key.startsWith('_') && key !== 'config';
}

export function getEntries(cookies) {
  return Object
    .entries(cookies || {})
    .filter(([key]) => isValidKey(key));
}

function getUrl(cookies, keyword, query) {
  const filterCookies = getEntries(cookies);

  if (filterCookies.length === 0) {
    return {
      error: ERRORS.NO_ENTRY()
    };
  }

  const keys = filterCookies.map(([key]) => key);
  const fzf = new Fzf(keys, {
    limit: 1,
    tiebreakers: [byLengthAsc]
  });
  const entries = fzf.find(keyword);

  const url = entries[0];
  if (!url) {
    return {
      error: ERRORS.NOT_FOUND(keyword)
    };
  }
  if (!isUrl(url)) {
    const urlType = typeof(url);
    return {
      error: ERRORS.INVALID(keyword, urlType === 'string' ? url : urlType),
      entries: filterCookies
    };
  }

  return {
    url: url.replace('%s', query || ''),
    entries: filterCookies
  };
}

export async function redirect(ctx, cookies, keyword, query) {
  const { url, error } = getUrl(cookies, keyword, query);
  if (url) {
    // TODO: renew cookie expiration time
    ctx.redirect(url);
    ctx.body = '';
  } else {
    return ctx.render('index', { error });
  }
}
