// Jamais de Math.random() dans les règles : il sert uniquement à générer une graine.
import type { Die } from './game.ts';

const increment = 0x9e3779b97f4a7c15n;
const mask64 = 0xffff_ffff_ffff_ffffn;
const range53 = 0x20_0000_0000_0000;

function assertSeed(seed: number): void {
  if (!Number.isSafeInteger(seed) || seed <= 0) {
    throw new RangeError('La graine doit être un entier positif sûr.');
  }
}

function assertPosition(position: number): void {
  if (!Number.isSafeInteger(position) || position < 0) {
    throw new RangeError('La position du dé doit être un entier positif ou nul sûr.');
  }
}

function nextUint64(state: bigint): bigint {
  let value = state;
  value = ((value ^ (value >> 30n)) * 0xbf58476d1ce4e5b9n) & mask64;
  value = ((value ^ (value >> 27n)) * 0x94d049bb133111ebn) & mask64;
  return value ^ (value >> 31n);
}

export function createDie(
  seed: number,
  position: number,
): { die: Die; position: () => number } {
  assertSeed(seed);
  assertPosition(position);

  let randomState = (BigInt(seed) + BigInt(position) * increment) & mask64;
  let currentPosition = position;

  return {
    die: () => {
      if (currentPosition === Number.MAX_SAFE_INTEGER) {
        throw new RangeError('La position du dé a atteint sa limite.');
      }

      randomState = (randomState + increment) & mask64;
      currentPosition += 1;
      const sample = Number(nextUint64(randomState) >> 11n) / range53;
      return Math.floor(sample * 6) + 1;
    },
    position: () => currentPosition,
  };
}

export function generateSeed(): number {
  return Math.floor(Math.random() * 0xffff_ffff) + 1;
}

export function riggedDie(values: readonly number[]): Die {
  for (const [index, value] of values.entries()) {
    if (!Number.isInteger(value) || value < 1 || value > 6) {
      throw new RangeError(`La valeur ${index + 1} du dé truqué doit être comprise entre 1 et 6.`);
    }
  }

  let position = 0;
  return () => {
    if (position >= values.length) {
      throw new Error(`Le dé truqué n'a plus de résultat au tirage ${position + 1}.`);
    }

    const value = values[position];
    position += 1;
    return value;
  };
}
