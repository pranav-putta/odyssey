enum AgeResult {
  valid,
  invalid,
  under13,
}

class Age {
  private age: string;

  constructor(age: string) {
    this.age = age;
  }

  validate(): AgeResult {
    let n = Number.parseInt(this.age);
    if (!n || n > 120) {
      return AgeResult.invalid;
    } else if (Number.parseInt(this.age) < 13) {
      return AgeResult.under13;
    } else {
      return AgeResult.valid;
    }
  }

  formatted(): number {
    return Number.parseInt(this.age);
  }
}

export default Age;
export { AgeResult };
