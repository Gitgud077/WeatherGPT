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

function getApiHandler(pathname) {
  const routeMap = {
    '/api/weather': './api/weather',
    '/api/forecast': './api/forecast',
    '/api/geocode': './api/geocode',
    '/api/chat': './api/chat',
    '/api/aqi': './api/aqi',
    '/api/multimodel': './api/multimodel',
    '/api/tts': './api/tts'
  };

  const target = routeMap[pathname];
  if (!target) return null;

  // In development, clear require cache for api and lib so code edits apply instantly
  Object.keys(require.cache).forEach((key) => {
    if (key.includes('/api/') || key.includes('\\api\\') || key.includes('/lib/') || key.includes('\\lib\\')) {
      delete require.cache[key];
    }
  });

  return require(target);
}

const server = http.createServer(async (req, res) => {
  const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = parsedUrl.pathname;

  // Check API routes
  const handler = getApiHandler(pathname);
  if (handler) {
    try {
      return await handler(req, res);
    } catch (err) {
      console.error('API error:', err);
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      return res.end(JSON.stringify({ success: false, error: 'Internal Server Error' }));
    }
  }

  // Static files with security checks
  let relativePath = pathname === '/' ? 'index.html' : pathname.replace(/^\/+/, '');
  const resolvedBase = path.resolve(__dirname);
  const resolvedPath = path.resolve(__dirname, relativePath);

  // Deny directory traversal outside base directory
  if (!resolvedPath.startsWith(resolvedBase)) {
    res.statusCode = 403;
    res.setHeader('Content-Type', 'text/plain');
    return res.end('403 Forbidden');
  }

  // Deny dotfiles (.env, .git, etc.) and internal project metadata
  const pathParts = relativePath.split(/[/\\]/);
  if (pathParts.some((part) => part.startsWith('.'))) {
    res.statusCode = 404;
    res.setHeader('Content-Type', 'text/plain');
    return res.end('404 Not Found');
  }

  const baseFileName = path.basename(resolvedPath).toLowerCase();
  if (['package.json', 'package-lock.json', 'vercel.json', 'readme.md'].includes(baseFileName)) {
    res.statusCode = 404;
    res.setHeader('Content-Type', 'text/plain');
    return res.end('404 Not Found');
  }

  const ext = path.extname(resolvedPath).toLowerCase();
  // Only serve allowed web file types
  if (!mimeTypes[ext]) {
    res.statusCode = 404;
    res.setHeader('Content-Type', 'text/plain');
    return res.end('404 Not Found');
  }

  if (fs.existsSync(resolvedPath) && fs.statSync(resolvedPath).isFile()) {
    const contentType = mimeTypes[ext];
    res.statusCode = 200;
    res.setHeader('Content-Type', contentType);
    return fs.createReadStream(resolvedPath).pipe(res);
  }

  res.statusCode = 404;
  res.setHeader('Content-Type', 'text/plain');
  res.end('404 Not Found');
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`\n\x1b[32m🚀 RituGPT local server running at:\x1b[0m http://localhost:${PORT}\n`);
});
