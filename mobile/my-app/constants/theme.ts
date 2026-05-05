// constants/theme.ts

import { Platform } from 'react-native';

// Light Mode (ألوانك الحالية)
const lightColors = {
  bg: 'rgb(223, 205, 192)',        // بيج فاتح
  white: 'rgb(254, 251, 245)',     // أبيض دافي
  black: 'rgb(47, 28, 15)',        // بني غامق
  link: 'rgb(164, 132, 109)',      // بني متوسط
  button: 'rgb(104, 68, 42)',      // بني داكن (للأزرار)
  input: 'rgb(185, 174, 167)',     // رمادي بيج
  border: 'rgb(220, 208, 198)',
  chip: 'rgb(237, 228, 218)',
  error: '#b94040',
  success: '#4CAF50',
  warning: '#FF9800',
  cardBg: 'rgb(254, 251, 245)',
};

// Dark Mode (نفس الألوان بس بدرجات أغمق)
const darkColors = {
  bg: 'rgb(50, 40, 35)',           // بيج غامق (بدل الفاتح)
  white: 'rgb(35, 28, 24)',        // أبيض غامق للكروت
  black: 'rgb(245, 240, 235)',     // بيج فاتح جداً للنص (بدل البني الغامق)
  link: 'rgb(190, 165, 145)',      // بني فاتح متوسط
  button: 'rgb(80, 55, 40)',       // بني أغمق من اللايت مود
  input: 'rgb(65, 50, 42)',        // إدخال أغمق
  border: 'rgb(80, 65, 55)',
  chip: 'rgb(70, 55, 48)',
  error: '#ff7a5c',
  success: '#6bcf7f',
  warning: '#ffb74d',
  cardBg: 'rgb(35, 28, 24)',       // نفس لون الكرت
};

const tintColorLight = '#0a7ea4';
const tintColorDark = '#fff';

export const Colors = {
  light: {
    text: lightColors.black,
    background: lightColors.bg,
    tint: tintColorLight,
    icon: lightColors.link,
    tabIconDefault: lightColors.link,
    tabIconSelected: lightColors.button,
    ...lightColors,
  },
  dark: {
    text: darkColors.black,
    background: darkColors.bg,
    tint: tintColorDark,
    icon: darkColors.link,
    tabIconDefault: darkColors.link,
    tabIconSelected: darkColors.button,
    ...darkColors,
  },
};

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});