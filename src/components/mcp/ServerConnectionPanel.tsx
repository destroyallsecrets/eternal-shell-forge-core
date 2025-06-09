import { useState } from 'react';
import { Plus, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useSettings } from '@/contexts/SettingsContext';

interface ServerConnectionPanelProps {
  onServerAdd: (serverData: { name: string; url: string }) => void;
}

export const ServerConnectionPanel = ({ onServerAdd }: ServerConnectionPanelProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [formData, setFormData] = useState({ name: '', url: '' });
  const { colors } = useSettings();
  const sidebarColors = colors.sidebar;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name.trim() && formData.url.trim()) {
      onServerAdd(formData);
      setFormData({ name: '', url: '' });
      setIsExpanded(false);
    }
  };

  return (
    <div className={`${sidebarColors.background} ${sidebarColors.border} border-b`}>
      <div className="p-3 lg:p-4">
        <Button
          onClick={() => setIsExpanded(!isExpanded)}
          className={`w-full justify-start ${sidebarColors.text} hover:bg-green-400/10 text-sm lg:text-base`}
          variant="ghost"
        >
          <Plus className="w-3 h-3 lg:w-4 lg:h-4 mr-2" />
          Add Server
          <ChevronDown className={`w-3 h-3 lg:w-4 lg:h-4 ml-auto transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
        </Button>
        
        {isExpanded && (
          <form onSubmit={handleSubmit} className="mt-3 space-y-3">
            <Input
              placeholder="Server name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className={`bg-gray-700 ${sidebarColors.border} ${sidebarColors.text} placeholder:${sidebarColors.text}/50 text-sm`}
            />
            <Input
              placeholder="Server URL"
              value={formData.url}
              onChange={(e) => setFormData(prev => ({ ...prev, url: e.target.value }))}
              className={`bg-gray-700 ${sidebarColors.border} ${sidebarColors.text} placeholder:${sidebarColors.text}/50 text-sm`}
            />
            <Button 
              type="submit" 
              className="w-full bg-green-600 hover:bg-green-500 text-gray-900 text-sm"
              disabled={!formData.name.trim() || !formData.url.trim()}
            >
              Add Server
            </Button>
          </form>
        )}
      </div>
    </div>
  );
};
