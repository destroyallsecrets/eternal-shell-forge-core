import { MCPMessageParser } from '../message-parser';
import { MCPErrorImpl } from '../error';
import { MCPMessageType } from '../types';

describe('MCPMessageParser', () => {
  let parser: MCPMessageParser;

  beforeEach(() => {
    parser = MCPMessageParser.getInstance();
  });

  describe('parse', () => {
    it('should parse valid command message', () => {
      const message = '{"type":"command","name":"test","timestamp":"2024-01-01T00:00:00.000Z"}';
      const parsed = parser.parse(message);
      expect(parsed.type).toBe('command');
      expect(parsed.name).toBe('test');
      expect(parsed.timestamp).toBe('2024-01-01T00:00:00.000Z');
    });

    it('should throw error for invalid JSON', () => {
      const message = '{invalid json}';
      expect(() => parser.parse(message)).toThrowError('Invalid JSON format');
    });

    it('should throw error for missing type', () => {
      const message = '{"name":"test","timestamp":"2024-01-01T00:00:00.000Z"}';
      expect(() => parser.parse(message)).toThrowError('Missing required field: type');
    });

    it('should throw error for invalid type', () => {
      const message = '{"type":"invalid","name":"test","timestamp":"2024-01-01T00:00:00.000Z"}';
      expect(() => parser.parse(message)).toThrowError('Invalid message type');
    });

    it('should throw error for missing timestamp', () => {
      const message = '{"type":"command","name":"test"}';
      expect(() => parser.parse(message)).toThrowError('Missing required field: timestamp');
    });
  });

  describe('serialize', () => {
    it('should serialize valid message', () => {
      const message = {
        type: 'command' as MCPMessageType,
        name: 'test',
        timestamp: '2024-01-01T00:00:00.000Z'
      };
      const serialized = parser.serialize(message);
      expect(serialized).toBe(JSON.stringify(message));
    });

    it('should throw error for invalid message', () => {
      const message: any = { invalid: 'data' };
      expect(() => parser.serialize(message)).toThrowError('Missing required fields');
    });
  });
});
