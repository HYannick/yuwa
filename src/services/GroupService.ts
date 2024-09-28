import {SupabaseClient} from '@supabase/supabase-js';
import {generateToken} from '@/utils/common.utils.ts';
import {JoinErrorTypeEnum} from '@/domain/enums/JoinErrorTypeEnum.ts';
import {Group} from '@/domain/Group.ts';
import {AuthService} from '@/services/AuthService.ts';
import {GroupResource} from '@/resourses/GroupResource.ts';
import {GroupNameEmptyException} from '@/domain/exceptions/GroupNameEmptyException.ts';
import {sanitizeParticipants} from '@/domain/GroupParticipant.ts';


export class GroupService {
  supabaseClient: SupabaseClient;
  authService: AuthService;
  groupResource: GroupResource

  constructor(supabaseClient: SupabaseClient, groupResource: GroupResource, authService: AuthService) {
    this.supabaseClient = supabaseClient;
    this.authService = authService;
    this.groupResource = groupResource;
  }

  async createGroup(groupName: string): Promise<{ data: Group[] | null, error: any }> {
    if (groupName === '') {
      throw new GroupNameEmptyException();
    }

    const {invitationToken, tokenExpiresAt} = this.generateInvitationToken();

    const owner = (await this.authService.getAuthenticatedUser()).user?.id;
    const {data, error} = await this.groupResource.createGroup(groupName, owner, invitationToken, tokenExpiresAt);
    const group = data![0];

    await this.groupResource.addParticipant(group.id, owner, 'accepted');

    return {data, error};
  }

  async joinGroupByToken(token: string, userId: string): Promise<{ data: { groupId: string } | null; error: any } | { error: any }> {
    const now = new Date();

    const {data: group, error} = await this.groupResource.fetchGroupByToken(token);

    if (error || !group) {
      return {
        error: {
          type: JoinErrorTypeEnum.INVALID_TOKEN,
          message: 'Invalid or expired invitation link.',
        }
      };
    }

    // Check token expiration
    if (group.token_expires_at && group.token_expires_at < now) {
      return {
        error: {
          type: JoinErrorTypeEnum.EXPIRED_TOKEN,
          message: 'This invitation link has expired.'
        }
      };
    }

    // Check max uses
    if (group.max_uses && group.uses_count >= group.max_uses) {
      return {
        error: {
          type: JoinErrorTypeEnum.MAX_USES_REACHED,
          message: 'This invitation link has reached its maximum number of uses.'
        }
      };
    }

    // Check if the user is already a participant
    const {data: participant} = await this.groupResource.fetchParticipant(group.id, userId);

    if (participant) {
      return {
        error: {
          type: JoinErrorTypeEnum.ALREADY_JOINED,
          message: 'You are already a member of this group.'
        }
      };
    }

    // Add the user to the group participants
    try {
      await this.groupResource.addParticipant(group.id, userId, 'accepted');
    } catch (e) {
      return {
        error: {
          type: JoinErrorTypeEnum.FAILED_TO_JOIN,
          message: 'Failed to join the group. Please try again later.'
        }
      };
    }

    // Increment the uses_count
    const {error: updateError} = await this.groupResource.updateGroupDetails(group.id, {uses_count: group.uses_count + 1});

    if (updateError) {
      return {
        error: {
          type: JoinErrorTypeEnum.FAILED_TO_JOIN,
          message: 'Failed to update the group. Please try again later.',
        }
      };
    }

    return {data: {groupId: group.id}, error: null};
  };

  async fetchUserGroups(userId: string): Promise<{ data: Group[] | null, error: any }> {
    const {groups, error} = await this.groupResource.fetchUserGroups(userId);


    if (error) {
      console.error('Error fetching user groups:', error);
      return {data: null, error};
    }

    return {data: groups, error: null};
  }

  async fetchGroupDetails(groupId: string) {
    const {data: groupData, error: groupError} = await this.groupResource.fetchGroupDetails(groupId);

    if (groupError || !groupData) {
      return {error: groupError || 'Failed to fetch group details.'};
    }

    const participants = sanitizeParticipants(groupData.participants)

    return {data: {group: groupData, participants}, error: null};
  };

  async updateGroupDetails(groupId: string, groupData: any) {
    const {data, error} = await this.groupResource.updateGroupDetails(groupId, groupData);

    return {data, error};
  };

  async deleteGroup(groupId: string) {
    await this.groupResource.deleteGroup(groupId);
  };

  private generateInvitationToken() {
    const invitationToken = generateToken();
    const tokenExpiresAt = new Date();
    tokenExpiresAt.setDate(tokenExpiresAt.getDate() + 7);

    return {invitationToken, tokenExpiresAt};
  }
}