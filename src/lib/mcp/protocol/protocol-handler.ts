import { MCPMessage, MCPMessageType, MCPMetrics, MessageCorrelation, ErrorStrategy, ErrorCondition } from './types';
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
      connectionTime: Date.now(),
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

  async handleIncoming(message: string): Promise<void> {
    try {
      const parsed = await this.parser.parse(message);
      this.trackMetrics(parsed);
      this.processMessage(parsed);
    } catch (error) {
      if (error instanceof MCPErrorImpl) {
        // Update metrics for error
        this.metrics.failedMessages++;
        this.metrics.errorRate = (this.metrics.failedMessages / this.metrics.totalMessages) * 100;
        this.metrics.retryCount++;
      }
      throw error;
    }
  }

  async handleOutgoing(message: MCPMessage): Promise<string> {
    try {
      if (!message.id) {
        message.id = Date.now().toString();
      }
      const serialized = await this.parser.serialize(message);
      this.trackMetrics(message);
      return serialized;
    } catch (error) {
      if (error instanceof MCPErrorImpl) {
        // Update metrics for error
        this.metrics.failedMessages++;
        this.metrics.errorRate = (this.metrics.failedMessages / this.metrics.totalMessages) * 100;
        this.metrics.retryCount++;
      }
      throw error;
    }
  }

  private processMessage(message: MCPMessage): void {
    switch (message.type) {
      case 'command':
        this.handleCommand(message);
        break;
      case 'response':
        this.handleResponse(message);
        break;
      case 'event':
        this.handleEvent(message);
        break;
      case 'error':
        this.handleError(message);
        break;
      default:
        throw new MCPErrorImpl({
          name: 'ProtocolError',
          message: 'Unknown message type',
          code: 2001,
          type: 'protocol' as MCPErrorType,
          details: { type: message.type },
          timestamp: new Date().toISOString()
        });
    }
  }

  private handleCommand(message: MCPMessage): void {
    const correlation: MessageCorrelation = {
      id: message.id!,
      timestamp: new Date(),
      timeout: setTimeout(() => {
        const error = new MCPErrorImpl({
          name: 'TimeoutError',
          message: 'Command timed out',
          code: 2002,
          type: 'timeout' as MCPErrorType,
          details: { command: message.command },
          timestamp: new Date().toISOString()
        });
        correlation.reject(error);
      }, this.errorStrategy.delay),
      command: message.command!,
      params: message.params || {},
      resolve: (response: MCPMessage) => {
        clearTimeout(correlation.timeout);
        this.correlationMap.delete(message.id);
      },
      reject: (error: Error) => {
        clearTimeout(correlation.timeout);
        this.correlationMap.delete(message.id);
      }
    };
    this.correlationMap.set(message.id, correlation);
  }

  private handleResponse(message: MCPMessage): void {
    const correlation = this.correlationMap.get(message.id);
    if (!correlation) {
      throw new MCPErrorImpl({
        name: 'ProtocolError',
        message: 'No correlation found for response',
        code: 2002,
        type: 'protocol' as MCPErrorType,
        details: { id: message.id },
        timestamp: new Date().toISOString()
      });
    }
    correlation.resolve(message);
  }

  private handleEvent(message: MCPMessage): void {
    // Events are broadcast, no correlation needed
  }

  private handleError(message: MCPMessage): void {
    const correlation = this.correlationMap.get(message.id);
    if (!correlation) {
      throw new MCPErrorImpl({
        name: 'ProtocolError',
        message: 'No correlation found for error',
        code: 2003,
        type: 'protocol' as MCPErrorType,
        details: { id: message.id },
        timestamp: new Date().toISOString()
      });
    }
    correlation.reject(new MCPErrorImpl({
      name: 'CommandError',
      message: message.error?.message || 'Unknown error',
      code: message.error?.code || 2004,
      type: 'command' as MCPErrorType,
      details: message.error,
      timestamp: new Date().toISOString()
    }));
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
