const WebSocket = require('ws');
const fs = require('fs');
const path = require('path');

const PORT = 8081;
const MCP_VERSION = '2.0';

// Load MCP commands from JSON file
const commands = JSON.parse(fs.readFileSync(path.join(__dirname, 'commands.json'), 'utf8'));

// Create WebSocket server
const wss = new WebSocket.Server({ port: PORT });

console.log(`MCP Test Server running on ws://localhost:${PORT}`);
console.log(`Available commands: ${Object.keys(commands).join(', ')}`);

wss.on('connection', (ws) => {
  console.log('Client connected');

  // Send MCP version on connection
  ws.send(JSON.stringify({
    type: 'mcp_version',
    version: MCP_VERSION
  }));

  ws.on('message', (data) => {
    try {
      const message = JSON.parse(data);
      console.log('Received:', message);

      // Handle MCP commands
      if (message.type === 'command') {
        const command = commands[message.name];
        if (command) {
          const response = {
            type: 'response',
            command: message.name,
            result: command.response,
            timestamp: new Date().toISOString()
          };
          ws.send(JSON.stringify(response));
        } else {
          ws.send(JSON.stringify({
            type: 'error',
            message: `Unknown command: ${message.name}`
          }));
        }
      }
    } catch (error) {
      console.error('Error processing message:', error);
      ws.send(JSON.stringify({
        type: 'error',
        message: 'Invalid message format'
      }));
    }
  });

  ws.on('close', () => {
    console.log('Client disconnected');
  });
});
