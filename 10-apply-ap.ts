import { pipe } from "fp-ts/function";
import * as S from "fp-ts/string";
import * as T from "fp-ts/Task";

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - //

const logs: Array<string> = [];
const task = (name: string, millis: number): T.Task<string> =>
  pipe(
    T.of(name),
    T.delay(millis),
    T.chainFirst(() => T.fromIO(() => logs.push(name))),
  );

beforeEach(() => {
  logs.length = 0;
});

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - //

describe("f...*.ap (parallel)", () => {
  it("Option 1", async () => {
    expect(
      await pipe(
        T.of(S.Semigroup.concat), // Task<string -> string -> string>
        T.ap(task("fast", 0)),
        T.ap(task("slow", 20)), //
      )(),
    ).toEqual("slowfast");
    expect(logs).toEqual(["fast", "slow"]);
  });

  it("Option 2", async () => {
    expect(
      await pipe(
        T.of(S.Semigroup.concat),
        T.ApplyPar.ap(task("fast", 0)),
        T.ApplyPar.ap(task("slow", 20)), //
      )(),
    ).toEqual("slowfast");
    expect(logs).toEqual(["fast", "slow"]);
  });

  it("Option 3", async () => {
    expect(
      await pipe(
        T.of(S.Semigroup.concat),
        T.ApplicativePar.ap(task("fast", 0)),
        T.ApplicativePar.ap(task("slow", 20)), //
      )(),
    ).toEqual("slowfast");
    expect(logs).toEqual(["fast", "slow"]);
  });
});

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - //

describe("f...*.ap (sequential)", () => {
  // NOTE: *.apSeq is not exported, so Option 1 is not available in this case.
  // it("Option 1", async () => {
  //   expect(
  //     await pipe(
  //       T.of(S.Semigroup.concat),
  //       T.apSeq(task("slow", 20)),
  //       T.apSeq(task("fast", 0)), //
  //     )(),
  //   ).toEqual("slowfast");
  //   expect(logs).toEqual(["slow", "fast"]);
  // });

  it("Option 2", async () => {
    expect(
      await pipe(
        T.of(S.Semigroup.concat),
        T.ApplySeq.ap(task("slow", 20)),
        T.ApplySeq.ap(task("fast", 0)), //
      )(),
    ).toEqual("fastslow");
    expect(logs).toEqual(["slow", "fast"]);
  });

  it("Option 3", async () => {
    expect(
      await pipe(
        T.of(S.Semigroup.concat),
        T.ApplicativeSeq.ap(task("slow", 20)),
        T.ApplicativeSeq.ap(task("fast", 0)), //
      )(),
    ).toEqual("fastslow");
    expect(logs).toEqual(["slow", "fast"]);
  });
});
