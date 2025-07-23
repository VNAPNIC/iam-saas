export interface Application {
    id: string;
    name: string;
    clientId: string;
    clientSecret?: string; // Optional, only returned on creation
    createdAt: string;
}