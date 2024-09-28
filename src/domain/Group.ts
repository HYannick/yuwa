import {GroupParticipant} from './GroupParticipant.ts';

export interface Group {
  id: string;
  name: string;
  created_by?: string;
  created_at?: Date;
  invitation_token?: string;
  token_expires_at?: Date;
  max_uses: number;
  uses_count: number;
  participants: GroupParticipant[];
}
