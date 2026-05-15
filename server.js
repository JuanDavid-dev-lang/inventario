const express = require('express');
const path = require('path');
const { spawn } = require('child_process');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS headers
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'inventario', timestamp: new Date().toISOString() });
});

// API proxy - route to PHP backend
app.use('/api', (req, res, next) => {
  const php = spawn('php', ['-S', 'localhost:9000'], {
    cwd: path.join(__dirname, 'backend', 'public'),
    stdio: ['pipe', 'pipe', 'pipe']
  });

  // Forward the request to PHP server
  const http = require('http');
  const proxyReq = http.request(
    {
      hostname: 'localhost',
      port: 9000,
      path: req.url,
      method: req.method,
      headers: req.headers
    },
    (proxyRes) => {
      res.writeHead(proxyRes.statusCode, proxyRes.headers);
      proxyRes.pipe(res);
    }
  );

  proxyReq.on('error', (err) => {
    console.error('PHP proxy error:', err);
    res.status(500).json({ error: 'Backend service unavailable' });
  });

  if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
    req.pipe(proxyReq);
  } else {
    proxyReq.end();
  }

  php.on('exit', () => {
    console.log('PHP server stopped');
  });
});

// Serve static files from frontend build (if exists)
const frontendDist = path.join(__dirname, 'frontend', 'dist');
if (fs.existsSync(frontendDist)) {
  app.use(express.static(frontendDist));
} else {
  // Fallback: serve frontend src if dist doesn't exist
  app.use(express.static(path.join(__dirname, 'frontend')));
}

// Serve frontend index.html for all other routes (SPA routing)
app.get('*', (req, res) => {
  const indexPath = path.join(__dirname, 'frontend', 'dist', 'index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    // Fallback to root index.html
    res.sendFile(path.join(__dirname, 'frontend', 'index.html'));
  }
});

app.listen(PORT, () => {
  console.log(`Inventario server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log(`API: http://localhost:${PORT}/api`);
  console.log(`Frontend: http://localhost:${PORT}`);
});
