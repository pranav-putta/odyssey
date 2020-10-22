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
}

export interface Contact {
  address: string;
  phoneNumber: string;
}
