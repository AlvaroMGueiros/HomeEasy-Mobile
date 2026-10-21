import { NavigatorScreenParams } from '@react-navigation/native';
import { ServiceIssue } from '../config/serviceIssues';

export enum ProfileEditorSection { Personal = 'personal', Professional = 'professional' }

export type AppTabParamList = { Home: undefined; Requests: undefined; Highlights: { city?: string; state?: string } | undefined; Conversations: undefined; Profile: undefined; };
export type RootStackParamList = {
  PublicHome: undefined;
  Login: { mode?: 'login' | 'register' } | undefined;
  ForgotPassword: undefined;
  ResetPassword: { token?: string } | undefined;
  HowItWorks: undefined;
  BecomeProfessional: undefined;
  About: undefined;
  Contact: undefined;
  PrivacyPolicy: undefined;
  FullPrivacyPolicy: undefined;
  CommunityRules: undefined;
  App: NavigatorScreenParams<AppTabParamList>;
  Services: undefined;
  ServiceProfessionals: { serviceId: string; serviceName: string };
  Professional: { professionalId: string };
  ProfessionalReviews: { professionalId: string; professionalName: string };
  RegionalMap: undefined;
  ServiceAddressMap: { address?: string; city: string; state: string };
  CityProfessionals: { city: string; state: string };
  RequestForm: { serviceId: string; serviceName: string; professionalId?: string; sourceOrderId?: string };
  RequestDetail: { requestId: string };
  ProposalForm: { requestId: string; serviceName: string };
  OrderDetail: { orderId: string };
  Chat: { conversationId: string; otherUserId: string; otherUserName: string; serviceName: string; isWritable: boolean };
  EditProfile: { section?: ProfileEditorSection } | undefined;
  Favorites: undefined;
  ProfessionalManager: undefined;
  ProfessionalDashboard: undefined;
  Schedule: undefined;
  Verification: undefined;
  Admin: undefined;
  Report: { targetUserId?: string; conversationId?: string; messageId?: string; highlightId?: string };
  Dispute: { orderId: string; issue?: ServiceIssue };
  Opportunities: undefined;
  MyHighlights: undefined;
  CreateHighlight: undefined;
  HighlightsModeration: undefined;
  Notifications: undefined;
  NotificationPreferences: undefined;
  DeleteAccount: undefined;
};
