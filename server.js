const WebSocket = require('ws');
const http = require('http');
const Y = require('yjs');
const { setupWSConnection } = require('y-websocket/bin/utils');

// Environment variables with defaults
const PORT = process.env.PORT || 3001;
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || '*').split(',');
const NODE_ENV = process.env.NODE_ENV || 'development';

const wss = new WebSocket.Server({ noServer: true });

const server = http.createServer((request, response) => {
    response.writeHead(200, { 'Content-Type': 'text/plain' });
    response.end('okay');
});

const doc = new Y.Doc();

wss.on('connection', (ws, req) => {
    console.log('New WebSocket connection from:', req.headers.origin);
    setupWSConnection(ws, req, { doc });
});

server.on('upgrade', (request, socket, head) => {
    // Add CORS headers for WebSocket
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
    };

    if (request.headers.origin) {
        headers['Access-Control-Allow-Origin'] = request.headers.origin;
    }

    wss.handleUpgrade(request, socket, head, (ws) => {
        Object.entries(headers).forEach(([key, value]) => {
            ws.headers = ws.headers || {};
            ws.headers[key] = value;
        });
        wss.emit('connection', ws, request);
    });
});

server.listen(PORT, '0.0.0.0', () => {
    console.log(`WebSocket server running in ${NODE_ENV} mode on port ${PORT}`);
    console.log(`Allowed origins: ${ALLOWED_ORIGINS.join(', ')}`);
}); 