export type Group = {
  id: number;
  name: string;
  memberIds: string[];
  subject: string;
  nextMeeting: string;
  code : string;
  createdId: string;
};

export type JoinRequest = {
  id: string;
  name: string;
  avatar: string;
  email: string;
  groupId: string;
}
export type GroupData = {
  id: string;
  name: string;
  subject: string;
  description?: string;
  code: string;
  creatorId: string;
  memberIds: string[];
  createdAt: string; // ISO date string
  creator: User;
  members: User[];
  messages: Message[];
  sessions: Session[];
};

export type User = {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string; // Optional
};

export type Message = {
  id: string;
  content: string;
  userId: string;
  groupId: string;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
};

export type Session = {
  id: string;
  name: string;
  description?: string; // Optional
  groupId: string;
  creatorID: string;
  createdAt: string; // ISO date string
};
