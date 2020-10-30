export interface Representative {
  name: string;
  picture_url: string;
  district: number;
  member_url: string;
  contacts: Contact[];
  party: string;
  general_assembly: number;
  phoneNumber: string;
  address: string;
  chamber: string;
  content?: Content[];
}

export interface Content {
  image: string;
  title: string;
  subtitle: string;
  link: string;
}

export interface Contact {
  address: string;
  phoneNumber: string;
  email: string;
}
