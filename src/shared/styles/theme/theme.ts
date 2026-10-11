import { createTheme, type MantineColorsTuple } from '@mantine/core';

const competitionBlue: MantineColorsTuple = [
  '#e8f0fb', '#cfdff5', '#a3c1ea', '#74a1df', '#4d86d5',
  '#3474cf', '#1f5fb3', '#1a529c', '#14447f', '#0e3563',
];

export const theme = createTheme({
  primaryColor: 'competition',
  colors: { competition: competitionBlue },
  primaryShade: { light: 6, dark: 4 },
  fontFamily: '"IBM Plex Sans", system-ui, -apple-system, "Segoe UI", sans-serif',
  fontFamilyMonospace: '"IBM Plex Mono", ui-monospace, Consolas, monospace',
  headings: {
    fontFamily: '"Big Shoulders Display", "Arial Narrow", "Roboto Condensed", sans-serif',
    fontWeight: '800',
  },
  defaultRadius: 'md',
  cursorType: 'pointer',
  respectReducedMotion: true,
});
