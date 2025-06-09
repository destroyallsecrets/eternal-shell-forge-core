# MCP Test Server

A simple MCP server implementation for testing the Eternal Shell Forge Core application.

## Features

- Implements basic MCP protocol version 2.0
- Supports WebSocket connections
- Provides test commands for verification
- Logs all client interactions

## Available Commands

- `ping`: Test command response
- `status`: Server status information
- `who`: List of connected players
- `commands`: List available commands

## Running the Server

1. Install dependencies:
```bash
npm install
```

2. Start the server:
```bash
npm start
```

The server will run on `ws://localhost:8081`

## Testing

The server can be used to verify that the web application's MCP client implementation works correctly by:
1. Connecting to the server
2. Sending MCP commands
3. Verifying responses
4. Testing error handling
