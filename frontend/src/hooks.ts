import { createReactQueryHooks } from '@rspc/react';
import { useColorScheme } from '@mantine/hooks';
import { useState } from 'react';
import { ColorScheme } from '@mantine/core';

import { Procedures } from './rspc/bindings';

export const rspc = createReactQueryHooks<Procedures>();

const reverseColorScheme = (colorScheme: ColorScheme): ColorScheme =>
  colorScheme === 'dark' ? 'light' : 'dark';

export const useColorSchemeCustom = () => {
  const [colorScheme, setColorScheme] = useState<ColorScheme | null>(null);
  const systemColorScheme = useColorScheme();
  const toggleColorScheme = (value?: ColorScheme) => {
    const newColorScheme =
      value ??
      (colorScheme
        ? reverseColorScheme(colorScheme)
        : reverseColorScheme(systemColorScheme));
    setColorScheme(newColorScheme);
  };

  return [colorScheme ?? systemColorScheme, toggleColorScheme] as const;
};
