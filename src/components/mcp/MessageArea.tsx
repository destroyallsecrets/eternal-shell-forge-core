import { useState, useRef, useEffect } from 'react';
import { Send, Terminal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MessageRenderer } from '@/components/common/MessageRenderer';
import { useSettings } from '@/contexts/SettingsContext';
import type { Message, MCPServer } from '@/pages/Index';

interface MessageAreaProps {
  messages: Message[];
  selectedServer: MCPServer | undefined;
  onSendMessage: (content: string) => void;
}

export const MessageArea = ({ messages, selectedServer, onSendMessage }: MessageAreaProps) => {
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { colors } = useSettings();
  const messageColors = colors.messageArea;

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
      <div className={`flex-1 flex items-center justify-center ${messageColors.background}`}>
        <div className={`text-center ${messageColors.secondary}/50`}>
          <Terminal className="w-12 h-12 mx-auto mb-4" />
          <p className="text-lg mb-2">No server selected</p>
          <p className="text-sm">Select an MCP server to start communicating</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex-1 flex flex-col ${messageColors.background}`}>
      {/* Header */}
      <div className={`p-3 lg:p-4 ${messageColors.border} border-b ${messageColors.surface}`}>
        <div className="flex items-center gap-3">
          <Terminal className={`w-4 h-4 lg:w-5 lg:h-5 ${messageColors.secondary}`} />
          <div className="min-w-0 flex-1">
            <h3 className={`font-semibold ${messageColors.secondary} text-sm lg:text-base truncate`}>{selectedServer.name}</h3>
            <p className={`text-xs ${messageColors.secondary}/70 truncate`}>{selectedServer.url}</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 lg:p-4 space-y-3 lg:space-y-4">
        {messages.length === 0 ? (
          <div className={`text-center ${messageColors.secondary}/50 py-8`}>
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
      <div className={`p-3 lg:p-4 ${messageColors.border} border-t ${messageColors.surface}`}>
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={`Send message to ${selectedServer.name}...`}
            className={`flex-1 bg-gray-700 ${messageColors.border} ${messageColors.text} placeholder:${messageColors.text}/50 focus:border-green-400 text-sm`}
            disabled={selectedServer.status !== 'connected'}
          />
          <Button
            type="submit"
            disabled={!inputValue.trim() || selectedServer.status !== 'connected'}
            className="bg-green-600 hover:bg-green-500 text-gray-900 px-3 lg:px-4"
            size="sm"
          >
            <Send className="w-3 h-3 lg:w-4 lg:h-4" />
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
