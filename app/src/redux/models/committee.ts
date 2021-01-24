export interface Committee {
  name: string;
  category: string;
  code: string;
  id: number;
  chamber: string;
  assembly: string;
}

export interface CommitteeStyling {
  color?: string;
  image?: string;
  opacity?: number;
  dark?: boolean;
}

export type Committees = {
  [key: string]: Committee[];
};

export function formatCommitteeArray(c: Committee[]) {
  let committees: Committees = {};

  c.forEach((val) => {
    if (committees[val.category]) {
      committees[val.category].push(val);
    } else {
      committees[val.category] = [val];
    }
  });

  return committees;
}
