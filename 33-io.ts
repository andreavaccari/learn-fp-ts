import { pipe } from "fp-ts/function";
import * as IO from "fp-ts/IO";
import * as A from "fp-ts/ReadonlyArray";

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - //

describe("Examples", () => {
  it("Append to mutable db", () => {
    const db: { ns: ReadonlyArray<number> } = { ns: [1, 2, 3] };

    const getDb: IO.IO<ReadonlyArray<number>> = () => db.ns;

    const setDb =
      (ns: ReadonlyArray<number>): IO.IO<void> =>
      () =>
        (db.ns = ns);

    const appendToDb = (n: number) =>
      pipe(getDb, IO.map(A.append(n)), IO.chain(setDb));

    const exec = appendToDb(4);

    db.ns = [6, 7, 8];

    exec();

    expect(db.ns).toEqual([6, 7, 8, 4]);
  });
});
