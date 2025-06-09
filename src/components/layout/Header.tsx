
import { Terminal, Zap } from 'lucide-react';

export const Header = () => {
  return (
    <header className="bg-gray-800 border-b border-green-400/30 p-4">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <Terminal className="w-6 h-6 text-green-400" />
          <Zap className="w-4 h-4 text-yellow-400" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-green-400">MCP Terminal</h1>
          <p className="text-xs text-green-400/70">Model Context Protocol Client v1.0.0</p>
        </div>
      </div>
    </header>
  );
};
