export interface User {
  address: string;
  age: number;
  name: string;
  phoneNumber: string;
  interestedTopics: [string];
  uid: string;
  liked: { [key: number]: boolean };
  pfp: string;
}
