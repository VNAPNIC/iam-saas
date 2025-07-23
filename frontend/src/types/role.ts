export interface Role {
    id: string;
    name: string;
    description: string;
    permissions: string[];
    users: string[];
    status: string;
}