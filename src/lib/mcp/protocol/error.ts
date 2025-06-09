import type { MCPErrorType } from './types';

export interface MCPError {
  name: string;
  message: string;
  code: number;
  type: MCPErrorType;
  details?: any;
  cause?: Error | string;
  timestamp: string;
}

export class MCPErrorImpl extends Error implements MCPError {
  code: number;
  type: MCPErrorType;
  details?: any;
  cause?: Error | string;
  timestamp: string;

  constructor(error: MCPError) {
    super(error.message);
    this.name = error.name || 'MCPError';
    this.code = error.code;
    this.type = error.type;
    this.details = error.details;
    this.cause = error.cause;
    this.timestamp = error.timestamp || new Date().toISOString();
  }
}

// Export the error class as MCPError
export const MCPError = MCPErrorImpl;

// Re-export types
export type { MCPErrorType };
