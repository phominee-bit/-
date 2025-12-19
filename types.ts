
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

/**
 * Interface for event invitation configuration used in InvitationPage component.
 * Fixed error: Module '"../types"' has no exported member 'EventConfig'.
 */
export interface EventConfig {
  message: string;
  date: string;
  time: string;
  location: string;
  address2GIS?: string;
}
