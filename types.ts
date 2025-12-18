
export interface EventConfig {
  guestName: string;
  date: string;
  time: string;
  location: string;
  address2GIS: string;
  message: string;
}

export enum AppState {
  WELCOME = 'welcome',
  INVITATION = 'invitation'
}
