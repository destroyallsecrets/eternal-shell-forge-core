
import { Terminal, Zap, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSettings } from '@/contexts/SettingsContext';

export const Header = () => {
  const { colors, setIsSettingsOpen } = useSettings();
  const headerColors = colors.header;

  return (
    <header className={`${headerColors.background} ${headerColors.border} border-b p-4`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Terminal className={`w-6 h-6 ${headerColors.secondary}`} />
            <Zap className={`w-4 h-4 ${headerColors.accent}`} />
          </div>
          <div>
            <h1 className={`text-xl font-bold ${headerColors.secondary}`}>MCP Terminal</h1>
            <p className={`text-xs ${headerColors.secondary}/70`}>Model Context Protocol Client v1.0.0</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsSettingsOpen(true)}
          className={`${headerColors.text} hover:bg-green-400/10`}
        >
          <Settings className="w-4 h-4" />
        </Button>
      </div>
    </header>
  );
};
