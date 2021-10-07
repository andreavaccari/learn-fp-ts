import * as E from "fp-ts/Either";
import { flow, identity, pipe, SK } from "fp-ts/function";
import * as O from "fp-ts/Option";
import * as RA from "fp-ts/ReadonlyArray";
import * as T from "fp-ts/Task";

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - //

describe("With Option", () => {
  it("All some", async () => {
    expect(
      pipe(
        [O.some(1)],
        O.traverseReadonlyArrayWithIndex(SK), //
      ),
    ).toEqual(O.some([1]));

    expect(
      pipe(
        [1, "2"],
        O.traverseReadonlyArrayWithIndex(flow(SK, O.some)), //
      ),
    ).toEqual(O.some([1, "2"]));

    // NOTE: This is less efficient and should not be used.
    expect(
      pipe(
        [O.some(1)],
        RA.traverse(O.Applicative)(identity), //
      ),
    ).toEqual(
      pipe(
        [O.some(1)],
        O.traverseReadonlyArrayWithIndex(SK), //
      ),
    );
  });

  it("Some none", async () => {
    expect(
      pipe(
        [O.none, O.some(2)],
        O.traverseReadonlyArrayWithIndex(SK), //
      ),
    ).toEqual(O.none);

    expect(
      pipe(
        [O.some(1), O.none],
        O.traverseReadonlyArrayWithIndex(SK), //
      ),
    ).toEqual(O.none);

    expect(
      pipe(
        [O.none, O.none],
        O.traverseReadonlyArrayWithIndex(SK), //
      ),
    ).toEqual(O.none);
  });
});

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - //

describe("With Either", () => {
  it("All rights", async () => {
    expect(
      pipe(
        [E.right(1), E.right(2)],
        E.traverseReadonlyArrayWithIndex(SK), //
      ),
    ).toEqual(E.right([1, 2]));

    expect(
      pipe(
        [1, "2"],
        E.traverseReadonlyArrayWithIndex(flow(SK, E.right)), //
      ),
    ).toEqual(E.right([1, "2"]));

    // NOTE: This is less efficient and should not be used.
    expect(
      pipe(
        [E.right(1)],
        RA.traverse(E.Applicative)(identity), //
      ),
    ).toEqual(
      pipe(
        [E.right(1)],
        E.traverseReadonlyArrayWithIndex(SK), //
      ),
    );
  });

  it("Some lefts", async () => {
    expect(
      pipe(
        [E.left(1), E.right(2)],
        E.traverseReadonlyArrayWithIndex(SK), //
      ),
    ).toEqual(E.left(1));

    expect(
      pipe(
        [E.right(1), E.left(2)],
        E.traverseReadonlyArrayWithIndex(SK), //
      ),
    ).toEqual(E.left(2));

    expect(
      pipe(
        [E.left(1), E.left(2)],
        E.traverseReadonlyArrayWithIndex(SK), //
      ),
    ).toEqual(E.left(1));
  });
});

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - //

describe("With Task", () => {
  it("Examples", async () => {
    expect(
      await pipe(
        [T.of(1)],
        T.traverseReadonlyArrayWithIndex(SK), //
      )(),
    ).toEqual([1]);

    expect(
      await pipe(
        [1, "2"],
        T.traverseReadonlyArrayWithIndex(flow(SK, T.of)), //
      )(),
    ).toEqual([1, "2"]);

    // NOTE: This is less efficient and should not be used.
    expect(
      await pipe(
        [T.of(1)],
        RA.traverse(T.ApplicativePar)(identity), //
      )(),
    ).toEqual(
      await pipe(
        [T.of(1)],
        T.traverseReadonlyArrayWithIndex(SK), //
      )(),
    );
  });
});
