export interface Session {
    id: string;
    userId: string;
    userEmail: string;
    deviceInfo: {
        os: string;
        browser: string;
        device: string;
    };
    ipAddress: string;
    location?: {
        country?: string;
        city?: string;
    };
    refreshToken: string;
    expiresAt: string;
    lastActivity: string;
    createdAt: string;
    isActive: boolean;
}