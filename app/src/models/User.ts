export interface User {
  address: string;
  age: number;
  name: string;
  phoneNumber: string;
  interestedTopics: { [key: string]: boolean };
  uid: string;
  liked: { [key: number]: boolean };
  pfp_url: string;
  created_time: number;
  email: string;
}
