
export interface BookResult {
  id: string;
  title: string;
  author: string;
  category: string;
  script: string;
  timestamp: number;
}

export type Language = 'ru' | 'kz';

export interface AppState {
  loading: boolean;
  results: BookResult[];
  error: string | null;
}

export interface EventConfig {
  message: string;
  date: string;
  time: string;
  location: string;
  address2GIS: string;
}
