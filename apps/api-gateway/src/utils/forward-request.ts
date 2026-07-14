import type { Request, Response } from 'express';

const hopByHopHeaders = new Set([
  'connection',
  'keep-alive',
  'proxy-authenticate',
  'proxy-authorization',
  'te',
  'trailer',
  'transfer-encoding',
  'upgrade',
]);

export const forwardRequest = async (req: Request, res: Response, targetUrl: string) => {
  const headers = new Headers();

  for (const [key, value] of Object.entries(req.headers)) {
    if (!value || hopByHopHeaders.has(key.toLowerCase())) {
      continue;
    }

    if (Array.isArray(value)) {
      headers.set(key, value.join(', '));
      continue;
    }

    if (typeof value === 'string') {
      headers.set(key, value);
    }
  }

  const hasBody = !['GET', 'HEAD'].includes(req.method);
  const body = hasBody ? JSON.stringify(req.body ?? {}) : undefined;

  if (hasBody && !headers.has('content-type')) {
    headers.set('content-type', 'application/json');
  }

  const response = await fetch(targetUrl, {
    method: req.method,
    headers,
    body,
  });

  res.status(response.status);

  const setCookieHeader = typeof (response.headers as Headers & { getSetCookie?: () => string[] }).getSetCookie === 'function'
    ? (response.headers as Headers & { getSetCookie: () => string[] }).getSetCookie()
    : [];

  if (setCookieHeader.length > 0) {
    res.setHeader('set-cookie', setCookieHeader);
  }

  response.headers.forEach((value, key) => {
    if (!hopByHopHeaders.has(key.toLowerCase()) && key.toLowerCase() !== 'set-cookie') {
      res.setHeader(key, value);
    }
  });

  const responseText = await response.text();

  if (!responseText) {
    res.end();
    return;
  }

  const contentType = response.headers.get('content-type') ?? '';

  if (contentType.includes('application/json')) {
    res.json(JSON.parse(responseText));
    return;
  }

  res.send(responseText);
};