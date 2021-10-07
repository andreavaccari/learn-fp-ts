import { apply, flow, pipe, SK } from "fp-ts/function";

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - //

it("SK", () => {
  expect(
    pipe(
      SK("ignored", 42), //
    ),
  ).toEqual(42);
});

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - //

it("apply", () => {
  const f = (n: number) => (s: string) => `${s}${n}`;
  const f1 = f(1);
  const fs = flow(f, apply("foo"));
  expect(
    f1("foo"), //
  ).toEqual("foo1");
  expect(
    fs(1), //
  ).toEqual("foo1");
});
