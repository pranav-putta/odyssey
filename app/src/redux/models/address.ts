import { Alert } from "react-native";

enum AddressResult {
  valid,
  invalid,
}

class Address {
  private address: string;

  constructor(address: string) {
    this.address = address;
  }

  validate(): AddressResult {
    if (this.address !== '') {
      return AddressResult.valid;
    } else {
      return AddressResult.invalid;
    }
  }

  formatted(): string {
    return this.address;
  }
}

export default Address;
export { AddressResult };
