export interface HomeEasyPlusStatus {
  enabled: boolean;
  active: boolean;
  expiresAt: string | null;
  willRenew: boolean;
  publicationLimit: number;
  portfolioLimit: number;
}
