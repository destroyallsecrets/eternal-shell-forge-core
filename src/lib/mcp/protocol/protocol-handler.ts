import { 
  MCPMessage, 
  MCPMessageType, 
  MCPMetrics, 
  MessageCorrelation,
  ErrorStrategy,
  ErrorCondition,
  MCPCommandError
} from './types';
import { MCPMessageParser } from './message-parser';
import { MCPErrorImpl, MCPErrorType } from './error';

export class MCPProtocolHandler {
  private static instance: MCPProtocolHandler;
  private parser: MCPMessageParser;
  private metrics: MCPMetrics;
  private correlationMap: Map<string, MessageCorrelation>;
  private errorStrategy: ErrorStrategy;

  private constructor() {
    this.parser = MCPMessageParser.getInstance();
    this.correlationMap = new Map();
    this.metrics = {
      connectionTime: 0,
      messageLatency: 0,
      errorRate: 0,
      throughput: 0,
      activeConnections: 0,
      totalMessages: 0,
      failedMessages: 0,
      retryCount: 0
    };
    this.errorStrategy = {
      type: 'retry',
      maxAttempts: 3,
      delay: 1000,
      conditions: []
    };
  }

  static getInstance(): MCPProtocolHandler {
    if (!MCPProtocolHandler.instance) {
      MCPProtocolHandler.instance = new MCPProtocolHandler();
    }
    return MCPProtocolHandler.instance;
  }

  async handleIncoming(message: string): Promise<MCPMessage> {
    try {
      const parsed = this.parser.parse(message);
      this.trackMetrics(parsed);
      return this.processMessage(parsed);
    } catch (error) {
      if (error instanceof MCPErrorImpl) {
        this.handleError(error);
        throw error;
      }
      throw new MCPErrorImpl({
        name: 'ProtocolError',
        message: 'Failed to handle incoming message',
        code: 2001,
        type: 'protocol' as MCPErrorType,
        details: error.message,
        cause: error,
        timestamp: new Date().toISOString()
      });
    }
  }

  async handleOutgoing(message: MCPMessage): Promise<string> {
    try {
      this.trackMetrics(message);
      return this.parser.serialize(message);
    } catch (error) {
      if (error instanceof MCPErrorImpl) {
        this.handleError(error);
        throw error;
      }
      throw new MCPErrorImpl({
        name: 'ProtocolError',
        message: 'Failed to handle outgoing message',
        code: 2002,
        type: 'protocol' as MCPErrorType,
        details: error.message,
        cause: error,
        timestamp: new Date().toISOString()
      });
    }
  }

  private processMessage(message: MCPMessage): MCPMessage {
    switch (message.type) {
      case 'command':
        return this.handleCommand(message);
      case 'response':
        return this.handleResponse(message);
      case 'error':
        if (message.error) {
          throw new MCPErrorImpl({
            name: 'ProtocolError',
            message: message.error.message || 'Unknown error',
            code: message.error.code || 2003,
            type: 'protocol' as MCPErrorType,
            details: message.error,
            timestamp: new Date().toISOString()
          });
        }
        throw new MCPErrorImpl({
          name: 'ProtocolError',
          message: 'Error message missing error details',
          code: 2003,
          type: 'protocol' as MCPErrorType,
          timestamp: new Date().toISOString()
        });
      case 'event':
        return this.handleEvent(message);
      default:
        throw new MCPErrorImpl({
          name: 'ProtocolError',
          message: 'Unknown message type',
          code: 2004,
          type: 'protocol' as MCPErrorType,
          details: { type: message.type },
          timestamp: new Date().toISOString()
        });
    }
  }

  private handleCommand(message: MCPMessage): MCPMessage {
    const correlation = this.correlationMap.get(message.id || '');
    if (!correlation) {
      throw new MCPErrorImpl({
        name: 'ProtocolError',
        message: 'No correlation found for command',
        code: 2005,
        type: 'protocol' as MCPErrorType,
        details: { id: message.id },
        timestamp: new Date().toISOString()
      });
    }

    correlation.resolve(message);
    this.correlationMap.delete(message.id || '');
    return message;
  }

  private handleResponse(message: MCPMessage): MCPMessage {
    const correlation = this.correlationMap.get(message.id || '');
    if (!correlation) {
      throw new MCPErrorImpl({
        name: 'ProtocolError',
        message: 'No correlation found for response',
        code: 2006,
        type: 'protocol' as MCPErrorType,
        details: { id: message.id },
        timestamp: new Date().toISOString()
      });
    }

    correlation.resolve(message);
    this.correlationMap.delete(message.id || '');
    return message;
  }

  private handleEvent(message: MCPMessage): MCPMessage {
    // Handle event messages
    return message;
  }

  private handleError(error: MCPErrorImpl): void {
    // Handle error according to strategy
    if (this.errorStrategy.conditions.some(condition => condition.code === error.code)) {
      const condition = this.errorStrategy.conditions.find(c => c.code === error.code);
      if (condition) {
        condition.handler(error);
      }
    }
  }

  private trackMetrics(message: MCPMessage): void {
    // Track metrics
    this.metrics.throughput++;
    this.metrics.totalMessages++;
    if (message.type === 'response' && message.id) {
      const correlation = this.correlationMap.get(message.id);
      if (correlation) {
        const latency = Date.now() - correlation.timestamp.getTime();
        this.metrics.messageLatency = (this.metrics.messageLatency + latency) / 2;
      }
    }
  }

  addErrorCondition(condition: ErrorCondition): void {
    this.errorStrategy.conditions.push(condition);
  }

  setMaxRetries(maxRetries: number): void {
    this.errorStrategy.maxAttempts = maxRetries;
  }

  setRetryDelay(delay: number): void {
    this.errorStrategy.delay = delay;
  }

  getMetrics(): MCPMetrics {
    return { ...this.metrics };
  }
}
