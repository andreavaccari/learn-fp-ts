import { flow, pipe } from "fp-ts/function";
import * as IO from "fp-ts/IO";
import * as R from "fp-ts/Reader";
import * as RT from "fp-ts/ReaderTask";
import * as S from "fp-ts/string";
import * as T from "fp-ts/Task";

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - //

describe("Constructors", () => {
  // From: https://github.com/gcanti/fp-ts/blob/3.0.0/test/ReaderTask.ts
  it("of", async () => {
    expect(
      await pipe(
        RT.of(1),
        RT.map((x) => x * 2),
      )({})(),
    ).toEqual(2);
  });

  // From: https://github.com/gcanti/fp-ts/blob/3.0.0/test/ReaderTask.ts
  it("fromIO", async () => {
    expect(
      await pipe(
        RT.fromIO(IO.of(1)),
        RT.map((x) => x * 2),
      )({})(),
    ).toEqual(2);
  });

  // From: https://github.com/gcanti/fp-ts/blob/3.0.0/test/ReaderTask.ts
  it("fromTask", async () => {
    expect(
      await pipe(
        RT.fromTask(T.of(1)),
        RT.map((x) => x * 2),
      )({})(),
    ).toEqual(2);
  });

  // From: https://github.com/gcanti/fp-ts/blob/3.0.0/test/ReaderTask.ts
  it("fromReader", async () => {
    expect(
      await pipe(
        RT.fromReader(R.of(1)),
        RT.map((x) => x * 2),
      )({})(),
    ).toEqual(2);
  });
});

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - //

describe("Apply", () => {
  // From: https://github.com/gcanti/fp-ts/blob/3.0.0/test/ReaderTask.ts
  it("ap", async () => {
    expect(
      await pipe(
        RT.of((x: number) => x * 2),
        RT.ap(RT.of(1)),
      )({})(),
    ).toEqual(2);
  });

  // From: https://github.com/gcanti/fp-ts/blob/3.0.0/test/ReaderTask.ts
  it("apFirst", async () => {
    expect(
      await pipe(
        RT.of(1),
        RT.apFirst(RT.of(2)), //
      )({})(),
    ).toEqual(1);
  });

  // From: https://github.com/gcanti/fp-ts/blob/3.0.0/test/ReaderTask.ts
  it("apSecond", async () => {
    expect(
      await pipe(
        RT.of(1),
        RT.apSecond(RT.of(2)), //
      )({})(),
    ).toEqual(2);
  });
});

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - //

describe("Chain", () => {
  // From: https://github.com/gcanti/fp-ts/blob/3.0.0/test/ReaderTask.ts
  it("ap", async () => {
    expect(
      await pipe(
        RT.of("foo"),
        RT.chain(flow(S.size, RT.of)), //
      )({})(),
    ).toEqual(3);
  });

  // From: https://github.com/gcanti/fp-ts/blob/3.0.0/test/ReaderTask.ts
  it("apFirst", async () => {
    expect(
      await pipe(
        RT.of("foo"),
        RT.chainFirst(flow(S.size, RT.of)), //
      )({})(),
    ).toEqual("foo");
  });

  // From: https://github.com/gcanti/fp-ts/blob/3.0.0/test/ReaderTask.ts
  it("apSecond", async () => {
    expect(
      await pipe(
        RT.of("foo"),
        RT.of,
        RT.of,
        RT.flatten,
        RT.flatten, //
      )({})(),
    ).toEqual("foo");
  });
});

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - //

describe("Ask", () => {
  type Ctx = { a: number; b: string };

  // From: https://github.com/gcanti/fp-ts/blob/3.0.0/test/ReaderTask.ts
  it("RT.ask", async () => {
    expect(
      await pipe(
        RT.ask<Ctx>(),
        RT.map(({ a }) => a * 2), //
      )({ a: 1, b: "foo" })(),
    ).toEqual(2);
  });

  // From: https://github.com/gcanti/fp-ts/blob/3.0.0/test/ReaderTask.ts
  it("RT.asks", async () => {
    expect(
      await pipe(
        RT.asks((ctx: Ctx) => ctx.b),
        RT.map(S.size), //
      )({ a: 1, b: "foo" })(),
    ).toEqual(3);
  });

  // From: https://github.com/gcanti/fp-ts/blob/3.0.0/test/Reader.ts
  it("RT.local", async () => {
    interface E {
      readonly name: string;
    }
    const x = pipe(
      (s: string) => T.of(s.length),
      RT.local((e: E) => e.name),
    );
    // expect(x({ name: "foo" })()).toEqual(3);

    expect(
      await pipe(
        RT.asks((ctx: Ctx) => ctx.b),
        RT.local((ctx: Ctx) => ({ ...ctx, b: "foobar" })),
        RT.map(S.size), //
      )({ a: 1, b: "foo" })(),
    ).toEqual(3);
  });
});
