import { pipe } from "fp-ts/function";
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

describe("f...*.chain (sequential)", () => {
  it("With chainFirst", async () => {
    expect(
      await pipe(
        task("slow", 20),
        T.chain((s) => task(`${s}fast`, 0)),
        T.chainFirst((s) => task(`${s}last`, 0)), //
      )(),
    ).toEqual("slowfast");
    expect(logs).toEqual(["slow", "slowfast", "slowfastlast"]);
  });

  it("With apFirst", async () => {
    expect(
      await pipe(
        task("slow", 20),
        T.chain((s) => task(`${s}fast`, 0)),
        T.apFirst(task("foo", 0)), //
      )(),
    ).toEqual("slowfast");
    expect(logs).toEqual(["foo", "slow", "slowfast"]);
  });

  it("With apSecond", async () => {
    expect(
      await pipe(
        task("slow", 20),
        T.chain((s) => task(`${s}fast`, 0)),
        T.apSecond(task("fast", 0)), //
      )(),
    ).toEqual("fast");
    expect(logs).toEqual(["fast", "slow", "slowfast"]);
  });
});
