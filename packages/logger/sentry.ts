import type { Event, Options } from "@sentry/core";

// Query strings carrying these (magic links, invite/reset tokens, OAuth codes,
// redirect targets) are dropped whole from every URL Sentry sends.
const SENSITIVE_QUERY = /token|code|callbackurl/i;
const SENSITIVE_HEADER =
  /^(cookie|set-cookie|authorization|proxy-authorization)$/i;

export function scrubUrl(url: string): string {
  const i = url.indexOf("?");
  return i !== -1 && SENSITIVE_QUERY.test(url.slice(i)) ? url.slice(0, i) : url;
}

export function redactEvent<T extends Event>(event: T): T {
  const req = event.request;
  if (req) {
    delete req.cookies;
    delete req.data;
    if (req.url) req.url = scrubUrl(req.url);
    if (
      req.query_string &&
      SENSITIVE_QUERY.test(JSON.stringify(req.query_string))
    )
      delete req.query_string;
    if (req.headers)
      for (const h of Object.keys(req.headers))
        if (SENSITIVE_HEADER.test(h)) delete req.headers[h];
  }
  for (const crumb of event.breadcrumbs ?? []) {
    const data = crumb.data;
    if (!data) continue;
    for (const k of ["url", "from", "to"])
      if (typeof data[k] === "string") data[k] = scrubUrl(data[k]);
  }
  return event;
}

// Shared by the app and auth Sentry.init calls (server and browser). Errors only:
// no tracing, no session replay, no user info, cookies or bodies.
export const sentryOptions = {
  dataCollection: {
    userInfo: false,
    cookies: false,
    httpBodies: [],
    urlQueryParams: { deny: ["token", "code", "callbackUrl"] },
    stackFrameVariables: false,
  },
  beforeSend: redactEvent,
} satisfies Partial<Options>;
