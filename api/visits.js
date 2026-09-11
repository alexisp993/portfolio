const COUNTER_KEY = 'portfolio:alexisp993:visits';

export default async function handler(request, response) {
  response.setHeader('Cache-Control', 'no-store, max-age=0');

  if (request.method !== 'GET' && request.method !== 'POST') {
    response.setHeader('Allow', 'GET, POST');
    return response.status(405).json({ error: 'Method not allowed' });
  }

  const redisUrl = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const redisToken = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!redisUrl || !redisToken) {
    return response.status(503).json({ error: 'Visit counter is not configured' });
  }

  const command = request.method === 'POST' ? 'incr' : 'get';
  try {
    const redisResponse = await fetch(`${redisUrl}/${command}/${encodeURIComponent(COUNTER_KEY)}`, {
      headers: { Authorization: `Bearer ${redisToken}` },
      cache: 'no-store'
    });
    if (!redisResponse.ok) throw new Error(`Counter storage returned ${redisResponse.status}`);
    const payload = await redisResponse.json();
    const count = Number(payload.result || 0);
    return response.status(200).json({ count });
  } catch {
    return response.status(502).json({ error: 'Visit counter is temporarily unavailable' });
  }
}
