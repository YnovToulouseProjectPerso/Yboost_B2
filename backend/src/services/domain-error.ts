export type ErrorCode =
  | 'INVALID_REQUEST'
  | 'UNKNOWN_ROOM'
  | 'UNKNOWN_SUSPECT'
  | 'GAME_NOT_FOUND'
  | 'STALE_VERSION'
  | 'GAME_OVER'
  | 'DAWN_ACCUSATION_ONLY'
  | 'ROOM_NOT_ADJACENT'
  | 'ROOM_LOCKED'
  | 'ROOM_EXHAUSTED'
  | 'SUSPECT_ABSENT'
  | 'CLUE_NOT_OWNED'
  | 'ALREADY_OBTAINED'
  | 'GAME_IN_PROGRESS';

export class DomainError extends Error {
  code: ErrorCode;
  game?: unknown;

  constructor(code: ErrorCode, message: string) {
    super(message);
    this.code = code;
  }
}
