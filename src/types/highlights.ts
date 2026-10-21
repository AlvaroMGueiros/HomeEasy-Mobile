import { Professional } from './api';

export enum HighlightStatus { Pending = 'pending', Approved = 'approved', Rejected = 'rejected' }
export interface HighlightSummary {
  id: string; professionalId: string; serviceId: string; serviceName?: string;
  title: string; description: string; mediaIds: string[]; status: HighlightStatus;
  createdAt: string; isSponsored: boolean; reviewNotes?: string | null;
}
export interface Highlight extends HighlightSummary { professional: Professional; }
export interface HighlightsResponse { highlights: Highlight[]; page: number; hasMore: boolean; }
export interface HighlightLocation { city: string; state: string; }
export interface ModerationHighlight extends HighlightSummary { professionalName: string; }
