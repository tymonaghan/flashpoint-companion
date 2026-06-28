export interface TeamMember {
  id: string;
  team: 'red' | 'blue';
  name: string;
  unitType: string;
  legendary: boolean;
}

export const SANGHEILI_NAMES = [
  'Thel \'Vadam',
  'Kor \'Dan',
  'Rtas \'Vadum',
  'Jega \'Dum',
  'Atriox',
  'Zeta \'Halo',
  'Keth \'Marax',
  'Bal \'Molsterix',
  'Nem \'Kriham',
  'Voro \'Notee',
  'Sem \'Yulaan',
  'Jul \'Mdama',
  'Tartarus',
];

export const BLUE_UNIT_TYPES = [
  'Spartan Mark VII',
  'Spartan Brawler',
  'Spartan Veszla',
  'Spartan Deadeye',
];

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
