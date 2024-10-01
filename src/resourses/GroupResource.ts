import {SupabaseClient} from '@supabase/supabase-js';
import {Group} from '@/domain/Group.ts';
import {GroupParticipant} from '@/domain/GroupParticipant.ts';
import {DBResponse} from '@/domain/DBResponse.ts';

export class GroupResource {
  db: SupabaseClient;

  constructor(db: SupabaseClient) {
    this.db = db;
  }

  async createGroup(groupName: string, owner: string | undefined, invitationToken: string, tokenExpiresAt: Date): Promise<DBResponse<Group>> {
    const {data, error} = await this.db.from('groups').insert([{
      name: groupName,
      created_by: owner,
      invitation_token: invitationToken,
      token_expires_at: tokenExpiresAt.toISOString(),
      max_uses: 50,
      uses_count: 0
    }]).select();
    return {data, error};
  }

  async addParticipant(id: string, user_auth_id: string | undefined, accepted: string): Promise<void> {
    try {
      await this.db.from('group_participants').insert({
        group_id: id,
        user_id: user_auth_id,
        status: accepted,
        joined_at: new Date().toISOString(),
      });
    } catch (e) {
      throw new Error('Failed to add participant');
    }
  }

  async fetchGroupByToken(token: string): Promise<DBResponse<Group>> {
    const {data: group, error} = await this.db
      .from('groups')
      .select('*')
      .eq('invitation_token', token)
      .single();
    return {data: group, error};
  }

  async updateGroupDetails(id: string, groupData: Partial<Group>): Promise<DBResponse<Group>> {
    const {data, error} = await this.db.from('groups').update(groupData).eq('id', id).select();
    return {data, error};
  }

  async fetchUserGroups(user_auth_id: string): Promise<{ groups: Group[], error: any }> {
    const {data, error} = await this.db
      .from('group_participants')
      .select('group_id, group:groups(*)')
      .eq('user_id', user_auth_id)
      .eq('status', 'accepted').select('group:groups(*)').order('joined_at', {ascending: false});
    const groups = this.mapGroupParticipantsToGroup(data) //TODO figure this out
    return {groups, error};
  }

  private mapGroupParticipantsToGroup(participants: GroupParticipant[]): Group[] {
    return participants && participants.map((participant) => participant.group) || [];
  }

  async fetchGroupDetails(groupId: string): Promise<DBResponse<Group>> {
    const {data, error} = await this.db
      .from('groups')
      .select('*, participants:group_participants(user_id, details:users(name))')
      .eq('id', groupId)
      .single();

    return {data, error};
  }

  async fetchParticipant(id: string, userId: string): Promise<DBResponse<GroupParticipant>> {
    const {data, error} = await this.db
      .from('group_participants')
      .select('*')
      .eq('group_id', id)
      .eq('user_id', userId)
      .single();
    return {data, error};
  }

  async deleteGroup(groupId: string): Promise<void> {
    this.db
      .from('groups')
      .delete()
      .eq('id', groupId);
  }
}