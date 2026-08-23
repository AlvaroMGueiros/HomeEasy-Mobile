import { NavigatorScreenParams } from '@react-navigation/native';

export type AppTabParamList = { Home: undefined; Requests: undefined; Conversations: undefined; Profile: undefined; };
export type RootStackParamList = { Login: undefined; App: NavigatorScreenParams<AppTabParamList>; Services: undefined; Professional: { professionalId: string }; Opportunities: undefined; Notifications: undefined; };
