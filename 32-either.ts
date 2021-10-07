import * as E from "fp-ts/Either";
import { absurd, identity, pipe } from "fp-ts/function";
import * as N from "fp-ts/number";
import * as O from "fp-ts/Option";
import * as P from "fp-ts/Predicate";
import * as RA from "fp-ts/ReadonlyArray";
import * as S from "fp-ts/string";

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - //
// https://github.com/inato/fp-ts-cheatsheet#building-an-either

describe("constructors", () => {
  it("E.fromNullable", () => {
    expect(
      pipe(
        null,
        E.fromNullable(() => "error"), //
      ),
    ).toEqual(E.left("error"));

    expect(
      pipe(
        42,
        E.fromNullable(() => "error"), //
      ),
    ).toEqual(E.right(42));
  });

  it("E.fromPredicate", () => {
    const isEven: P.Predicate<number> = (n) => n % 2 === 0;

    expect(
      pipe(
        1,
        E.fromPredicate(isEven), //
      ),
    ).toEqual(E.left(1));

    expect(
      pipe(
        1,
        E.fromPredicate(N.isNumber), //
      ),
    ).toEqual(E.right(1));
  });

  it("E.fromOption", () => {
    expect(
      pipe(
        O.none,
        E.fromOption(() => "nay"),
      ),
    ).toEqual(E.left("nay"));

    expect(
      pipe(
        O.some(42),
        E.fromOption(() => "nay"),
      ),
    ).toEqual(E.right(42));

    // NOTE:
    // - `getRight` is the same as `fromEither`
    // - `getLeft` is the opposite of `fromEither`
  });

  // From: https://github.com/gcanti/fp-ts/blob/3.0.0/test/Either.ts
  it("E.tryCatchK", () => {
    const f = (s: string) => {
      const len = s.length;
      if (len > 0) {
        return len;
      }
      throw new Error("empty string");
    };

    expect(
      pipe(
        "a",
        E.tryCatchK(f, identity), //
      ),
    ).toEqual(E.right(1));

    expect(
      pipe(
        "",
        E.tryCatchK(f, identity), //
      ),
    ).toEqual(E.left(new Error("empty string")));
  });
});

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - //
// https://github.com/inato/fp-ts-cheatsheet#get-value-from-an-either

describe("destructors", () => {
  it("E.getOrElse", () => {
    expect(
      pipe(
        E.left("value"),
        E.getOrElse(() => "nay"), //
      ),
    ).toEqual("nay");

    expect(
      pipe(
        E.right("value"),
        E.getOrElse(() => "nay"), //
      ),
    ).toEqual("value");
  });

  it("E.match", () => {
    // E.match (v3) is equivalent to E.fold (v2)
    expect(
      pipe(
        E.left("value"),
        E.match((x) => `nay: ${x}`, absurd), //
      ),
    ).toEqual("nay: value");

    expect(
      pipe(
        E.right("value"),
        E.match(absurd, (x) => `yay: ${x}`), //
      ),
    ).toEqual("yay: value");
  });
});

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - //

describe("Apply", () => {
  // From: https://github.com/gcanti/fp-ts/blob/master/test/Either.ts
  it("apFirst", () => {
    expect(
      pipe(
        E.right("a"),
        E.apFirst(E.right(1)), //
      ),
    ).toEqual(E.right("a"));
  });

  // From: https://github.com/gcanti/fp-ts/blob/master/test/Either.ts
  it("apSecond", () => {
    expect(
      pipe(
        E.right("a"),
        E.apSecond(E.right(1)), //
      ),
    ).toEqual(E.right(1));
  });

  it("E.apT", () => {
    expect(
      pipe(
        E.right<number, string>(1),
        E.tupled,
        E.apT(E.right("b")), //
      ),
    ).toEqual(E.right([1, "b"]));
  });

  // From: https://github.com/gcanti/fp-ts/blob/master/test/Either.ts
  it("E.apS", () => {
    expect(
      pipe(
        E.right<number, string>(1),
        E.bindTo("a"),
        E.apS("b", E.right("b")), //
      ),
    ).toEqual(E.right({ a: 1, b: "b" }));
  });
});

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - //

describe("Applicative", () => {
  // From: https://github.com/gcanti/fp-ts/commit/530570d63c59e548d8f70849b062fec62de93664#diff-7889652bc6eb0732c0af3eb2b83e9e9065805821910d7e970a7b2d481a0a6077
  it("E.getApplicativeValidation", () => {
    const A = E.getApplicativeValidation(S.Semigroup);

    expect(
      pipe(
        E.left("a"),
        E.map((a) => (b: string) => [...a, b]),
        A.ap(E.left("b")), //
      ),
    ).toEqual(E.left("ab"));

    expect(
      pipe(
        E.right([1]),
        E.map((a) => (b: string) => [...a, b]),
        A.ap(E.left("b")), //
      ),
    ).toEqual(E.left("b"));

    expect(
      pipe(
        E.right([1]),
        E.map((a) => (b: number) => [...a, b]),
        A.ap(E.right(2)), //
      ),
    ).toEqual(E.right([1, 2]));
  });
});

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - //

describe("Alt", () => {
  it("E.alt", () => {
    expect(
      pipe(
        E.left("value"),
        E.alt(() => E.left("alt")),
      ),
    ).toEqual(E.left("alt"));

    expect(
      pipe(
        E.left("value"),
        E.alt(() => E.right("alt")),
      ),
    ).toEqual(E.right("alt"));

    expect(
      pipe(
        E.right("value"),
        E.alt(() => E.left("alt")),
      ),
    ).toEqual(E.right("value"));

    expect(
      pipe(
        E.right("value"),
        E.alt(() => E.right("alt")),
      ),
    ).toEqual(E.right("value"));
  });
});

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - //

describe("traversals", () => {
  // TODO currently in 14-sequences.ts
});

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - //

describe("Validation", () => {
  it("getApplicativeValidation", () => {
    expect(
      pipe(
        [E.left("1"), E.left("2")],
        RA.traverse(E.getApplicativeValidation(S.Monoid))(identity), //
      ),
    ).toEqual(E.left("12"));

    // See: https://dev.to/gcanti/getting-started-with-fp-ts-either-vs-validation-5eja

    expect(
      pipe(
        [E.left("1"), E.left("2")],
        RA.traverse(E.getApplicativeValidation(RA.getMonoid<string>()))(
          E.mapLeft((x) => [x]),
        ), //
      ),
    ).toEqual(E.left(["1", "2"]));

    expect(
      pipe(
        [E.right("1"), E.right("2")],
        RA.traverse(E.getApplicativeValidation(RA.getMonoid<string>()))(
          E.mapLeft((x) => [x]),
        ), //
      ),
    ).toEqual(E.right(["1", "2"]));
  });

  it("getAltValidation", () => {
    const AltV = E.getAltValidation(S.Semigroup);
    expect(
      pipe(
        E.left("1"),
        AltV.alt(() => E.left("2")), //
      ),
    ).toEqual(E.left("12"));

    // See: https://dev.to/gcanti/getting-started-with-fp-ts-either-vs-validation-5eja

    expect(
      pipe(
        E.right("1"),
        AltV.alt(() => E.left("2")), //
      ),
    ).toEqual(E.right("1"));

    expect(
      pipe(
        E.left("1"),
        AltV.alt(() => E.right("2")), //
      ),
    ).toEqual(E.right("2"));
  });
});
