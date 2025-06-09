import { MCPMessage, MCPMessageType } from './types';
import { MCPErrorImpl, MCPErrorType } from './error';

export class MCPMessageParser {
  private static instance: MCPMessageParser;
  private static readonly validTypes = ['command', 'response', 'error', 'event'];

  private constructor() {}

  static getInstance(): MCPMessageParser {
    if (!MCPMessageParser.instance) {
      MCPMessageParser.instance = new MCPMessageParser();
    }
    return MCPMessageParser.instance;
  }

  parse(message: string): MCPMessage {
    try {
      const parsed = JSON.parse(message);
      this.validate(parsed);
      return parsed;
    } catch (error) {
      if (error instanceof SyntaxError) {
        throw new MCPErrorImpl({
          name: 'ParseError',
          message: 'Invalid JSON format',
          code: 1001,
          type: 'parse' as MCPErrorType,
          details: error.message,
          cause: error,
          timestamp: new Date().toISOString()
        });
      } else if (error instanceof MCPErrorImpl) {
        throw error;
      } else {
        throw new MCPErrorImpl({
          name: 'ValidationError',
          message: 'Failed to validate message',
          code: 1002,
          type: 'validation' as MCPErrorType,
          details: error,
          cause: error,
          timestamp: new Date().toISOString()
        });
      }
    }
  }

  serialize(message: MCPMessage): string {
    try {
      if (!message.type || !message.name || !message.timestamp) {
        throw new MCPErrorImpl({
          name: 'ValidationError',
          message: 'Missing required fields',
          code: 1004,
          type: 'validation' as MCPErrorType,
          details: {
            type: message.type,
            name: message.name,
            timestamp: message.timestamp
          },
          timestamp: new Date().toISOString()
        });
      }

      if (!MCPMessageParser.validTypes.includes(message.type)) {
        throw new MCPErrorImpl({
          name: 'ValidationError',
          message: 'Invalid message type',
          code: 1005,
          type: 'validation' as MCPErrorType,
          details: { type: message.type },
          timestamp: new Date().toISOString()
        });
      }

      return JSON.stringify(message);
    } catch (error) {
      if (error instanceof MCPErrorImpl) {
        throw error;
      }
      throw new MCPErrorImpl({
        name: 'SerializeError',
        message: 'Failed to serialize MCP message',
        code: 1003,
        type: 'serialize' as MCPErrorType,
        details: error,
        cause: error,
        timestamp: new Date().toISOString()
      });
    }
  }

  private validate(message: MCPMessage): void {
    if (!message.type) {
      throw new MCPErrorImpl({
        name: 'ValidationError',
        message: 'Missing required field: type',
        code: 1004,
        type: 'validation' as MCPErrorType,
        timestamp: new Date().toISOString()
      });
    }

    if (!MCPMessageParser.validTypes.includes(message.type)) {
      throw new MCPErrorImpl({
        name: 'ValidationError',
        message: 'Invalid message type',
        code: 1005,
        type: 'validation' as MCPErrorType,
        timestamp: new Date().toISOString()
      });
    }

    if (!message.name) {
      throw new MCPErrorImpl({
        name: 'ValidationError',
        message: 'Missing required field: name',
        code: 1006,
        type: 'validation' as MCPErrorType,
        timestamp: new Date().toISOString()
      });
    }

    if (!message.timestamp) {
      throw new MCPErrorImpl({
        name: 'ValidationError',
        message: 'Missing required field: timestamp',
        code: 1007,
        type: 'validation' as MCPErrorType,
        timestamp: new Date().toISOString()
      });
    }
  }
}
