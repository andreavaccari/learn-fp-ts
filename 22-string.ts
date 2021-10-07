import { pipe } from "fp-ts/function";
import * as S from "fp-ts/string";

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - //

describe("Show", () => {
  it("show", () => {
    expect(
      pipe(
        "foo",
        S.Show.show, //
      ),
    ).toEqual('"foo"'); // Note the added quotes
  });
});

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - //

describe("utilities", () => {
  it("isEmpty", () => {
    expect(
      pipe(
        "",
        S.isEmpty, //
      ),
    ).toEqual(true);

    expect(
      pipe(
        "foo",
        S.isEmpty, //
      ),
    ).toEqual(false);
  });

  it.todo("includes, ...");
});
