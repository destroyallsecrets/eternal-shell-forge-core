import { MCPProtocolHandler } from '../protocol-handler';
import { MCPMessage, MCPMessageType } from '../types';
import { MCPErrorImpl } from '../error';

describe('MCPProtocolHandler', () => {
  let handler: MCPProtocolHandler;
  let correlationId: string;

  beforeEach(() => {
    handler = MCPProtocolHandler.getInstance();
    correlationId = Date.now().toString();
  });

  describe('handleIncoming', () => {
    it('should handle valid command message', async () => {
      const message: MCPMessage = {
        type: 'command' as MCPMessageType,
        name: 'test',
        timestamp: '2024-01-01T00:00:00.000Z',
        id: correlationId
      };
      await handler.handleIncoming(JSON.stringify(message));
    });

    it('should handle valid response message', async () => {
      const message: MCPMessage = {
        type: 'response' as MCPMessageType,
        name: 'test',
        timestamp: '2024-01-01T00:00:00.000Z',
        id: correlationId
      };
      await handler.handleIncoming(JSON.stringify(message));
    });

    it('should handle valid event message', async () => {
      const message: MCPMessage = {
        type: 'event' as MCPMessageType,
        name: 'test',
        timestamp: '2024-01-01T00:00:00.000Z',
        id: correlationId
      };
      await handler.handleIncoming(JSON.stringify(message));
    });

    it('should handle valid error message', async () => {
      const message: MCPMessage = {
        type: 'error' as MCPMessageType,
        name: 'test',
        timestamp: '2024-01-01T00:00:00.000Z',
        error: {
          code: 1000,
          message: 'Test error',
          type: 'command',
          timestamp: '',
          name: ''
        },
        id: correlationId
      };
      await handler.handleIncoming(JSON.stringify(message));
    });

    it('should throw error for invalid message', async () => {
      const message = '{invalid json}';
      await expect(handler.handleIncoming(message)).rejects.toThrowError('ParseError');
    });
  });

  describe('handleOutgoing', () => {
    it('should handle valid command message', async () => {
      const message: MCPMessage = {
        type: 'command' as MCPMessageType,
        name: 'test',
        timestamp: '2024-01-01T00:00:00.000Z',
        id: correlationId
      };
      const result = await handler.handleOutgoing(message);
      expect(result).toBe(JSON.stringify(message));
    });

    it('should handle valid response message', async () => {
      const message: MCPMessage = {
        type: 'response' as MCPMessageType,
        name: 'test',
        timestamp: '2024-01-01T00:00:00.000Z',
        id: correlationId
      };
      const result = await handler.handleOutgoing(message);
      expect(result).toBe(JSON.stringify(message));
    });

    it('should handle valid event message', async () => {
      const message: MCPMessage = {
        type: 'event' as MCPMessageType,
        name: 'test',
        timestamp: '2024-01-01T00:00:00.000Z',
        id: correlationId
      };
      const result = await handler.handleOutgoing(message);
      expect(result).toBe(JSON.stringify(message));
    });

    it('should handle valid error message', async () => {
      const message: MCPMessage = {
        type: 'error' as MCPMessageType,
        name: 'test',
        timestamp: '2024-01-01T00:00:00.000Z',
        error: {
          code: 1000,
          message: 'Test error',
          type: 'command',
          timestamp: '',
          name: ''
        },
        id: correlationId
      };
      const result = await handler.handleOutgoing(message);
      expect(result).toBe(JSON.stringify(message));
    });

    it('should handle message with correlation', async () => {
      const message: MCPMessage = {
        type: 'command' as MCPMessageType,
        name: 'test',
        timestamp: '2024-01-01T00:00:00.000Z',
        id: correlationId
      };
      const response = {
        type: 'response' as MCPMessageType,
        name: 'test',
        timestamp: '2024-01-01T00:00:00.000Z',
        id: correlationId
      };
      const resolve = jest.fn();
      const reject = jest.fn();
      
      handler.handleOutgoing(message).then(resolve).catch(reject);
      await handler.handleIncoming(JSON.stringify(response));
      
      expect(resolve).toHaveBeenCalledWith(response);
      expect(reject).not.toHaveBeenCalled();
    });

    it('should handle error with correlation', async () => {
      const message: MCPMessage = {
        type: 'command' as MCPMessageType,
        name: 'test',
        timestamp: '2024-01-01T00:00:00.000Z',
        id: correlationId
      };
      const error = {
        type: 'error' as MCPMessageType,
        name: 'test',
        timestamp: '2024-01-01T00:00:00.000Z',
        error: {
          code: 1000,
          message: 'Test error'
        },
        id: correlationId
      } as MCPMessage;
      const resolve = jest.fn();
      const reject = jest.fn();
      
      handler.handleOutgoing(message).then(resolve).catch(reject);
      await handler.handleIncoming(JSON.stringify(error));
      
      expect(resolve).not.toHaveBeenCalled();
      expect(reject).toHaveBeenCalled();
    });

    it('should get metrics', () => {
      const message: MCPMessage = {
        type: 'command' as MCPMessageType,
        name: 'test',
        timestamp: '2024-01-01T00:00:00.000Z',
        id: correlationId
      };
      handler.handleIncoming(JSON.stringify(message));
      const metrics = handler.getMetrics();
      expect(metrics).toBeDefined();
    });
  });
});
