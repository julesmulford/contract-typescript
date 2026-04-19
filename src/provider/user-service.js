const http = require('http');

const users = new Map([
  [1, { id: 1, name: 'Alice Smith', email: 'alice@example.com', role: 'admin' }],
  [2, { id: 2, name: 'Bob Jones', email: 'bob@example.com', role: 'user' }],
]);

let nextId = 3;

function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk) => (body += chunk));
    req.on('error', reject);
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch {
        reject(new Error('Invalid JSON'));
      }
    });
  });
}

function sendJson(res, status, data) {
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data));
}

function createServer() {
  return http.createServer(async (req, res) => {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const pathParts = url.pathname.split('/').filter(Boolean);

    if (pathParts[0] !== 'users') {
      return sendJson(res, 404, { error: 'Not found' });
    }

    const userId = pathParts[1] ? parseInt(pathParts[1], 10) : null;

    if (req.method === 'GET' && userId !== null) {
      const user = users.get(userId);
      if (!user) return sendJson(res, 404, { error: 'User not found' });
      return sendJson(res, 200, user);
    }

    if (req.method === 'POST' && userId === null) {
      const body = await parseBody(req);
      if (!body.name || !body.email) {
        return sendJson(res, 400, { error: 'name and email are required' });
      }
      const newUser = { id: nextId++, ...body };
      users.set(newUser.id, newUser);
      return sendJson(res, 201, newUser);
    }

    if (req.method === 'DELETE' && userId !== null) {
      if (!users.has(userId)) return sendJson(res, 404, { error: 'User not found' });
      users.delete(userId);
      return sendJson(res, 204, null);
    }

    sendJson(res, 405, { error: 'Method not allowed' });
  });
}

module.exports = { createServer, users };
