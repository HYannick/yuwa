import {Group} from '@/domain/Group.ts';

export interface GroupParticipant {
  id: string;
  group_id: string;
  user_id: string;
  name: string;
  details: {name: string};
  status: string;
  group: Group;
  joined_at?: Date;
}

export const sanitizeParticipants = (participants: GroupParticipant[]): {id: string, name: string}[] => {
  return participants.map((participant: GroupParticipant) => ({
    id: participant.user_id,
    name: participant.details.name,
  }));
}
