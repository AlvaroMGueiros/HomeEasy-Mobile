import { StatusBar } from 'expo-status-bar';
import { initialWindowMetrics, SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './src/auth/AuthContext'; import { AppNavigator } from './src/navigation/AppNavigator';
export default function App() { return <SafeAreaProvider initialMetrics={initialWindowMetrics}><AuthProvider><StatusBar style="dark" /><AppNavigator /></AuthProvider></SafeAreaProvider>; }
