
import { createContext, useContext, useState, ReactNode } from 'react';

export interface ColorTheme {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  text: string;
  border: string;
}

export interface ComponentColors {
  header: ColorTheme;
  sidebar: ColorTheme;
  messageArea: ColorTheme;
  statusBar: ColorTheme;
}

const defaultColors: ComponentColors = {
  header: {
    primary: 'bg-gray-800',
    secondary: 'text-green-400',
    accent: 'text-yellow-400',
    background: 'bg-gray-800',
    surface: 'bg-gray-700',
    text: 'text-green-400',
    border: 'border-green-400/30'
  },
  sidebar: {
    primary: 'bg-gray-800/50',
    secondary: 'text-green-400',
    accent: 'text-yellow-400',
    background: 'bg-gray-800/50',
    surface: 'bg-gray-700',
    text: 'text-green-400',
    border: 'border-green-400/30'
  },
  messageArea: {
    primary: 'bg-gray-900',
    secondary: 'text-green-400',
    accent: 'text-yellow-400',
    background: 'bg-gray-900',
    surface: 'bg-gray-800/50',
    text: 'text-green-400',
    border: 'border-green-400/30'
  },
  statusBar: {
    primary: 'bg-gray-800',
    secondary: 'text-green-400',
    accent: 'text-yellow-400',
    background: 'bg-gray-800',
    surface: 'bg-gray-700',
    text: 'text-green-400',
    border: 'border-green-400/30'
  }
};

interface SettingsContextType {
  colors: ComponentColors;
  updateComponentColors: (component: keyof ComponentColors, colors: Partial<ColorTheme>) => void;
  resetColors: () => void;
  isSettingsOpen: boolean;
  setIsSettingsOpen: (open: boolean) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};

interface SettingsProviderProps {
  children: ReactNode;
}

export const SettingsProvider = ({ children }: SettingsProviderProps) => {
  const [colors, setColors] = useState<ComponentColors>(defaultColors);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const updateComponentColors = (component: keyof ComponentColors, newColors: Partial<ColorTheme>) => {
    setColors(prev => ({
      ...prev,
      [component]: {
        ...prev[component],
        ...newColors
      }
    }));
  };

  const resetColors = () => {
    setColors(defaultColors);
  };

  return (
    <SettingsContext.Provider value={{
      colors,
      updateComponentColors,
      resetColors,
      isSettingsOpen,
      setIsSettingsOpen
    }}>
      {children}
    </SettingsContext.Provider>
  );
};
