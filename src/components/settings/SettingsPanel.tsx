
import { X, RotateCcw, Palette, Download, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useSettings } from '@/contexts/SettingsContext';
import { ColorPicker } from './ColorPicker';
import type { ColorTheme } from '@/contexts/SettingsContext';

export const SettingsPanel = () => {
  const { colors, updateComponentColors, resetColors, isSettingsOpen, setIsSettingsOpen } = useSettings();

  const exportSettings = () => {
    const settingsData = JSON.stringify(colors, null, 2);
    const blob = new Blob([settingsData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'mcp-terminal-theme.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const importSettings = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const importedColors = JSON.parse(e.target?.result as string);
          Object.entries(importedColors).forEach(([componentName, componentColors]) => {
            updateComponentColors(componentName as keyof typeof colors, componentColors as Partial<ColorTheme>);
          });
        } catch (error) {
          console.error('Failed to import settings:', error);
        }
      };
      reader.readAsText(file);
    }
  };

  if (!isSettingsOpen) return null;

  const componentDisplayNames = {
    header: 'Header',
    sidebar: 'Sidebar',
    messageArea: 'Message Area',
    statusBar: 'Status Bar'
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-6xl max-h-[90vh] overflow-hidden bg-gray-800 border-green-400/30">
        <CardHeader className="flex flex-row items-center justify-between border-b border-green-400/20">
          <div className="flex items-center gap-2">
            <Palette className="w-5 h-5 text-green-400" />
            <CardTitle className="text-green-400">Theme Customization</CardTitle>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={exportSettings}
              className="border-green-400/30 text-green-400 hover:bg-green-400/10"
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <label>
              <Button
                variant="outline"
                size="sm"
                className="border-green-400/30 text-green-400 hover:bg-green-400/10 cursor-pointer"
                asChild
              >
                <span>
                  <Upload className="w-4 h-4 mr-2" />
                  Import
                </span>
              </Button>
              <input
                type="file"
                accept=".json"
                onChange={importSettings}
                className="hidden"
              />
            </label>
            <Button
              variant="outline"
              size="sm"
              onClick={resetColors}
              className="border-green-400/30 text-green-400 hover:bg-green-400/10"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsSettingsOpen(false)}
              className="text-green-400 hover:bg-green-400/10"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          <Tabs defaultValue="header" className="w-full">
            <TabsList className="grid w-full grid-cols-4 bg-gray-700 mb-6">
              {Object.entries(componentDisplayNames).map(([key, displayName]) => (
                <TabsTrigger 
                  key={key} 
                  value={key}
                  className="text-green-400 data-[state=active]:bg-green-400/20 data-[state=active]:text-green-300"
                >
                  {displayName}
                </TabsTrigger>
              ))}
            </TabsList>

            {Object.entries(colors).map(([componentName, componentColors]) => (
              <TabsContent key={componentName} value={componentName} className="space-y-4">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-green-400 mb-4">
                    {componentDisplayNames[componentName as keyof typeof componentDisplayNames]} Colors
                  </h3>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {Object.entries(componentColors as ColorTheme).map(([colorKey, colorValue]) => (
                      <ColorPicker
                        key={`${componentName}-${colorKey}`}
                        label={colorKey}
                        value={colorValue as string}
                        onChange={(newColor) => 
                          updateComponentColors(componentName as keyof typeof colors, { [colorKey]: newColor })
                        }
                      />
                    ))}
                  </div>
                  
                  <div className="mt-6 p-4 bg-gray-900/50 rounded-lg border border-green-400/20">
                    <h4 className="text-sm font-medium text-green-400 mb-2">Preview</h4>
                    <div className={`p-3 rounded ${(componentColors as ColorTheme).background} ${(componentColors as ColorTheme).border} border`}>
                      <div className={`${(componentColors as ColorTheme).secondary} text-sm font-medium mb-1`}>
                        {componentDisplayNames[componentName as keyof typeof componentDisplayNames]} Component
                      </div>
                      <div className={`${(componentColors as ColorTheme).text} text-xs`}>
                        This is how your {componentName} will look with current settings
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};
