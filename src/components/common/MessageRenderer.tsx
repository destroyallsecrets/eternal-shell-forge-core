
import { Clock, AlertCircle, Info, ArrowRight, ArrowLeft } from 'lucide-react';
import { MarkdownRenderer } from './MarkdownRenderer';
import type { Message } from '@/pages/Index';

interface MessageRendererProps {
  message: Message;
}

export const MessageRenderer = ({ message }: MessageRendererProps) => {
  const getTypeIcon = () => {
    switch (message.type) {
      case 'request':
        return <ArrowRight className="w-4 h-4 text-blue-400" />;
      case 'response':
        return <ArrowLeft className="w-4 h-4 text-green-400" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-400" />;
      case 'info':
        return <Info className="w-4 h-4 text-yellow-400" />;
    }
  };

  const getTypeColor = () => {
    switch (message.type) {
      case 'request':
        return 'border-blue-400/30 bg-blue-400/5';
      case 'response':
        return 'border-green-400/30 bg-green-400/5';
      case 'error':
        return 'border-red-400/30 bg-red-400/5';
      case 'info':
        return 'border-yellow-400/30 bg-yellow-400/5';
    }
  };

  const getTypeLabel = () => {
    switch (message.type) {
      case 'request':
        return 'Request';
      case 'response':
        return 'Response';
      case 'error':
        return 'Error';
      case 'info':
        return 'Info';
    }
  };

  return (
    <div className={`border rounded-lg p-4 ${getTypeColor()}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {getTypeIcon()}
          <span className="text-sm font-medium">{getTypeLabel()}</span>
        </div>
        <div className="flex items-center gap-1 text-xs text-green-400/70">
          <Clock className="w-3 h-3" />
          {message.timestamp.toLocaleTimeString()}
        </div>
      </div>
      
      <div className="text-sm">
        <MarkdownRenderer content={message.content} />
      </div>
    </div>
  );
};
