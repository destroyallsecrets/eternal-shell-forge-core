
import { Activity, Wifi, WifiOff } from 'lucide-react';
import { useSettings } from '@/contexts/SettingsContext';

interface StatusBarProps {
  serverCount: number;
  connectedCount: number;
}

export const StatusBar = ({ serverCount, connectedCount }: StatusBarProps) => {
  const { colors } = useSettings();
  const statusColors = colors.statusBar;

  return (
    <footer className={`${statusColors.background} ${statusColors.border} border-t p-2 text-xs`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <Activity className="w-3 h-3" />
            <span>Ready</span>
          </div>
          <div className="flex items-center gap-1">
            {connectedCount > 0 ? (
              <Wifi className="w-3 h-3 text-green-400" />
            ) : (
              <WifiOff className="w-3 h-3 text-red-400" />
            )}
            <span>{connectedCount}/{serverCount} Connected</span>
          </div>
        </div>
        <div className={`${statusColors.secondary}/70`}>
          {new Date().toLocaleTimeString()}
        </div>
      </div>
    </footer>
  );
};
