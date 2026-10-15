export async function onRequest({request, env}) {
  const url = new URL(request.url);
  const key = decodeURIComponent(url.pathname.slice('/media/'.length));
  if (!key || key.includes('..') || key.startsWith('/')) return new Response('Arquivo inválido', { status: 400 });
  if (!env.MEDIA) return new Response('R2 não configurado', { status: 503 });
  const object = await env.MEDIA.get(key);
  if (!object) return new Response('Arquivo não encontrado', { status: 404 });
  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set('etag', object.httpEtag);
  headers.set('cache-control', 'public, max-age=31536000, immutable');
  return new Response(object.body, { headers });
}
