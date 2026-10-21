import { Feather } from "@expo/vector-icons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import {
  createNavigationContainerRef,
  NavigationContainer,
} from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import * as Notifications from "expo-notifications";
import { useCallback, useEffect } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useAuth } from "../auth/AuthContext";
import { WelcomeGuideModal } from "../components/ui/WelcomeGuideModal";
import { GettingStartedGoal } from "../config/gettingStarted";
import { CityProfessionalsScreen } from "../screens/CityProfessionalsScreen";
import { AboutScreen } from "../screens/AboutScreen";
import { AdminScreen } from "../screens/AdminScreen";
import { BecomeProfessionalScreen } from "../screens/BecomeProfessionalScreen";
import { ChatScreen } from "../screens/ChatScreen";
import { CommunityRulesScreen } from "../screens/CommunityRulesScreen";
import { CommunityRulesGate } from "../components/ui/CommunityRulesGate";
import { ContactScreen } from "../screens/ContactScreen";
import { ConversationsScreen } from "../screens/ConversationsScreen";
import { DeleteAccountScreen } from "../screens/DeleteAccountScreen";
import { DisputeScreen } from "../screens/DisputeScreen";
import { EditProfileScreen } from "../screens/EditProfileScreen";
import { FavoritesScreen } from "../screens/FavoritesScreen";
import { ForgotPasswordScreen } from "../screens/ForgotPasswordScreen";
import { FullPrivacyPolicyScreen } from "../screens/FullPrivacyPolicyScreen";
import { HighlightsScreen } from '../screens/HighlightsScreen';
import { MyHighlightsScreen } from '../screens/MyHighlightsScreen';
import { CreateHighlightScreen } from '../screens/CreateHighlightScreen';
import { HighlightsModerationScreen } from '../screens/HighlightsModerationScreen';
import { HomeScreen } from "../screens/HomeScreen";
import { HowItWorksScreen } from "../screens/HowItWorksScreen";
import { LoginScreen } from "../screens/LoginScreen";
import { NotificationPreferencesScreen } from '../screens/NotificationPreferencesScreen';
import { NotificationsScreen } from "../screens/NotificationsScreen";
import { OpportunitiesScreen } from "../screens/OpportunitiesScreen";
import { OrderDetailScreen } from "../screens/OrderDetailScreen";
import { PrivacyPolicyScreen } from "../screens/PrivacyPolicyScreen";
import { ProfessionalManagerScreen } from "../screens/ProfessionalManagerScreen";
import { ProfessionalDashboardScreen } from "../screens/ProfessionalDashboardScreen";
import { ProfessionalReviewsScreen } from "../screens/ProfessionalReviewsScreen";
import { ProfessionalScreen } from "../screens/ProfessionalScreen";
import { ProfileScreen } from "../screens/ProfileScreen";
import { ProposalFormScreen } from "../screens/ProposalFormScreen";
import { PublicHomeScreen } from "../screens/PublicHomeScreen";
import { RegionalMapScreen } from "../screens/RegionalMapScreen";
import { ServiceAddressMapScreen } from "../screens/ServiceAddressMapScreen";
import { ReportScreen } from "../screens/ReportScreen";
import { RequestDetailScreen } from "../screens/RequestDetailScreen";
import { RequestFormScreen } from "../screens/RequestFormScreen";
import { RequestsScreen } from "../screens/RequestsScreen";
import { ResetPasswordScreen } from "../screens/ResetPasswordScreen";
import { ScheduleScreen } from "../screens/ScheduleScreen";
import { ServiceProfessionalsScreen } from "../screens/ServiceProfessionalsScreen";
import { ServicesScreen } from "../screens/ServicesScreen";
import { SplashScreen } from "../screens/SplashScreen";
import { VerificationScreen } from "../screens/VerificationScreen";
import { colors } from "../theme/colors";
import { fontFamilies } from "../theme/typography";
import { requestLocationAccess } from "../utils/location-permission";
import {
  readNotificationActionUrl,
  registerPushNotifications,
} from "../notifications/push-notifications";
import { resolveNotificationAction } from "../utils/notification-action";
import { AppTabParamList, RootStackParamList } from "./types";

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tabs = createBottomTabNavigator<AppTabParamList>();
const navigationRef = createNavigationContainerRef<RootStackParamList>();
const tabIcons: Record<keyof AppTabParamList, keyof typeof Feather.glyphMap> = {
  Home: "home",
  Requests: "clipboard",
  Highlights: "star",
  Conversations: "message-circle",
  Profile: "user",
};

function AppTabs() {
  const insets = useSafeAreaInsets();
  return (
    <Tabs.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarLabelStyle: { fontFamily: fontFamilies.semiBold, fontSize: 10 },
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          height: 68 + insets.bottom,
          paddingTop: 8,
          paddingBottom: 8 + insets.bottom,
          borderTopColor: colors.border,
          backgroundColor: colors.surface,
        },
        tabBarIcon: ({ color, size }) => (
          <Feather name={tabIcons[route.name]} color={color} size={size} />
        ),
      })}
    >
      <Tabs.Screen
        name="Home"
        component={HomeScreen}
        options={{ title: "Início" }}
      />
      <Tabs.Screen
        name="Requests"
        component={RequestsScreen}
        options={{ title: "Meus serviços" }}
      />
      <Tabs.Screen name="Highlights" component={HighlightsScreen} options={{ title: "Destaques" }} />
      <Tabs.Screen
        name="Conversations"
        component={ConversationsScreen}
        options={{ title: "Mensagens" }}
      />
      <Tabs.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ title: "Perfil" }}
      />
    </Tabs.Navigator>
  );
}

export function AppNavigator() {
  const { user, loading, logout } = useAuth();
  const openNotification = useCallback(
    (actionUrl?: string) => {
      if (!user || !navigationRef.isReady()) return;
      const action = resolveNotificationAction(actionUrl);
      if (action.type === "request")
        navigationRef.navigate("RequestDetail", { requestId: action.id });
      else if (action.type === "order")
        navigationRef.navigate("OrderDetail", { orderId: action.id });
      else if (action.type === "professional")
        navigationRef.navigate("Professional", { professionalId: action.id });
      else if (action.type === "conversations")
        navigationRef.navigate("App", { screen: "Conversations" });
      else navigationRef.navigate("App", { screen: "Requests" });
    },
    [user],
  );

  useEffect(() => {
    if (!loading) void requestLocationAccess().catch(() => undefined);
  }, [loading]);

  useEffect(() => {
    if (!user) return;
    void requestLocationAccess().catch(() => false).then(() => registerPushNotifications()).catch(() => undefined);

    const responseSubscription =
      Notifications.addNotificationResponseReceivedListener((response) => {
        openNotification(readNotificationActionUrl(response));
      });
    void Notifications.getLastNotificationResponseAsync().then((response) => {
      if (!response) return;
      openNotification(readNotificationActionUrl(response));
      return Notifications.clearLastNotificationResponseAsync();
    });
    return () => responseSubscription.remove();
  }, [openNotification, user]);

  if (loading) return <SplashScreen />;
  return (
    <NavigationContainer ref={navigationRef} linking={{ prefixes: ['homeeasy://'], config: { screens: { Professional: 'professionals/:professionalId', PublicHome: '' } } }}>
      <Stack.Navigator
        screenOptions={{
          headerTintColor: colors.primary,
          headerTitleStyle: { fontFamily: fontFamilies.bold },
          headerShadowVisible: false,
          headerStyle: { backgroundColor: colors.background },
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        {user ? (
          <Stack.Screen
            name="App"
            component={AppTabs}
            options={{ headerShown: false }}
          />
        ) : (
          <Stack.Screen
            name="PublicHome"
            component={PublicHomeScreen}
            options={{ headerShown: false }}
          />
        )}
        {!user && (
          <>
            <Stack.Screen
              name="Login"
              component={LoginScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="ForgotPassword"
              component={ForgotPasswordScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="ResetPassword"
              component={ResetPasswordScreen}
              options={{ headerShown: false }}
            />
          </>
        )}
        <Stack.Screen
          name="HowItWorks"
          component={HowItWorksScreen}
          options={{ title: "Como funciona" }}
        />
        <Stack.Screen
          name="BecomeProfessional"
          component={BecomeProfessionalScreen}
          options={{ title: "Para profissionais" }}
        />
        <Stack.Screen
          name="About"
          component={AboutScreen}
          options={{ title: "Sobre" }}
        />
        <Stack.Screen
          name="Contact"
          component={ContactScreen}
          options={{ title: "Contato" }}
        />
        <Stack.Screen
          name="PrivacyPolicy"
          component={PrivacyPolicyScreen}
          options={{ title: "Política de privacidade" }}
        />
        <Stack.Screen
          name="FullPrivacyPolicy"
          component={FullPrivacyPolicyScreen}
          options={{ title: "Política de privacidade" }}
        />
        <Stack.Screen name="CommunityRules" component={CommunityRulesScreen} options={{ title: "Regras de uso e moderação" }} />
        <Stack.Screen
          name="Services"
          component={ServicesScreen}
          options={{ title: "Serviços" }}
        />
        <Stack.Screen
          name="ServiceProfessionals"
          component={ServiceProfessionalsScreen}
          options={{ title: "Profissionais" }}
        />
        <Stack.Screen
          name="Professional"
          component={ProfessionalScreen}
          options={{ title: "Profissional" }}
        />
        <Stack.Screen
          name="ProfessionalReviews"
          component={ProfessionalReviewsScreen}
          options={{ title: "Avaliações" }}
        />
        <Stack.Screen
          name="RegionalMap"
          component={RegionalMapScreen}
          options={{ title: "Mapa regional" }}
        />
        <Stack.Screen
          name="ServiceAddressMap"
          component={ServiceAddressMapScreen}
          options={{ title: "Endereço do serviço" }}
        />
        <Stack.Screen
          name="CityProfessionals"
          component={CityProfessionalsScreen}
          options={{ title: "Profissionais da cidade" }}
        />
        {user && (
          <>
            <Stack.Screen
              name="RequestForm"
              component={RequestFormScreen}
              options={{ title: "Pedir orçamento" }}
            />
            <Stack.Screen
              name="RequestDetail"
              component={RequestDetailScreen}
              options={{ title: "Solicitação" }}
            />
            <Stack.Screen
              name="ProposalForm"
              component={ProposalFormScreen}
              options={{ title: "Enviar orçamento" }}
            />
            <Stack.Screen
              name="OrderDetail"
              component={OrderDetailScreen}
              options={{ title: "Meu serviço" }}
            />
            <Stack.Screen
              name="Chat"
              component={ChatScreen}
              options={{ title: "Conversa" }}
            />
            <Stack.Screen
              name="EditProfile"
              component={EditProfileScreen}
              options={{ title: "Editar perfil" }}
            />
            <Stack.Screen
              name="Favorites"
              component={FavoritesScreen}
              options={{ title: "Favoritos" }}
            />
            <Stack.Screen
              name="ProfessionalDashboard"
              component={ProfessionalDashboardScreen}
              options={{ title: "Painel profissional" }}
            />
            <Stack.Screen
              name="ProfessionalManager"
              component={ProfessionalManagerScreen}
              options={{ title: "Área profissional" }}
            />
            <Stack.Screen
              name="Schedule"
              component={ScheduleScreen}
              options={{ title: "Agenda" }}
            />
            <Stack.Screen
              name="Verification"
              component={VerificationScreen}
              options={{ title: "Verificação" }}
            />
            <Stack.Screen
              name="Admin"
              component={AdminScreen}
              options={{ title: "Administração" }}
            />
            <Stack.Screen
              name="Opportunities"
              component={OpportunitiesScreen}
              options={{ title: "Trabalhos disponíveis" }}
            />
            <Stack.Screen
              name="Report"
              component={ReportScreen}
              options={{ title: "Denúncia" }}
            />
            <Stack.Screen
              name="Dispute"
              component={DisputeScreen}
              options={{ title: "Problema com o serviço" }}
            />
            <Stack.Screen name="MyHighlights" component={MyHighlightsScreen} options={{ title: "Minhas publicações" }} />
            <Stack.Screen name="CreateHighlight" component={CreateHighlightScreen} options={{ title: "Publicar trabalho" }} />
            <Stack.Screen name="HighlightsModeration" component={HighlightsModerationScreen} options={{ title: "Aprovar publicações" }} />
            <Stack.Screen
              name="NotificationPreferences"
              component={NotificationPreferencesScreen}
              options={{ title: "Preferências de notificações" }}
            />
            <Stack.Screen
              name="Notifications"
              component={NotificationsScreen}
              options={{ title: "Notificações" }}
            />
            <Stack.Screen
              name="DeleteAccount"
              component={DeleteAccountScreen}
              options={{ title: "Excluir conta" }}
            />
          </>
        )}
      </Stack.Navigator>
      {user && <CommunityRulesGate key={user.id} userId={user.id} onDecline={() => void logout()}><WelcomeGuideModal userId={user.id} onStart={goal => {
        if (!navigationRef.isReady()) return;
        if (goal === GettingStartedGoal.FindProfessional) navigationRef.navigate("Services");
        else navigationRef.navigate("ProfessionalManager");
      }} /></CommunityRulesGate>}
    </NavigationContainer>
  );
}
