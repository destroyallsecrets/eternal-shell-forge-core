
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface ColorPickerProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
}

const colorPresets = [
  'bg-gray-800', 'bg-gray-900', 'bg-green-800', 'bg-blue-800', 'bg-purple-800',
  'text-green-400', 'text-blue-400', 'text-purple-400', 'text-yellow-400', 'text-red-400',
  'border-green-400/30', 'border-blue-400/30', 'border-purple-400/30', 'border-yellow-400/30'
];

export const ColorPicker = ({ label, value, onChange }: ColorPickerProps) => {
  return (
    <div className="space-y-2">
      <Label className="text-sm text-green-400/80 capitalize">{label}</Label>
      <div className="flex gap-2">
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 bg-gray-700 border-green-400/30 text-green-400 text-xs"
          placeholder="e.g., bg-gray-800"
        />
        <div className="flex gap-1 flex-wrap">
          {colorPresets.filter(preset => preset.includes(label.includes('bg') ? 'bg-' : label.includes('text') ? 'text-' : 'border-')).slice(0, 3).map((preset) => (
            <button
              key={preset}
              onClick={() => onChange(preset)}
              className={`w-6 h-6 rounded border border-green-400/30 ${preset} ${value === preset ? 'ring-2 ring-green-400' : ''}`}
              title={preset}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
