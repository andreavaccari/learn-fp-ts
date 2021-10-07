import * as E from "fp-ts/Either";
import { flow, pipe, SK } from "fp-ts/function";
import * as A from "fp-ts/ReadonlyArray";

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - //

describe("array", () => {
  // TODO

  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - //
  // https://github.com/ryanleecode/fp-ts-cheatsheet#convert-multiple-eithers-into-a-single-either
  // Note: In fp-ts v2, sequence came from `Traversable`

  it("sequence", () => {
    const enYay = (): E.Either<Error, number> => E.right(42);
    const enNay = (): E.Either<Error, number> => E.left(new Error("nay"));
    const esYay = (): E.Either<Error, string> => E.right("yay");
    const esNay = (): E.Either<Error, string> => E.left(new Error("nay"));

    expect(
      pipe(
        {
          a: enYay(),
          b: esYay(),
        }
        sequenceS, //
      ),
    ).toEqual(E.left("nay"));

  });

  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - //
  // https://github.com/ryanleecode/fp-ts-cheatsheet#check-for-errors-in-an-array

  it("traverse", () => {
    const validate = (n: number) => (n === 2 ? E.left("nay") : E.right(n));

    expect(
      pipe(
        [1, 2, 3],
        A.traverse(E.Applicative)(validate), //
      ),
    ).toEqual(E.left("nay"));

    expect(
      pipe(
        [2, 2, 2],
        A.traverse(E.Applicative)(validate), //
      ),
    ).toEqual(E.left("nay"));

    expect(
      pipe(
        [1, 3, 4],
        A.traverse(E.Applicative)(validate), //
      ),
    ).toEqual(E.right([1, 3, 4]));

    expect(
      pipe(
        [1, 3, 4],
        E.traverseReadonlyArrayWithIndex(flow(SK, validate)), //
      ),
    ).toEqual(E.right([1, 3, 4]));
  });
});
