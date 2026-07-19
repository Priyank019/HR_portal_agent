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
  const contentTypeHeader = typeof req.headers['content-type'] === 'string' ? req.headers['content-type'] : '';
  const isMultipartForm = contentTypeHeader.includes('multipart/form-data');

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
  const body = hasBody
    ? (isMultipartForm ? (req as unknown as BodyInit) : JSON.stringify(req.body ?? {}))
    : undefined;

  if (hasBody && !isMultipartForm && !headers.has('content-type')) {
    headers.set('content-type', 'application/json');
  }

    console.log("\n========== FORWARD REQUEST ==========");
    console.log("Target URL:", targetUrl);
    console.log("Method:", req.method);
    console.log("Origin Header:", req.headers.origin);
    console.log("=====================================\n");
  const response = await fetch(targetUrl, {
    method: req.method,
    headers,
    body,
    ...(isMultipartForm ? { duplex: 'half' as const } : {}),
  });
  console.log("\n========== RESPONSE FROM AUTH ==========");
    console.log("Status:", response.status);

    response.headers.forEach((value, key) => {
    console.log(`${key}: ${value}`);
    });

    console.log("========================================\n");
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

  const contentType = response.headers.get('content-type') ?? '';

if (!response.body) {
  res.end();
  return;
}

if (contentType.includes('application/json')) {
  const responseText = await response.text();

  if (!responseText) {
    res.end();
    return;
  }

  res.json(JSON.parse(responseText));
  return;
}

// Stream non-JSON responses
const reader = response.body.getReader();

while (true) {
  const { done, value } = await reader.read();

  if (done) break;

  res.write(Buffer.from(value));
}

res.end();
};