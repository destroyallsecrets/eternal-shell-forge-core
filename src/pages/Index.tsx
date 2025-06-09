import { useState, useEffect } from 'react';
import { ServerConnectionPanel } from '@/components/mcp/ServerConnectionPanel';
import { ServerList } from '@/components/mcp/ServerList';
import { MessageArea } from '@/components/mcp/MessageArea';
import { Header } from '@/components/layout/Header';
import { StatusBar } from '@/components/layout/StatusBar';
import { SettingsPanel } from '@/components/settings/SettingsPanel';
import { SettingsProvider } from '@/contexts/SettingsContext';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
import { MCPStorage } from '@/lib/storage';
import { MCPConnectionManager } from '@/lib/mcp/connection-manager';
import { MCPServer, Message } from '@/types';

// Remove local type definitions since we're importing from types file

const Index = () => {
  const [servers, setServers] = useState<MCPServer[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedServerId, setSelectedServerId] = useState<string | null>(null);
  const storage = MCPStorage.getInstance();
  const connectionManager = new MCPConnectionManager({
    maxConnections: 10,
    retryDelay: 5000,
    maxRetries: 3
  });

  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Initialize storage and connections
        const storedServers = await storage.getServers();
        setServers(storedServers);
        
        // Initialize connection manager
        await connectionManager.initialize();
      } catch (error) {
        console.error('Failed to initialize application:', error);
      }
    };

    initializeApp();
  }, []);

  const handleServerAdd = async (serverData: { name: string; url: string }) => {
    const newServer: MCPServer = {
      id: Date.now().toString(),
      name: serverData.name,
      url: serverData.url,
      status: 'disconnected'
    };
    
    try {
      await storage.addServer(newServer);
      setServers(prev => [...prev, newServer]);
    } catch (error) {
      console.error('Failed to add server:', error);
    }
  };

  const handleServerConnect = async (serverId: string) => {
    try {
      const server = servers.find(s => s.id === serverId);
      if (!server) return;

      await connectionManager.connect(server);
      const updatedServer = await storage.getServers().then(servers => 
        servers.find(s => s.id === serverId)
      );
      
      if (updatedServer) {
        setServers(prev => 
          prev.map(s => (s.id === serverId ? { ...updatedServer } : s))
        );
      }
    } catch (error) {
      console.error('Failed to connect to server:', error);
    }
  };

  const handleServerDisconnect = (serverId: string) => {
    connectionManager.disconnect(serverId, servers);
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
    
    connectionManager.sendMessage(selectedServerId, content);
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
