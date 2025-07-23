export interface AccessKey {
    id: string;
    createdAt: string;
}

export interface AccessKeyGroup {
    id: string;
    name: string;
    serviceRole: string;
    keyType: string;
    keys: AccessKey[];
}