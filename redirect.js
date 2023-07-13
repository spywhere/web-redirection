import { Fzf, byLengthAsc } from 'fzf';
import isUrl from 'is-url';

const ERRORS = {
  NO_ENTRY: () => 'No redirection available. Try setting up one using a cookie editor.',
  NOT_FOUND: (keyword) => `No redirection found for '${ keyword }'.`,
  NOT_FOUND_ALIAS: (keyword, alias) => `Redirection for '${ keyword }' is invalid. No redirection found for an alias '${ alias }'.`,
  INVALID: (keyword, url) => `Redirection for '${ keyword }' is invalid. Expected an URL but got '${ url }' instead.`,
  RECURSE_ALIAS: (keyword) => `Redirection for '${ keyword }' is invalid. An URL is set to itself.`
};

function isValidKey(key) {
  return !key.startsWith('_') && key !== 'config';
}

export function getEntries(cookies) {
  return Object
    .entries(cookies || {})
    .filter(([key]) => isValidKey(key))
    .sort(([a], [b]) => a.localeCompare(b));
}

function getUrl(cookies, keyword, query) {
  const filterCookies = getEntries(cookies);
  cookies = Object.fromEntries(filterCookies);

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
  const entry = entries[0];

  if (!entry) {
    return {
      error: ERRORS.NOT_FOUND(keyword),
      entries: filterCookies
    };
  }

  let url = cookies[entry.item];

  if (url.startsWith('/')) {
    const name = url.substr(1);
    const newUrl = cookies[name];

    if (!newUrl) {
      return {
        error: ERRORS.NOT_FOUND_ALIAS(keyword, name),
        entries: filterCookies
      };
    }

    if (newUrl === url) {
      return {
        error: ERRORS.RECURSE_ALIAS(keyword),
        entries: filterCookies
      };
    }

    url = newUrl;
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
  const { url, entries, error } = getUrl(cookies, keyword, query);

  if (url === ctx.request.href) {
    return ctx.render('index', {
      error: ERRORS.RECURSE_ALIAS(keyword),
      entries
    });
  }

  if (url) {
    // TODO: renew cookie expiration time
    ctx.redirect(url);
    ctx.body = '';
  } else {
    return ctx.render('index', { error, entries });
  }
}
