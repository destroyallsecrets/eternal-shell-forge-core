
import { useState, useRef, useEffect } from 'react';
import { Send, Terminal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MessageRenderer } from '@/components/common/MessageRenderer';
import type { Message, MCPServer } from '@/pages/Index';

interface MessageAreaProps {
  messages: Message[];
  selectedServer: MCPServer | undefined;
  onSendMessage: (content: string) => void;
}

export const MessageArea = ({ messages, selectedServer, onSendMessage }: MessageAreaProps) => {
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim() && selectedServer) {
      onSendMessage(inputValue.trim());
      setInputValue('');
    }
  };

  if (!selectedServer) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center text-green-400/50">
          <Terminal className="w-12 h-12 mx-auto mb-4" />
          <p className="text-lg mb-2">No server selected</p>
          <p className="text-sm">Select an MCP server to start communicating</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-green-400/30 bg-gray-800/50">
        <div className="flex items-center gap-3">
          <Terminal className="w-5 h-5 text-green-400" />
          <div>
            <h3 className="font-semibold text-green-400">{selectedServer.name}</h3>
            <p className="text-xs text-green-400/70">{selectedServer.url}</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center text-green-400/50 py-8">
            <p className="text-sm">No messages yet</p>
            <p className="text-xs mt-1">Send a message to start the conversation</p>
          </div>
        ) : (
          messages.map((message) => (
            <MessageRenderer key={message.id} message={message} />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-green-400/30 bg-gray-800/50">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={`Send message to ${selectedServer.name}...`}
            className="flex-1 bg-gray-700 border-green-400/30 text-green-400 placeholder:text-green-400/50 focus:border-green-400"
            disabled={selectedServer.status !== 'connected'}
          />
          <Button
            type="submit"
            disabled={!inputValue.trim() || selectedServer.status !== 'connected'}
            className="bg-green-600 hover:bg-green-500 text-gray-900"
          >
            <Send className="w-4 h-4" />
          </Button>
        </form>
        {selectedServer.status !== 'connected' && (
          <p className="text-xs text-yellow-400 mt-2">
            Connect to the server to send messages
          </p>
        )}
      </div>
    </div>
  );
};
