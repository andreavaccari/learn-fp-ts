import * as Apply from "fp-ts/Apply";
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

describe("ApT...apT", () => {
  it("Option 1 (parallel)", async () => {
    expect(
      await pipe(
        T.ApT,
        T.apT(task("slow", 20)),
        T.apT(task("fast", 0)), //
      )(),
    ).toEqual(["slow", "fast"]);
    expect(logs).toEqual(["fast", "slow"]);
  });

  it("Option 2 (parallel)", async () => {
    expect(
      await pipe(
        task("slow", 20),
        T.tupled,
        T.apT(task("fast", 0)), //
      )(),
    ).toEqual(["slow", "fast"]);
    expect(logs).toEqual(["fast", "slow"]);
  });

  it("Option 3 (sequential)", async () => {
    expect(
      await pipe(
        T.ApT,
        Apply.apT(T.ApplySeq)(task("slow", 20)),
        Apply.apT(T.ApplySeq)(task("fast", 0)), //
      )(),
    ).toEqual(["slow", "fast"]);
    expect(logs).toEqual(["slow", "fast"]);
  });
});

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - //

describe("Do...apS", () => {
  it("Option 1 (parallel)", async () => {
    expect(
      await pipe(
        T.Do,
        T.apS("a", task("slow", 20)),
        T.apS("b", task("fast", 0)), //
      )(),
    ).toEqual({ a: "slow", b: "fast" });
    expect(logs).toEqual(["fast", "slow"]);
  });

  it("Option 2 (parallel)", async () => {
    expect(
      await pipe(
        task("slow", 20),
        T.bindTo("a"),
        T.apS("b", task("fast", 0)), //
      )(),
    ).toEqual({ a: "slow", b: "fast" });
    expect(logs).toEqual(["fast", "slow"]);
  });

  it("Option 3 (sequential)", async () => {
    expect(
      await pipe(
        T.Do,
        Apply.apS(T.ApplySeq)("a", task("slow", 20)),
        Apply.apS(T.ApplySeq)("b", task("fast", 0)), //
      )(),
    ).toEqual({ a: "slow", b: "fast" });
    expect(logs).toEqual(["slow", "fast"]);
  });
});

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - //

describe("Do...bind (sequential)", () => {
  it("Option 1", async () => {
    expect(
      await pipe(
        T.Do,
        T.bind("a", () => task("slow", 20)),
        T.bind("b", (ctx) => task(`${ctx.a}fast`, 0)), //
      )(),
    ).toEqual({ a: "slow", b: "slowfast" });
    expect(logs).toEqual(["slow", "slowfast"]);
  });

  it("Option 2", async () => {
    expect(
      await pipe(
        task("slow", 20),
        T.bindTo("a"),
        T.bind("b", (ctx) => task(`${ctx.a}fast`, 0)), //
      )(),
    ).toEqual({ a: "slow", b: "slowfast" });
    expect(logs).toEqual(["slow", "slowfast"]);
  });
});
