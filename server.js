const http = require('http');
const fs = require('fs');
const path = require('path');

// Auto-load .env file
if (fs.existsSync('.env')) {
  if (typeof process.loadEnvFile === 'function') {
    process.loadEnvFile('.env');
  } else {
    const envContent = fs.readFileSync('.env', 'utf8');
    envContent.split('\n').forEach((line) => {
      const match = line.match(/^\s*([\w-]+)\s*=\s*(.*)?\s*$/);
      if (match) {
        const key = match[1];
        let val = (match[2] || '').trim();
        if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
        if (val.startsWith("'") && val.endsWith("'")) val = val.slice(1, -1);
        if (!process.env[key]) process.env[key] = val;
      }
    });
  }
}

const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

const apiRoutes = {
  '/api/weather': require('./api/weather'),
  '/api/forecast': require('./api/forecast'),
  '/api/geocode': require('./api/geocode'),
  '/api/chat': require('./api/chat')
};

const server = http.createServer(async (req, res) => {
  const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = parsedUrl.pathname;

  // Check API routes
  if (apiRoutes[pathname]) {
    try {
      return await apiRoutes[pathname](req, res);
    } catch (err) {
      console.error('API error:', err);
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      return res.end(JSON.stringify({ success: false, error: 'Internal Server Error' }));
    }
  }

  // Static files
  let relativePath = pathname === '/' ? 'index.html' : pathname.replace(/^\/+/, '');
  const filePath = path.join(__dirname, relativePath);

  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    const ext = path.extname(filePath).toLowerCase();
    const contentType = mimeTypes[ext] || 'application/octet-stream';
    res.statusCode = 200;
    res.setHeader('Content-Type', contentType);
    return fs.createReadStream(filePath).pipe(res);
  }

  res.statusCode = 404;
  res.setHeader('Content-Type', 'text/plain');
  res.end('404 Not Found');
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`\n\x1b[32m🚀 WeatherGPT local server running at:\x1b[0m http://localhost:${PORT}\n`);
});
