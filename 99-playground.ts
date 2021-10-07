import * as E from "fp-ts/Either";
import { flow, identity, pipe, SK } from "fp-ts/function";
import * as RA from "fp-ts/ReadonlyArray";
import { Tuple2 } from "fp-ts/Tuple2";
import { keyBy } from "lodash-es";
import { combineLatest, filter, firstValueFrom, map, of } from "rxjs";
import { isDefined } from "./utils";

describe("With Either", () => {
  it("All rights", async () => {
    interface Card { id: string; name: string};
    interface Deck { id: string; name: string; idsCard: string[];};

    const card1 = { id: "c1", name: "card 1" };
    const card2 = { id: "c2", name: "card 2" };
    const deck1 = { id: "d1", name: "deck 1", idsCard: ["c1", "c2"] };

    const cards = of(E.right([card1, card2]));
    const decks = of(E.right([deck1]));

    const test: Tuple2<Deck[], Card[]> = [[card1, card2], [deck1], ];

    expect(
      await pipe(
        [[deck1], [card1, card2]],
        RA.map((data) => {
          const decks = data[0];
          const cards = data[1];
          const mapCards = keyBy(cards, (c) => c.id);
          return pipe(
            decks,
            RA.map((d) => "todo");
          );
        }

        )
        map(
          flow(
            E.traverseReadonlyArrayWithIndex(SK),
            E.matchW(
              (e) => {
                console.warn(e);
                return undefined;
              },
              ([decks, cards]) => ({ decks, cards }),

            ),
          ),
        ),
        filter(isDefined),
        firstValueFrom,
      ),
    ).toEqual({ decks: [deck1], cards: [card1, card2] });




    expect(
      await pipe(
        combineLatest([decks, cards]),
        map(
          flow(
            E.traverseReadonlyArrayWithIndex(SK),
            E.matchW(
              (e) => {
                console.warn(e);
                return undefined;
              },
              ([decks, cards]) => ({ decks, cards }),

            ),
          ),
        ),
        filter(isDefined),
        firstValueFrom,
      ),
    ).toEqual({ decks: [deck1], cards: [card1, card2] });

    expect(
      pipe(
        [1, "2"],
        E.traverseReadonlyArrayWithIndex(flow(SK, E.right)), //
      ),
    ).toEqual(E.right([1, "2"]));

    // NOTE: This is less efficient and should not be used.
    expect(
      pipe(
        [E.right(1)],
        RA.traverse(E.Applicative)(identity), //
      ),
    ).toEqual(
      pipe(
        [E.right(1)],
        E.traverseReadonlyArrayWithIndex(SK), //
      ),
    );
  });

  it("Some lefts", async () => {
    expect(
      pipe(
        [E.left(1), E.right(2)],
        E.traverseReadonlyArrayWithIndex(SK), //
      ),
    ).toEqual(E.left(1));

    expect(
      pipe(
        [E.right(1), E.left(2)],
        E.traverseReadonlyArrayWithIndex(SK), //
      ),
    ).toEqual(E.left(2));

    expect(
      pipe(
        [E.left(1), E.left(2)],
        E.traverseReadonlyArrayWithIndex(SK), //
      ),
    ).toEqual(E.left(1));
  });
});
