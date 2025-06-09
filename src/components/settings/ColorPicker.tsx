
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Palette } from 'lucide-react';

interface ColorPickerProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
}

const colorPresets = {
  backgrounds: [
    'bg-gray-800', 'bg-gray-900', 'bg-slate-800', 'bg-zinc-800', 'bg-neutral-800',
    'bg-green-900/20', 'bg-blue-900/20', 'bg-purple-900/20', 'bg-red-900/20'
  ],
  text: [
    'text-green-400', 'text-blue-400', 'text-purple-400', 'text-yellow-400', 
    'text-cyan-400', 'text-orange-400', 'text-pink-400', 'text-emerald-400'
  ],
  borders: [
    'border-green-400/30', 'border-blue-400/30', 'border-purple-400/30', 
    'border-yellow-400/30', 'border-cyan-400/30', 'border-orange-400/30'
  ],
  surfaces: [
    'bg-gray-700', 'bg-slate-700', 'bg-zinc-700', 'bg-green-800/30',
    'bg-blue-800/30', 'bg-purple-800/30', 'bg-yellow-800/30'
  ]
};

const getPresetCategory = (label: string) => {
  if (label.includes('background') || label.includes('primary')) return 'backgrounds';
  if (label.includes('text') || label.includes('secondary')) return 'text';
  if (label.includes('border')) return 'borders';
  if (label.includes('surface')) return 'surfaces';
  return 'backgrounds';
};

const formatLabel = (label: string) => {
  return label.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
};

export const ColorPicker = ({ label, value, onChange }: ColorPickerProps) => {
  const category = getPresetCategory(label);
  const presets = colorPresets[category];

  return (
    <div className="space-y-3 p-3 bg-gray-800/50 rounded-lg border border-green-400/20">
      <div className="flex items-center gap-2">
        <Palette className="w-4 h-4 text-green-400" />
        <Label className="text-sm font-medium text-green-400">{formatLabel(label)}</Label>
      </div>
      
      <div className="space-y-3">
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="bg-gray-700 border-green-400/30 text-green-400 text-sm"
          placeholder="Enter Tailwind class..."
        />
        
        <div className="space-y-2">
          <Label className="text-xs text-green-400/70 uppercase tracking-wider">Quick Presets</Label>
          <div className="grid grid-cols-4 gap-2">
            {presets.map((preset) => (
              <Button
                key={preset}
                onClick={() => onChange(preset)}
                variant="ghost"
                size="sm"
                className={`h-8 text-xs ${preset} ${
                  value === preset 
                    ? 'ring-2 ring-green-400 ring-offset-1 ring-offset-gray-800' 
                    : 'hover:ring-1 hover:ring-green-400/50'
                } ${preset.includes('text-') ? 'bg-gray-700' : ''}`}
                title={preset}
              >
                {preset.includes('text-') ? 'Aa' : ''}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
