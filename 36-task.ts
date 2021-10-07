import { pipe } from "fp-ts/function";
import * as S from "fp-ts/string";
import * as T from "fp-ts/Task";

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - //

const logs: Array<string> = [];
const task = (name: string, millis: number): T.Task<string> =>
  pipe(
    T.of(name),
    // T.chainFirst(() => T.fromIO(() => logs.push(`s:${name}`))),
    T.delay(millis),
    T.chainFirst(() => T.fromIO(() => logs.push(name))),
  );

beforeEach(() => {
  // Reset the logs
  logs.length = 0;
});

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - //

describe("task", () => {
  it("is a function the returns a promise", async () => {
    const task = T.of(42);

    expect(await task()).toEqual(42);
  });
});

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - //

describe("Functor", () => {
  // From: https://github.com/gcanti/fp-ts/blob/3.0.0/test/Task.ts
  it("T.map", async () => {
    expect(
      await pipe(
        T.of(1),
        T.map((n) => n * 2), //
      )(),
    ).toEqual(2);
  });
});

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - //

describe("Apply", () => {
  // From: https://github.com/gcanti/fp-ts/blob/3.0.0/test/Task.ts
  it("T.ap (parallel)", async () => {
    const par = pipe(
      T.of(S.Semigroup.concat),
      T.ap(task("slow", 20)),
      T.ap(task("fast", 0)), //
    );
    expect(await par()).toEqual("fastslow");
    expect(logs).toEqual(["fast", "slow"]);
  });

  // From: https://github.com/gcanti/fp-ts/blob/3.0.0/test/Task.ts
  it("T.apFirst (parallel)", async () => {
    const par = pipe(
      task("slow", 20),
      T.apFirst(task("fast", 0)), //
      T.apFirst(task("slug", 50)), //
    );
    expect(await par()).toEqual("slow");
    expect(logs).toEqual(["fast", "slow", "slug"]);
  });

  // From: https://github.com/gcanti/fp-ts/blob/3.0.0/test/Task.ts
  it("T.apSecond (parallel)", async () => {
    const par = pipe(
      task("slow", 20),
      T.apSecond(task("fast", 0)),
      T.apFirst(task("slug", 50)), //
    );
    expect(await par()).toEqual("fast");
    expect(logs).toEqual(["fast", "slow", "slug"]);
  });

  it("T.apS (parallel)", async () => {
    expect(
      await pipe(
        task("slow", 20),
        T.bindTo("s"),
        T.apS("f", task("fast", 0)), //
      )(),
    ).toEqual({ f: "fast", s: "slow" });
    expect(logs).toEqual(["fast", "slow"]); // Parallel
  });

  // it("apT", async () => {
  //   await assertPar((a, b) => pipe(a, _.tupled, _.apT(b)), ["a", "b"]);
  // });
});

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - //

describe("Chain", () => {
  it("T.chain", async () => {
    expect(
      await pipe(
        task("slow", 20),
        T.chain((s) => task(`${s}fast`, 0)), //
        T.apFirst(task("fast", 0)), //
      )(),
    ).toEqual("slowfast");
    expect(logs).toEqual(["fast", "slow", "slowfast"]);
  });
});

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - //

describe("do notation", () => {
  const task = (s: string): T.Task<string> => T.of(s);

  // From: https://gcanti.github.io/fp-ts/guides/do-notation.html
  it("sequential do", async () => {
    expect(
      await pipe(
        T.Do,
        T.bind("x", () => task("foo")),
        T.bind("y", () => task("bar")),
        T.chainFirst(({ x }) => task(x)),
        T.chainFirst(({ y }) => task(y)), //
      )(),
    ).toEqual({ x: "foo", y: "bar" });
  });

  // From: https://gcanti.github.io/fp-ts/guides/do-notation.html
  it("parallel do", async () => {
    expect(
      await pipe(
        T.Do,
        T.apS("x", task("foo")),
        T.apS("y", task("bar")),
        T.chainFirst(({ x }) => task(x)),
        T.chainFirst(({ y }) => task(y)), //
      )(),
    ).toEqual({ x: "foo", y: "bar" });
  });

  // From: https://gcanti.github.io/fp-ts/guides/do-notation.html
  it("bindTo", async () => {
    expect(
      await pipe(
        task("foo"),
        T.bindTo("x"),
        T.bind("y", () => task("bar")), //
      )(),
    ).toEqual({ x: "foo", y: "bar" });
  });
});
