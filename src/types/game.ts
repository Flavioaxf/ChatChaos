export interface VoteCategory {
  category: string;
  count: number;
}

export interface WordResult {
  wordIndex: number;
  word: string;
  isTemplate: boolean;
  authorId: string | null;
  authorName: string | null;
  voteCount: number;
  voteCategories: VoteCategory[];
  pointsAwarded: number;
}

export interface ScoringPayload {
  round: number;
  totalWords: number;
  words: WordResult[];
  playerScores: Record<string, number>;
}

export interface AdwareItem {
  id: string;
  windowTitle: string;
  imgSrc: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
  animationDelay: number;
  closeable: boolean;
}

export interface Player {
  id: string;
  name: string;
  avatar: string;
  team: 'TIME_A' | 'TIME_B' | null;
  secretRole: string | null;
  score: number;
}