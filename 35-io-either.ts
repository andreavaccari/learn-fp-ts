import * as Apply from "fp-ts/Apply";
import * as E from "fp-ts/Either";
import { pipe } from "fp-ts/function";
import * as IOE from "fp-ts/IOEither";

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - //

describe("ApplicativePar", () => {
  // From: https://github.com/gcanti/fp-ts/blob/3.0.0/test/IOEither.ts
  // Also: https://github.com/gcanti/fp-ts/commit/530570d63c59e548d8f70849b062fec62de93664#diff-7f5d7d5a53083e763343923c48693b7d18711458fd373aa9405c87a87a4f201d
  // This is the commit where `sequenceT` was removed
  it("example", () => {
    const log: Array<string> = [];
    const a = IOE.rightIO<number, string>(() => log.push("a"));
    const b = IOE.leftIO<string, number>(() => {
      log.push("b");
      return "error";
    });
    const c = IOE.rightIO<number, string>(() => log.push("c"));
    expect(
      pipe(
        IOE.ApT,
        IOE.apT(a),
        IOE.apT(b),
        IOE.apT(c), //
      )(),
    ).toEqual(E.left("error"));
    expect(
      log, //
    ).toEqual(["a", "b", "c"]); // <- All tasks executed

    // Extra: this is the pipe used in the official repo
    const tuple =
      <A>(a: A) =>
      <B>(b: B) =>
      <C>(c: C): readonly [A, B, C] =>
        [a, b, c];
    const A = IOE.ApplicativePar;
    expect(
      pipe(
        a,
        A.map(tuple),
        A.ap(b),
        A.ap(c), //
      )(),
    ).toEqual(
      pipe(
        IOE.ApT,
        IOE.apT(a),
        IOE.apT(b),
        IOE.apT(c), //
      )(),
    );
  });
});

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - //

describe("ApplicativeSeq", () => {
  // From: https://github.com/gcanti/fp-ts/blob/3.0.0/test/IOEither.ts
  // Also: https://github.com/gcanti/fp-ts/commit/530570d63c59e548d8f70849b062fec62de93664#diff-7f5d7d5a53083e763343923c48693b7d18711458fd373aa9405c87a87a4f201d
  // This is the commit where `sequenceT` was removed
  it("example", () => {
    const log: Array<string> = [];
    const a = IOE.rightIO<number, string>(() => log.push("a"));
    const b = IOE.leftIO<string, number>(() => {
      log.push("b");
      return "error";
    });
    const c = IOE.rightIO<number, string>(() => log.push("c"));
    expect(
      pipe(
        IOE.ApT,
        Apply.apT(IOE.ApplySeq)(a),
        Apply.apT(IOE.ApplySeq)(b),
        Apply.apT(IOE.ApplySeq)(c),
      )(),
    ).toEqual(E.left("error"));
    expect(
      log, //
    ).toEqual(["a", "b"]); // <- Tasks stopped after `b` returned `left`

    // Extra: this is the pipe used in the official repo
    const tuple =
      <A>(a: A) =>
      <B>(b: B) =>
      <C>(c: C): readonly [A, B, C] =>
        [a, b, c];
    const A = IOE.ApplicativeSeq;
    expect(
      pipe(
        a,
        A.map(tuple),
        A.ap(b),
        A.ap(c), //
      )(),
    ).toEqual(
      pipe(
        IOE.ApT,
        Apply.apT(IOE.ApplySeq)(a),
        Apply.apT(IOE.ApplySeq)(b),
        Apply.apT(IOE.ApplySeq)(c), //
      )(),
    );
  });
});
