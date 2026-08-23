export interface AuthenticatedUser { id: string; name: string; email: string; role: string; }
export interface AuthResponse { accessToken: string; refreshToken: string; user: AuthenticatedUser; }
export interface Service { id: string; name: string; category: string; description?: string; }
export interface ProfessionalService { serviceId: string; serviceName: string; basePrice?: number; description?: string; }
export interface Professional { id: string; name: string; city?: string; state?: string; profilePhotoMediaId?: string; verificationStatus?: string; services: ProfessionalService[]; metrics?: { averageRating?: number; completedServices?: number; }; }
export interface ProfessionalsResponse { professionals: Professional[]; page: number; limit: number; total: number; }
export interface ServiceRequest { id: string; service?: Service; serviceId: string; description: string; city: string; state: string; status: string; proposalCount: number; maximumProposals: number; preferredAt?: string; }
export interface Conversation { id: string; otherUser: { id: string; name: string; profilePhotoMediaId?: string }; lastMessageAt?: string; unreadCount: number; }
export interface Notification { id: string; title: string; body: string; actionUrl?: string; readAt?: string; createdAt: string; }
