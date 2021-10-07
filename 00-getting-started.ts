// https://jestjs.io/docs/getting-started
// https://kulshekhar.github.io/ts-jest/docs/getting-started

import { identity, pipe } from "fp-ts/function";

describe("pipe", () => {
  it("works", () => {
    expect(pipe(1, identity)).toEqual(1);
  });

  it("takes a value and applies to the next function, then takes that result and apply it to the next function, and so on...", () => {
    const add5 = (x: number) => x + 5;
    const mul2 = (x: number) => x * 2;

    expect(pipe(2, add5, mul2)).toEqual(14);
  });
});
