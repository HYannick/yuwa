export interface User {
  id: string;
  auth_id: string;
  name?: string;
  avatar_url?: string;
  group_count?: number;
  created_at?: Date;
}
