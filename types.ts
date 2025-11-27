export interface ScoreEntry {
  id: string;
  name: string;
  score: number;
  accuracy: number;
}

export interface Target {
  id: string;
  name: string;
  imageUrl?: string;
  status: 'active' | 'locked' | 'coming-soon';
}
