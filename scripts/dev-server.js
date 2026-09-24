const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const portArgument = process.argv.indexOf('--port');
const port = Number(portArgument >= 0 ? process.argv[portArgument + 1] : process.env.PORT) || 4317;
const host = '127.0.0.1';

const contentTypes = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.ico': 'image/x-icon',
  '.jpeg': 'image/jpeg',
  '.jpg': 'image/jpeg',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.pdf': 'application/pdf',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp'
};

function send(response, status, body, type = 'text/plain; charset=utf-8') {
  response.writeHead(status, { 'Content-Type': type, 'Cache-Control': 'no-store' });
  response.end(body);
}

const server = http.createServer((request, response) => {
  const requestUrl = new URL(request.url, `http://${request.headers.host || `${host}:${port}`}`);

  if (requestUrl.pathname === '/api/visits') {
    send(response, 503, JSON.stringify({ error: 'The visit counter runs after deployment on Vercel.' }), 'application/json; charset=utf-8');
    return;
  }

  let pathname;
  try { pathname = decodeURIComponent(requestUrl.pathname); } catch { return send(response, 400, 'Bad request'); }
  const relativePath = pathname === '/' ? 'index.html' : pathname.replace(/^\/+/, '');
  let filePath = path.resolve(root, relativePath);

  if (filePath !== root && !filePath.startsWith(`${root}${path.sep}`)) {
    send(response, 403, 'Forbidden');
    return;
  }

  fs.stat(filePath, (statError, stats) => {
    if (!statError && stats.isDirectory()) filePath = path.join(filePath, 'index.html');
    fs.stat(filePath, (fileError, fileStats) => {
    if (fileError || !fileStats.isFile()) {
      send(response, 404, 'Not found');
      return;
    }

    response.writeHead(200, {
      'Content-Type': contentTypes[path.extname(filePath).toLowerCase()] || 'application/octet-stream',
      'Cache-Control': 'no-store'
    });
    fs.createReadStream(filePath).pipe(response);
    });
  });
});

server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`Port ${port} is already in use. Stop the other server or run: npm run dev -- --port 4318`);
    process.exit(1);
  }
  throw error;
});

server.listen(port, host, () => {
  console.log(`Portfolio running at http://${host}:${port}/`);
  console.log('Press Ctrl+C to stop the server.');
});
