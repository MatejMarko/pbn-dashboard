import { AtLeastPipe, AtMostPipe } from './screen-size-pipe';

describe('AtLeastPipe', () => {
  const pipe = new AtLeastPipe();

  it.each([
    { current: 'LG' as const, threshold: 'SM' as const, expected: true },
    { current: 'LG' as const, threshold: 'MD' as const, expected: true },
    { current: 'LG' as const, threshold: 'LG' as const, expected: true },
    { current: 'MD' as const, threshold: 'SM' as const, expected: true },
    { current: 'MD' as const, threshold: 'MD' as const, expected: true },
    { current: 'MD' as const, threshold: 'LG' as const, expected: false },
    { current: 'SM' as const, threshold: 'SM' as const, expected: true },
    { current: 'SM' as const, threshold: 'MD' as const, expected: false },
    { current: 'SM' as const, threshold: 'LG' as const, expected: false },
  ])('$current atLeast $threshold → $expected', ({ current, threshold, expected }) => {
    expect(pipe.transform(current, threshold)).toBe(expected);
  });
});

describe('AtMostPipe', () => {
  const pipe = new AtMostPipe();

  it.each([
    { current: 'SM' as const, threshold: 'LG' as const, expected: true },
    { current: 'SM' as const, threshold: 'MD' as const, expected: true },
    { current: 'SM' as const, threshold: 'SM' as const, expected: true },
    { current: 'MD' as const, threshold: 'LG' as const, expected: true },
    { current: 'MD' as const, threshold: 'MD' as const, expected: true },
    { current: 'MD' as const, threshold: 'SM' as const, expected: false },
    { current: 'LG' as const, threshold: 'LG' as const, expected: true },
    { current: 'LG' as const, threshold: 'MD' as const, expected: false },
    { current: 'LG' as const, threshold: 'SM' as const, expected: false },
  ])('$current atMost $threshold → $expected', ({ current, threshold, expected }) => {
    expect(pipe.transform(current, threshold)).toBe(expected);
  });
});
