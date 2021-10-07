// Refs
// - https://grossbart.github.io/fp-ts-recipes/#/numbers

import { identity, pipe } from "fp-ts/function";
import * as Mo from "fp-ts/Monoid";
import * as N from "fp-ts/number";
import * as A from "fp-ts/ReadonlyArray";

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - //

describe("MagmaSub", () => {
  it("concat", () => {
    expect(
      pipe(
        2,
        N.MagmaSub.concat(3), //
      ),
    ).toEqual(-1);
  });
});

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - //

describe("SemigroupSum, MonoidSum", () => {
  it("concat", () => {
    expect(
      pipe(
        2,
        N.SemigroupSum.concat(3),
        N.SemigroupSum.concat(4), //
      ),
    ).toEqual(9);
  });

  it("A.foldMap(N.MonoidSum)", () => {
    expect(
      pipe(
        [1, 2, 3],
        A.foldMap(N.MonoidSum)(identity), //
      ),
    ).toEqual(6);
  });
});

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - //

describe("SemigroupProduct, MonoidProduct", () => {
  it("concat", () => {
    expect(
      pipe(
        2,
        N.SemigroupProduct.concat(3),
        N.SemigroupProduct.concat(4), //
      ),
    ).toEqual(24);
  });

  it("A.foldMap(N.MonoidProduct)(identity)", () => {
    expect(
      pipe(
        [1, 2, 3],
        A.foldMap(N.MonoidSum)(identity), //
      ),
    ).toEqual(6);
  });
});

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - //

describe("MonoidMin", () => {
  // v2: monoid.getMeetMonoid(bounded.boundedNumber)
  const MonoidMin = Mo.min(N.Bounded);

  it("concat", () => {
    expect(
      pipe(
        2,
        MonoidMin.concat(3), //
      ),
    ).toEqual(2);
  });

  it("Mo.concatAll(MonoidMin)", () => {
    expect(
      pipe(
        [1, 3, 2],
        Mo.concatAll(MonoidMin), //
      ),
    ).toEqual(1);
  });

  it("RA.foldMap(MonoidMin)(identity)", () => {
    expect(
      pipe(
        [1, 3, 2],
        A.foldMap(MonoidMin)(identity), //
      ),
    ).toEqual(1);
  });
});

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - //

describe("MonoidMax", () => {
  // v2: monoid.getJoinMonoid(bounded.boundedNumber)
  const MonoidMax = Mo.max(N.Bounded);

  it("concat", () => {
    expect(
      pipe(
        2,
        MonoidMax.concat(3), //
      ),
    ).toEqual(3);
  });

  it("Mo.concatAll(MonoidMax)", () => {
    expect(
      pipe(
        [1, 3, 2],
        Mo.concatAll(MonoidMax), //
      ),
    ).toEqual(3);
  });

  it("RA.foldMap(MonoidMax)(identity)", () => {
    expect(
      pipe(
        [1, 3, 2],
        A.foldMap(MonoidMax)(identity), //
      ),
    ).toEqual(3);
  });
});

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - //

describe("Ord", () => {
  it("compare", () => {
    expect(
      pipe(
        1,
        N.Ord.compare(1), //
      ),
    ).toEqual(0);

    expect(
      pipe(
        1,
        N.Ord.compare(2), //
      ),
    ).toEqual(-1);
  });
});

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - //

describe("Show", () => {
  it("show", () => {
    expect(
      pipe(
        1,
        N.Show.show, //
      ),
    ).toEqual("1");
  });
});

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - //

describe("Field", () => {
  it.todo("degree");
});
