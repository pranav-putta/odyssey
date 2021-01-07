export interface Notification {
  title: string;
  body: string;
  type: NotificationType;
  location: NotificationLocation;
  time: 'asap' | number;
  content: string;
  seen: boolean;
}

export enum NotificationType {
  message,
  html,
  url,
  bill,
}

export enum NotificationLocation {
  home,
  feed,
  banner,
}
