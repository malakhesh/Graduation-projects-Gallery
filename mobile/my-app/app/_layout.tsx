import { ThemeProvider, useTheme } from '../context/ThemeContext';
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useEffect } from 'react';

function RootLayoutContent() {
  const { theme } = useTheme();

  useEffect(() => {
    // كل ما الثيم يتغير، الـ StatusBar يتحدث
    console.log('🔄 Theme changed to:', theme);
  }, [theme]);

  return (
    <SafeAreaProvider>
      <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />
      <Stack screenOptions={{ headerShown: false }} />
    </SafeAreaProvider>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <RootLayoutContent />
    </ThemeProvider>
  );
}