export interface TeamMember {
  id: string;
  team: 'red' | 'blue';
  name: string;
  unitType: string;
  legendary: boolean;
}

export interface CasualtyLog {
  turn: number;
  order: number;
  memberName: string;
  unitType: string;
  team: 'red' | 'blue';
  notes: string;
}

export interface GameMember {
  id: string;
  name: string;
  unitType: string;
  team: 'red' | 'blue';
  activated: boolean;
  killed: boolean;
  casualtyNotes: string;
  killedTurn: number | null;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}
