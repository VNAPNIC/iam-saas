export interface User {
  id: string;
  tenantId: string;
  tenantKey: string;
  name: string;
  email: string;
  status: string;
  avatarUrl: string;
  phoneNumber: string;
  emailVerifiedAt: string;
  createdAt: string;
  updatedAt: string;
  RoleIDs: string[];
}