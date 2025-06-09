import { useState } from 'react';
import { ServerConnectionPanel } from '@/components/mcp/ServerConnectionPanel';
import { ServerList } from '@/components/mcp/ServerList';
import { MessageArea } from '@/components/mcp/MessageArea';
import { Header } from '@/components/layout/Header';
import { StatusBar } from '@/components/layout/StatusBar';
import { SettingsPanel } from '@/components/settings/SettingsPanel';
import { SettingsProvider } from '@/contexts/SettingsContext';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';

export interface MCPServer {
  id: string;
  name: string;
  url: string;
  status: 'connected' | 'disconnected' | 'connecting';
  lastConnected?: Date;
}

export interface Message {
  id: string;
  serverId: string;
  type: 'request' | 'response' | 'error' | 'info';
  content: string;
  timestamp: Date;
}

const Index = () => {
  const [servers, setServers] = useState<MCPServer[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedServerId, setSelectedServerId] = useState<string | null>(null);

  const handleServerAdd = (serverData: { name: string; url: string }) => {
    const newServer: MCPServer = {
      id: Date.now().toString(),
      name: serverData.name,
      url: serverData.url,
      status: 'disconnected'
    };
    setServers(prev => [...prev, newServer]);
  };

  const handleServerConnect = (serverId: string) => {
    setServers(prev => prev.map(server => 
      server.id === serverId 
        ? { ...server, status: 'connecting' }
        : server
    ));
    
    // Simulate connection process
    setTimeout(() => {
      setServers(prev => prev.map(server => 
        server.id === serverId 
          ? { ...server, status: 'connected', lastConnected: new Date() }
          : server
      ));
      
      // Add connection success message
      const connectionMessage: Message = {
        id: Date.now().toString(),
        serverId,
        type: 'info',
        content: `Successfully connected to MCP server`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, connectionMessage]);
    }, 2000);
  };

  const handleServerDisconnect = (serverId: string) => {
    setServers(prev => prev.map(server => 
      server.id === serverId 
        ? { ...server, status: 'disconnected' }
        : server
    ));
  };

  const handleServerRemove = (serverId: string) => {
    setServers(prev => prev.filter(server => server.id !== serverId));
    setMessages(prev => prev.filter(message => message.serverId !== serverId));
    if (selectedServerId === serverId) {
      setSelectedServerId(null);
    }
  };

  const handleSendMessage = (content: string) => {
    if (!selectedServerId) return;
    
    const requestMessage: Message = {
      id: Date.now().toString(),
      serverId: selectedServerId,
      type: 'request',
      content,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, requestMessage]);
    
    // Simulate server response
    setTimeout(() => {
      const responseMessage: Message = {
        id: (Date.now() + 1).toString(),
        serverId: selectedServerId,
        type: 'response',
        content: `## Server Response\n\nReceived your message: "${content}"\n\n**Status:** Processing complete\n\n*This is a simulated MCP server response with Markdown formatting.*`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, responseMessage]);
    }, 1000);
  };

  const selectedServer = servers.find(s => s.id === selectedServerId);
  const filteredMessages = selectedServerId 
    ? messages.filter(m => m.serverId === selectedServerId)
    : [];

  return (
    <SettingsProvider>
      <div className="min-h-screen bg-gray-900 text-green-400 font-mono flex flex-col">
        <Header />
        
        <ResizablePanelGroup direction="horizontal" className="flex-1 border-t border-green-400/30">
          {/* Left Panel - Server Management */}
          <ResizablePanel defaultSize={25} minSize={20} maxSize={40}>
            <div className="h-full border-r border-green-400/30 flex flex-col bg-gray-800/50">
              <ServerConnectionPanel onServerAdd={handleServerAdd} />
              <ServerList 
                servers={servers}
                selectedServerId={selectedServerId}
                onServerSelect={setSelectedServerId}
                onServerConnect={handleServerConnect}
                onServerDisconnect={handleServerDisconnect}
                onServerRemove={handleServerRemove}
              />
            </div>
          </ResizablePanel>
          
          <ResizableHandle withHandle />
          
          {/* Right Panel - Message Area */}
          <ResizablePanel defaultSize={75}>
            <div className="h-full flex flex-col">
              <MessageArea 
                messages={filteredMessages}
                selectedServer={selectedServer}
                onSendMessage={handleSendMessage}
              />
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
        
        <StatusBar 
          serverCount={servers.length}
          connectedCount={servers.filter(s => s.status === 'connected').length}
        />
        
        <SettingsPanel />
      </div>
    </SettingsProvider>
  );
};

export default Index;
