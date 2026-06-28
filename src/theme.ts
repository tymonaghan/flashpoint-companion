import { createSystem, defaultConfig } from '@chakra-ui/react';

const customConfig = {
  theme: {
    tokens: {
      colors: {
        // Battleground base palette
        olive: {
          50: '#f5f4f0',
          100: '#e8e5de',
          200: '#d0ccc0',
          300: '#b8b0a4',
          400: '#a89e92',
          500: '#8b8680',
          600: '#6b6660',
          700: '#4a4540',
          800: '#2a2723',
          900: '#0f0f0c',
        },
        // Rust/burnt sienna (Red team - Sangheili/Elites)
        rust: {
          50: '#faf8f6',
          100: '#f0e8e5',
          200: '#d4a5a5',
          300: '#b88888',
          400: '#a06b6b',
          500: '#8b5454',
          600: '#6b4242',
          700: '#4d2f2f',
          800: '#3d2020',
          900: '#2a1515',
        },
        // Faded steel blue (Blue team - Spartans)
        steel: {
          50: '#f5f8fa',
          100: '#e8eef4',
          200: '#b8d4e8',
          300: '#8fa9bf',
          400: '#6b8599',
          500: '#4a6b7d',
          600: '#3d5a6c',
          700: '#2a4457',
          800: '#1f2d3a',
          900: '#151d26',
        },
      },
      fonts: {
        body: '"Courier New", "OCR A", monospace, system-ui, -apple-system, sans-serif',
        heading: '"Courier New", "OCR A", monospace, system-ui, -apple-system, sans-serif',
      },
    },
  },
};

export const system = createSystem(defaultConfig, customConfig);
