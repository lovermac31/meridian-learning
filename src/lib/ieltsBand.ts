/** IELTS skill bands are whole or half bands from 0 to 9. */
export function isValidBand(value: number): boolean {
  return Number.isFinite(value) && value >= 0 && value <= 9 && Number.isInteger(value * 2);
}

/** Round the arithmetic mean to the nearest half band; .25 and .75 round up. */
export function calculateOverallBand(bands: number[]): number {
  if (bands.length !== 4 || !bands.every(isValidBand)) throw new RangeError('Four valid skill bands are required.');
  const halfBandUnits = bands.reduce((sum, band) => sum + band * 2, 0);
  return Math.floor((halfBandUnits + 2) / 4) / 2;
}

/** Every IELTS average is a multiple of 0.125 (four half-band skills); these are the fractional parts that can occur. */
export const AVERAGE_FRACTIONS = [0, 0.125, 0.25, 0.375, 0.5, 0.625, 0.75, 0.875] as const;

/** The overall band an average rounds to, using the same rule as calculateOverallBand. */
export function roundAverage(average: number): number {
  return Math.floor((average * 8 + 2) / 4) / 2;
}

/**
 * The lowest band in the missing skill that reaches `target` overall, given the other three skill bands.
 * Returns null when even a 9.0 cannot reach the target.
 */
export function minimumBandForTarget(known: number[], target: number): number | null {
  if (known.length !== 3 || !known.every(isValidBand) || !isValidBand(target)) throw new RangeError('Three valid skill bands and a valid target are required.');
  for (let units = 0; units <= 18; units += 1) {
    if (calculateOverallBand([...known, units / 2]) >= target) return units / 2;
  }
  return null;
}
