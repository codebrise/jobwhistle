import { z } from 'zod';

export const UserRegisterSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(64),
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(128),
});
export type UserRegisterInput = z.infer<typeof UserRegisterSchema>;

export const UserLoginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});
export type UserLoginInput = z.infer<typeof UserLoginSchema>;

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  activeWorkspaceId: string;
  createdAt: string;
}

export interface WorkspaceRecord {
  id: string;
  name: string;
  slug: string;
  ownerId: string;
  createdAt: string;
}

export interface AuthSession {
  user: UserProfile;
  workspace: WorkspaceRecord;
  token: string;
  expiresAt: string;
}
