import { apply, identity, pipe } from "fp-ts/function";
import * as A from "fp-ts/ReadonlyArray";
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

describe("getRaceMonoid", () => {
  // NOTE: Run only one test because of race conditions with the other tests.
  it.only("Option 1", async () => {
    expect(
      await pipe(
        [
          task("slow", 20),
          task("fast", 10),
          task("slug", 50), //
        ],
        A.foldMap(T.getRaceMonoid<string>())(identity), //
      )(),
    ).toEqual("fast");
    expect(logs).toEqual(["fast"]);
  });

  it("Option 2", async () => {
    // Task<string> -> Task<string> -> Task<string>
    const concat = T.getRaceMonoid<string>().concat;
    expect(
      await pipe(
        concat,
        apply(task("slow", 20)),
        apply(task("fast", 10)), //
      )(),
    ).toEqual("fast");
    expect(logs).toEqual(["fast"]);
  });

  it("Option 3", async () => {
    // Task<string> -> Task<string> -> Task<string>
    const concat = T.getRaceMonoid<string>().concat;
    expect(
      await pipe(
        task("slow", 20),
        concat(task("fast", 10)), //
      )(),
    ).toEqual("fast");
    expect(logs).toEqual(["fast"]);
  });
});
