import * as E from "fp-ts/Either";
import { absurd, pipe } from "fp-ts/function";
import * as O from "fp-ts/Option";
import * as P from "fp-ts/Predicate";

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - //
// https://github.com/inato/fp-ts-cheatsheet#building-an-option

describe("constructors", () => {
  it("O.fromNullable", () => {
    expect(
      O.fromNullable(null), //
    ).toEqual(O.none);

    expect(
      O.fromNullable(undefined), //
    ).toEqual(O.none);

    expect(
      O.fromNullable(42), //
    ).toEqual(O.some(42));
  });

  it("O.fromPredicate", () => {
    const isEven: P.Predicate<number> = (n) => n % 2 === 0;

    expect(
      pipe(
        1,
        O.fromPredicate(isEven), //
      ),
    ).toEqual(O.none);

    expect(
      pipe(
        2,
        O.fromPredicate(isEven), //
      ),
    ).toEqual(O.some(2));
  });

  it("O.fromEither", () => {
    expect(
      pipe(
        E.right("yay"),
        O.fromEither, //
      ),
    ).toEqual(O.some("yay"));

    expect(
      pipe(
        E.left("nay"),
        O.fromEither, //
      ),
    ).toEqual(O.none);

    // NOTE:
    // - `getRight` is the same as `fromEither`
    // - `getLeft` is the opposite of `fromEither`
  });
});

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - //
// https://github.com/inato/fp-ts-cheatsheet#get-value-from-an-option

describe("destructors", () => {
  it("destructors", () => {
    expect(
      pipe(
        O.none,
        O.toNullable, //
      ),
    ).toEqual(null);

    expect(
      pipe(
        O.none,
        O.toUndefined, //
      ),
    ).toEqual(undefined);

    expect(
      pipe(
        O.none,
        O.getOrElse(() => 42), //
      ),
    ).toEqual(42);

    expect(
      pipe(
        O.none,
        O.match(() => 42, absurd), //
      ),
    ).toEqual(42);

    // O.match (v3) is equivalent to O.fold (v2)
    expect(
      pipe(
        O.some(2),
        O.match(
          () => 42,
          (n) => n * 2,
        ), //
      ),
    ).toEqual(4);
  });
});

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - //
// instance: Alt

describe("instance: Alt", () => {
  it("E.alt", () => {
    expect(
      pipe(
        O.none,
        O.alt(() => O.none),
      ),
    ).toEqual(O.none);

    expect(
      pipe(
        O.none,
        O.alt(() => O.some(42)),
      ),
    ).toEqual(O.some(42));

    expect(
      pipe(
        O.some(42),
        O.alt(() => O.some(123)), //
      ),
    ).toEqual(O.some(42));

    // Note the `.altW`
    expect(
      pipe(
        O.some(42),
        O.altW(() => O.none), //
      ),
    ).toEqual(O.some(42));
  });

  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - //
  // instance: Apply

  it("instance: Apply", () => {
    const f = (a: string) => (b: number) => (c: boolean) => `${a}${b}${c}`;

    expect(
      pipe(
        O.some(f),
        O.ap(O.some("foo")),
        O.ap(O.some(42)),
        O.ap(O.some(false)),
      ),
    ).toEqual(O.some("foo42false"));

    // const sequenceTOption = sequenceT(O.Apply)
    // assert.deepStrictEqual(sequenceTOption(O.some(1)), O.some([1]))
    // assert.deepStrictEqual(sequenceTOption(O.some(1), O.some('2')), O.some([1, '2']))
    // assert.deepStrictEqual(sequenceTOption(O.some(1), O.some('2'), O.none), O.none)
    // v2:
    expect(
      pipe(
        O.some(1),
        O.tupled, // v2: Apply.sequenceT(O.Apply)
      ),
    ).toEqual(O.some([1]));

    // expect(
    //   pipe(
    //     (O.some(1), O.some(2)),
    //     O.tupled, // v2: Apply.sequenceT(O.Apply)
    //   ),
    // ).toEqual(O.some([1, 2]));

    // expect(
    //   pipe(
    //     (O.some(1), O.some(2)),
    //     O.apT(O.some([42])), //
    //   ),
    // ).toEqual(O.some([1, 2]));

    expect(
      pipe(
        O.some([1, 2]),
        O.apT(O.some(42)), //
      ),
    ).toEqual(O.some([1, 2, 42]));

    // v2: await sequenceT(T.ApplicativePar)(fa, fb, fc, fd)()
    // v3: await pipe(T.ApT, T.apT(fa), T.apT(fb), T.apT(fc), T.apT(fd))()
    expect(
      pipe(
        O.ApT,
        O.apT(O.some(1)),
        O.apT(O.some(2)), //
      ),
    ).toEqual(O.some([1, 2]));

    expect(
      pipe(
        O.some(1),
        O.tupled,
        O.apT(O.some(2)), //
      ),
    ).toEqual(O.some([1, 2]));

    expect(
      pipe(
        O.some({ a: "foo", b: "bar" }),
        O.apS("c", O.some("baz")), //
      ),
    ).toEqual(O.some({ a: "foo", b: "bar", c: "baz" }));

    // App.apT(O.Apply)(O.some("pzazz")), //
  });
});
