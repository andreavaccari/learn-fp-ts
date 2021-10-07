import { apply, flow, pipe } from "fp-ts/function";
import * as R from "fp-ts/Reader";
import * as S from "fp-ts/string";
import * as T from "fp-ts/Task";

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - //

describe("Constructors", () => {
  it("definition", () => {
    expect(
      R.of(1)({}), //
    ).toEqual(
      ((_) => 1)({}), //
    );
  });

  // From: https://github.com/gcanti/fp-ts/blob/3.0.0/test/Reader.ts
  it("of", () => {
    expect(
      pipe(
        R.of(1),
        R.map((x) => x * 2),
      )({}),
    ).toEqual(2);
  });
});

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - //

describe("Apply", () => {
  // From: https://github.com/gcanti/fp-ts/blob/3.0.0/test/Reader.ts
  it("ap", () => {
    expect(
      pipe(
        R.of((x: number) => x * 2),
        R.ap(R.of(1)),
      )({}),
    ).toEqual(2);
  });

  // From: https://github.com/gcanti/fp-ts/blob/3.0.0/test/Reader.ts
  it("apFirst", () => {
    expect(
      pipe(
        R.of(1),
        R.apFirst(R.of(2)), //
      )({}),
    ).toEqual(1);
  });

  // From: https://github.com/gcanti/fp-ts/blob/3.0.0/test/Reader.ts
  it("apSecond", () => {
    expect(
      pipe(
        R.of(1),
        R.apSecond(R.of(2)), //
      )({}),
    ).toEqual(2);
  });
});

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - //

describe("Chain", () => {
  // From: https://github.com/gcanti/fp-ts/blob/3.0.0/test/Reader.ts
  it("ap", () => {
    expect(
      pipe(
        R.of("foo"),
        R.chain(flow(S.size, R.of)), //
      )({}),
    ).toEqual(3);
  });

  // From: https://github.com/gcanti/fp-ts/blob/3.0.0/test/Reader.ts
  it("apFirst", () => {
    expect(
      pipe(
        R.of("foo"),
        R.chainFirst(flow(S.size, R.of)), //
      )({}),
    ).toEqual("foo");
  });

  // From: https://github.com/gcanti/fp-ts/blob/3.0.0/test/Reader.ts
  it("apSecond", () => {
    expect(
      pipe(
        R.of("foo"),
        R.of,
        R.of,
        R.flatten,
        R.flatten, //
      )({}),
    ).toEqual("foo");
  });
});

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - //

describe("Ask", () => {
  type Ctx = { a: number; b: string };

  // From: https://github.com/gcanti/fp-ts/blob/3.0.0/test/Reader.ts
  it("ask", () => {
    expect(
      pipe(
        // R.of("something"),
        R.ask<Ctx>(),
        R.map(({ a }) => a * 2), //
      )({ a: 1, b: "foo" }),
    ).toEqual(2);
  });

  // From: https://github.com/gcanti/fp-ts/blob/3.0.0/test/Reader.ts
  it("asks", () => {
    expect(
      pipe(
        R.asks((ctx: Ctx) => ctx.b),
        R.map(S.size), //
      )({ a: 1, b: "foo" }),
    ).toEqual(3);
  });

  // From: https://github.com/gcanti/fp-ts/blob/3.0.0/test/Reader.ts
  it("local", () => {
    interface E {
      readonly name: string;
    }
    const x = pipe(
      (s: string) => T.of(s.length),
      R.local((e: E) => e.name),
    );
    // expect(x({ name: "foo" })()).toEqual(3);

    expect(
      pipe(
        R.asks((ctx: Ctx) => ctx.b),
        R.local((ctx: Ctx) => ({ ...ctx, b: "foobar" })),
        R.map(S.size), //
      )({ a: 1, b: "foo" }),
    ).toEqual(3);
  });
});

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - //

describe("Examples", () => {
  // Inspired by: https://dev.to/gcanti/getting-started-with-fp-ts-reader-1ie5
  it("Giulio Canti", () => {
    // interface Dependencies {
    //   i18n: {
    //     true: string;
    //     false: string;
    //   };
    //   lowerBound: number;
    // }
    interface Intl {
      intl: {
        true: string;
        false: string;
      };
    }
    interface Bounds {
      lowerBound: number;
      upperBound: number;
    }

    type Dependencies = Intl & Bounds;

    const dependencies: Dependencies = {
      intl: {
        true: "yay",
        false: "nay",
      },
      lowerBound: 2,
      upperBound: 42,
    };

    const translate = (b: boolean): R.Reader<Intl, string> =>
      pipe(
        R.ask<Intl>(),
        R.map((deps) => (b ? deps.intl.true : deps.intl.false)),
      );

    const longEnough =
      (n: number): R.Reader<Dependencies, string> =>
      (deps) =>
        translate(n > deps.lowerBound)(deps);

    const checkLength = (s: string): R.Reader<Dependencies, string> =>
      pipe(s, S.size, longEnough);

    // The above is equivalent to:
    const checkLength2 = flow(S.size, longEnough);

    const final1 = flow(checkLength, apply(dependencies));

    expect(
      // checkLength("foo")(dependencies), //
      final1("foo"), //
    ).toEqual("yay");

    expect(
      checkLength2("foo")({ ...dependencies, lowerBound: 8 }), //
    ).toEqual("nay");

    // From the comments: all of these are equivalent:
    // g = (n: number) => (deps: Deps) => pipe(deps, f(n > deps.lowerBound))
    // g = (n: number): Reader<Deps, string> => deps => pipe(deps, f(n > deps.lowerBound))
    // g = (n: number): Reader<Deps, string> => deps => f(n > deps.lowerBound)(deps)
    // g = (n: number): Reader<Deps, string> =>
    // pipe(
    //   ask<Deps>(),
    //   chain(deps => f(n > deps.lowerBound))
    // )
  });
});
