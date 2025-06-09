
import { Trash2, Wifi, WifiOff, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { MCPServer } from '@/pages/Index';

interface ServerListProps {
  servers: MCPServer[];
  selectedServerId: string | null;
  onServerSelect: (serverId: string) => void;
  onServerConnect: (serverId: string) => void;
  onServerDisconnect: (serverId: string) => void;
  onServerRemove: (serverId: string) => void;
}

export const ServerList = ({
  servers,
  selectedServerId,
  onServerSelect,
  onServerConnect,
  onServerDisconnect,
  onServerRemove
}: ServerListProps) => {
  const getStatusIcon = (status: MCPServer['status']) => {
    switch (status) {
      case 'connected':
        return <Wifi className="w-4 h-4 text-green-400" />;
      case 'connecting':
        return <Loader2 className="w-4 h-4 text-yellow-400 animate-spin" />;
      default:
        return <WifiOff className="w-4 h-4 text-red-400" />;
    }
  };

  const getStatusColor = (status: MCPServer['status']) => {
    switch (status) {
      case 'connected':
        return 'text-green-400';
      case 'connecting':
        return 'text-yellow-400';
      default:
        return 'text-red-400';
    }
  };

  return (
    <div className="flex-1 p-4">
      <h3 className="text-sm font-semibold text-green-400 mb-3">
        MCP Servers ({servers.length})
      </h3>
      
      <div className="space-y-2">
        {servers.map((server) => (
          <div
            key={server.id}
            className={`border rounded p-3 cursor-pointer transition-colors ${
              selectedServerId === server.id
                ? 'border-green-400 bg-green-400/10'
                : 'border-green-400/30 hover:border-green-400/50'
            }`}
            onClick={() => onServerSelect(server.id)}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                {getStatusIcon(server.status)}
                <span className="font-medium">{server.name}</span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation();
                  onServerRemove(server.id);
                }}
                className="h-6 w-6 text-red-400 hover:text-red-300 hover:bg-red-400/10"
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            </div>
            
            <div className="text-xs text-green-400/70 mb-2">
              {server.url}
            </div>
            
            <div className="flex items-center justify-between">
              <span className={`text-xs ${getStatusColor(server.status)}`}>
                {server.status.charAt(0).toUpperCase() + server.status.slice(1)}
              </span>
              
              {server.status === 'connected' ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onServerDisconnect(server.id);
                  }}
                  className="h-6 text-xs border-red-400/50 text-red-400 hover:bg-red-400/10"
                >
                  Disconnect
                </Button>
              ) : server.status === 'disconnected' ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onServerConnect(server.id);
                  }}
                  className="h-6 text-xs border-green-400/50 text-green-400 hover:bg-green-400/10"
                >
                  Connect
                </Button>
              ) : null}
            </div>
            
            {server.lastConnected && (
              <div className="text-xs text-green-400/50 mt-1">
                Last connected: {server.lastConnected.toLocaleTimeString()}
              </div>
            )}
          </div>
        ))}
        
        {servers.length === 0 && (
          <div className="text-center py-8 text-green-400/50">
            <p className="text-sm">No MCP servers configured</p>
            <p className="text-xs mt-1">Add a server to get started</p>
          </div>
        )}
      </div>
    </div>
  );
};
