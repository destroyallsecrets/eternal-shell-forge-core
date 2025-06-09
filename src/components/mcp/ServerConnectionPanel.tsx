
import { useState } from 'react';
import { Plus, Server } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface ServerConnectionPanelProps {
  onServerAdd: (serverData: { name: string; url: string }) => void;
}

export const ServerConnectionPanel = ({ onServerAdd }: ServerConnectionPanelProps) => {
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() && url.trim()) {
      onServerAdd({ name: name.trim(), url: url.trim() });
      setName('');
      setUrl('');
    }
  };

  return (
    <div className="p-4 border-b border-green-400/30">
      <div className="flex items-center gap-2 mb-4">
        <Server className="w-4 h-4 text-green-400" />
        <h2 className="text-sm font-semibold text-green-400">Add MCP Server</h2>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <Label htmlFor="server-name" className="text-xs text-green-400/80">
            Server Name
          </Label>
          <Input
            id="server-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="My MCP Server"
            className="mt-1 bg-gray-700 border-green-400/30 text-green-400 placeholder:text-green-400/50 focus:border-green-400"
          />
        </div>
        
        <div>
          <Label htmlFor="server-url" className="text-xs text-green-400/80">
            Server URL
          </Label>
          <Input
            id="server-url"
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="ws://localhost:8080"
            className="mt-1 bg-gray-700 border-green-400/30 text-green-400 placeholder:text-green-400/50 focus:border-green-400"
          />
        </div>
        
        <Button 
          type="submit" 
          className="w-full bg-green-600 hover:bg-green-500 text-gray-900 font-semibold"
          disabled={!name.trim() || !url.trim()}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Server
        </Button>
      </form>
    </div>
  );
};
