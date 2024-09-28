import { v4 as uuidv4 } from 'uuid';
import {GroupParticipant} from '@/domain/GroupParticipant.ts';

export const formatCurrency = (value: number, currencyCode: string) => {
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: currencyCode,
  }).format(value);
};

export const getUsernameFromParticipants = (userId: string, participants: GroupParticipant[]) => {
  const participant = participants.find((p) => p.id === userId);
  return participant ? participant.name : 'Unknown User';
};

export const generateGroupInvitationLink = (group: any) => {
  return `${window.location.origin}/join-group?token=${group.invitation_token}&group_name=${group.name}&group_id=${group.id}`;
}

export const generateToken = (): string => {
  return uuidv4(); // Secure and unique
};