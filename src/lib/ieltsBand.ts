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
