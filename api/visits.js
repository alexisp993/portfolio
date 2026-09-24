const COUNTER_KEY = 'portfolio:alexisp993:visits';
const VISITOR_KEY_PREFIX = 'portfolio:alexisp993:visitor:';

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

  try {
    const runRedisCommand = async (command) => {
      const redisResponse = await fetch(redisUrl, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${redisToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(command),
        cache: 'no-store'
      });
      if (!redisResponse.ok) throw new Error(`Counter storage returned ${redisResponse.status}`);
      return redisResponse.json();
    };

    if (request.method === 'POST') {
      const visitorId = request.body?.visitorId;
      if (typeof visitorId !== 'string' || !/^[a-f0-9-]{36}$/i.test(visitorId)) {
        return response.status(400).json({ error: 'Invalid visitor ID' });
      }

      const visitorKey = `${VISITOR_KEY_PREFIX}${visitorId}`;
      const firstVisit = await runRedisCommand(['SET', visitorKey, '1', 'NX']);
      if (firstVisit.result === 'OK') await runRedisCommand(['INCR', COUNTER_KEY]);
    }

    const payload = await runRedisCommand(['GET', COUNTER_KEY]);
    const count = Number(payload.result || 0);
    return response.status(200).json({ count });
  } catch {
    return response.status(502).json({ error: 'Visit counter is temporarily unavailable' });
  }
}
