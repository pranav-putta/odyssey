export enum NotificationActionTypes {
  link = 'link',
  screen = 'screen',
  none = 'none'
}

export interface NotificationAction {
  action: NotificationActionTypes;
  path?: string;
}

export interface NotificationButton {
  label: string;
  color: string;
  action: NotificationAction;
}

export interface Notification {
  title: string;
  body: string;
  buttons: NotificationButton[];
  image: string;
}
