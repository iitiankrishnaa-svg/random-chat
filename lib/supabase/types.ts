export type UserStatus = 'eligible' | 'restricted' | 'banned';
export type QueueStatus = 'waiting' | 'matched' | 'cancelled';

export interface Profile {
  user_id: string;
  status: UserStatus;
  created_at: string;
  updated_at: string;
}

export interface ChatSession {
  id: string;
  user_a: string;
  user_b: string;
  status: 'active' | 'ended';
  created_at: string;
  ended_at: string | null;
  end_reason: 'left' | 'skipped' | 'reported' | 'blocked' | 'timeout' | 'moderated' | null;
}

export interface ChatMessage {
  id: string;
  session_id: string;
  sender_id: string;
  body: string;
  created_at: string;
}

export interface Report {
  id: string;
  reporter_id: string;
  reported_id: string;
  session_id: string | null;
  reason_code: string;
  description: string | null;
  status: 'pending' | 'reviewed' | 'dismissed' | 'action_taken';
  created_at: string;
  reviewed_at: string | null;
  reviewer_id: string | null;
}
