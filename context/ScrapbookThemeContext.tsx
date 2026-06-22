import React, { createContext, useContext, useState, ReactNode } from 'react';

export type ScrapbookTheme = 'Neon Pop' | 'Kraft Paper' | 'Pastel Dream' | 'Monochrome Sketch';

export interface ScrapbookThemeColors {
  background: string;
  paperColor: string;
  dotColor: string;
  border: string;
  text: string;
  primary: string;
  secondary: string;
  tapePink: string;
  tapeBlue: string;
  tapeGreen: string;
  accentStar: string;
}

export const SCRAPBOOK_THEMES: Record<ScrapbookTheme, ScrapbookThemeColors> = {
  'Neon Pop': {
    background: '#121212',
    paperColor: '#1e1e24',
    dotColor: 'rgba(0, 240, 255, 0.3)',
    border: '#000000',
    text: '#ffffff',
    primary: '#FFB300', // high-contrast amber
    secondary: '#FF007F', // neon pink
    tapePink: 'rgba(255, 0, 127, 0.7)',
    tapeBlue: 'rgba(0, 240, 255, 0.7)',
    tapeGreen: 'rgba(57, 255, 20, 0.7)',
    accentStar: '#FFB300',
  },
  'Kraft Paper': {
    background: '#F4EBE1', // warm cream
    paperColor: '#FAF5EF',
    dotColor: '#D8C3A5',
    border: '#5C4033', // deep brown
    text: '#3D2314', // dark brown
    primary: '#E6D5C3', // kraft brown
    secondary: '#C4A484', // cardboard
    tapePink: 'rgba(216, 112, 147, 0.5)',
    tapeBlue: 'rgba(135, 206, 235, 0.5)',
    tapeGreen: 'rgba(188, 143, 143, 0.5)',
    accentStar: '#D2B48C',
  },
  'Pastel Dream': {
    background: '#FFF0F5', // lavender blush
    paperColor: '#FFF9FC',
    dotColor: '#FFB7D5',
    border: '#4B0082', // indigo
    text: '#2C1E3C', // deep purple
    primary: '#E6E6FA', // lavender
    secondary: '#FFD1DC', // pastel pink
    tapePink: 'rgba(255, 182, 193, 0.6)',
    tapeBlue: 'rgba(173, 216, 230, 0.6)',
    tapeGreen: 'rgba(152, 251, 152, 0.6)',
    accentStar: '#FFD700',
  },
  'Monochrome Sketch': {
    background: '#FFFFFF', // rough white sketch paper
    paperColor: '#F6F6F6',
    dotColor: '#CCCCCC',
    border: '#000000', // thick pencil black
    text: '#000000',
    primary: '#FFFFFF',
    secondary: '#E0E0E0',
    tapePink: 'rgba(200, 200, 200, 0.6)',
    tapeBlue: 'rgba(160, 160, 160, 0.6)',
    tapeGreen: 'rgba(220, 220, 220, 0.6)',
    accentStar: '#000000',
  },
};

interface ScrapbookThemeContextProps {
  theme: ScrapbookTheme;
  setTheme: (theme: ScrapbookTheme) => void;
  colors: ScrapbookThemeColors;
}

const ScrapbookThemeContext = createContext<ScrapbookThemeContextProps | undefined>(undefined);

export const ScrapbookThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<ScrapbookTheme>('Kraft Paper');

  const colors = SCRAPBOOK_THEMES[theme];

  return (
    <ScrapbookThemeContext.Provider value={{ theme, setTheme, colors }}>
      {children}
    </ScrapbookThemeContext.Provider>
  );
};

export const useScrapbookTheme = () => {
  const context = useContext(ScrapbookThemeContext);
  if (!context) {
    throw new Error('useScrapbookTheme must be used within a ScrapbookThemeProvider');
  }
  return context;
};
