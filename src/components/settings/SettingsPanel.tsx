
import { X, RotateCcw, Palette } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useSettings } from '@/contexts/SettingsContext';
import { ColorPicker } from './ColorPicker';

export const SettingsPanel = () => {
  const { colors, updateComponentColors, resetColors, isSettingsOpen, setIsSettingsOpen } = useSettings();

  if (!isSettingsOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-gray-800 border-green-400/30">
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <Palette className="w-5 h-5 text-green-400" />
            <CardTitle className="text-green-400">Settings</CardTitle>
          </div>
          <div className="flex gap-2">
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
        <CardContent className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-green-400 mb-4">Color Customization</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Object.entries(colors).map(([componentName, componentColors]) => (
                <div key={componentName} className="space-y-3">
                  <h4 className="font-medium text-green-300 capitalize">{componentName.replace(/([A-Z])/g, ' $1')}</h4>
                  <div className="space-y-2">
                    {Object.entries(componentColors).map(([colorKey, colorValue]) => (
                      <ColorPicker
                        key={`${componentName}-${colorKey}`}
                        label={colorKey}
                        value={colorValue}
                        onChange={(newColor) => 
                          updateComponentColors(componentName as keyof typeof colors, { [colorKey]: newColor })
                        }
                      />
                    ))}
                  </div>
                  <Separator className="bg-green-400/20" />
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
