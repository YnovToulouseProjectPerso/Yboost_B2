import { describe, expect, test } from 'vitest';
import { createDie, generateSeed, riggedDie } from '../src/services/die.ts';

function roll(die: () => number, count: number): number[] {
  return Array.from({ length: count }, () => die());
}

describe('seeded die', () => {
  test('produces the same first 100 rolls for the same seed', () => {
    const first = createDie(12345, 0).die;
    const second = createDie(12345, 0).die;

    expect(roll(first, 100)).toEqual(roll(second, 100));
  });

  test('produces different sequences for different seeds', () => {
    const first = roll(createDie(12345, 0).die, 20);
    const second = roll(createDie(54321, 0).die, 20);

    expect(second).not.toEqual(first);
  });

  test('keeps distinct large seeds from collapsing to the same sequence', () => {
    const first = roll(createDie(1, 0).die, 20);
    const second = roll(createDie(4_294_967_296, 0).die, 20);

    expect(second).not.toEqual(first);
  });

  test('returns d6 values with an even distribution over 6,000 rolls', () => {
    const rolls = roll(createDie(42, 0).die, 6_000);
    const counts = Array.from({ length: 6 }, (_, index) =>
      rolls.filter((value) => value === index + 1).length,
    );

    expect(rolls.every((value) => Number.isInteger(value) && value >= 1 && value <= 6)).toBe(true);
    expect(counts.every((count) => count >= 800 && count <= 1_200)).toBe(true);
  });

  test('resumes at the requested position and reports the current position', () => {
    const uninterrupted = createDie(987, 0);
    const firstThree = roll(uninterrupted.die, 3);
    const expectedFourth = uninterrupted.die();
    const resumed = createDie(987, 3);

    expect(firstThree).toHaveLength(3);
    expect(resumed.die()).toBe(expectedFourth);
    expect(resumed.position()).toBe(4);
  });

  test('generates a positive integer seed', () => {
    const seed = generateSeed();

    expect(Number.isSafeInteger(seed)).toBe(true);
    expect(seed).toBeGreaterThan(0);
  });
});

describe('rigged die', () => {
  test('returns values in order and fails clearly when exhausted', () => {
    const die = riggedDie([1, 6]);

    expect(die()).toBe(1);
    expect(die()).toBe(6);
    expect(die).toThrow("Le dé truqué n'a plus de résultat au tirage 3.");
  });

  test('rejects invalid seeds, positions, and rigged values', () => {
    expect(() => createDie(0, 0)).toThrow(RangeError);
    expect(() => createDie(1, -1)).toThrow(RangeError);
    expect(() => riggedDie([7])).toThrow(RangeError);
  });
});
