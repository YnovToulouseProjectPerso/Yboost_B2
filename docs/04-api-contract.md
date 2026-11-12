# API contract: Game

The API returns the `Game` player view after creating a game and after each
accepted action. It is built from the game state and the scenario definition.
The internal state, solution, clue evidence mappings, and interrogation
combinations are never part of this response.

## `Game`

| Field | Type | Meaning |
| --- | --- | --- |
| `gameId` | `string` | Unique identifier of the game |
| `seed` | `integer` | Positive seed used to reproduce the game |
| `version` | `integer` | Current game version |
| `status` | `in_progress \| dawn \| victory \| defeat` | Public game status |
| `remainingActions` | `integer` | Number of actions left |
| `time` | `string` | Game time, derived from the starting time and actions spent |
| `currentRoom` | `object` | `{ id, name, description, fullySearched }` |
| `adjacentRooms` | `object[]` | Adjacent `{ id, name, locked }` rooms |
| `presentSuspects` | `object[]` | Suspects in the current room, each `{ id, name, role }` |
| `notebook` | `object[]` | Obtained clues in order, each `{ id, title, text, source, location }` |
| `items` | `object[]` | Owned items, each `{ id, name }` |
| `lastEvent` | `object` | Latest public event `{ type, result, text }` |
| `log` | `object[]` | Public event history, each `{ version, type, result, text }` |
| `suspects` | `object[]` | All suspects, each `{ id, name, role }`, for the accusation interface |

`source` is `search` or `interrogation`. `result` is a string or `null`.
Event types are `introduction`, `movement`, `search`, `interrogation`,
`accusation`, and `dawn`.

The view deliberately omits internal state fields such as `dieState`,
`unlockedRooms`, `searches`, `obtainedRevelations`, `interrogationsDone`, and
`accusation`. Clue responses omit `evidenceAgainst`; suspects omit their
location and any indication of guilt. Never add the culprit, interrogation
combinations, or remaining clue order to this contract.

The authoritative runtime schema is [`backend/src/schemas/game.ts`](../backend/src/schemas/game.ts).
