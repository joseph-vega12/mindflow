import { extendTheme } from '@chakra-ui/react';

import { FormLabel } from './components';

import { borders, breakpoints, colors, fonts, fontSizes, fontWeights, radii, shadows, space } from './foundations';

import { textStyles } from './styles';

export const theme = extendTheme({
  // Foundations
  borders,
  breakpoints,
  colors,
  radii,
  shadows,
  space,

  // Typography
  fonts,
  fontSizes,
  fontWeights,

  // Layer
  textStyles,

  // Components
  components: {
    // @ts-ignore
    FormLabel
  }
});

// export const system = createSystem(defaultConfig, {
//   theme: {
//     tokens: {
//       // Foundations
//       borders: borders,
//       breakpoints: breakpoints,
//       colors: colors,
//       radii: radii,
//       shadows: shadows,
//       spacing: spacing,

//       // Typography
//       fonts: fonts,
//       fontSizes: fontSizes,
//       fontWeights: fontWeights,

//     },
//     // Layer
//     textStyles: textStyles,
//   },
// })
