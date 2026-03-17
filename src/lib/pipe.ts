export function speedOfSound(tempCelsius: number): number {
  return 331.3 + 0.606 * tempCelsius;
}

export function endCorrectionMeters(diameterMm: number, openEnds: number = 2): number {
  const radiusMeters = diameterMm / 2000;
  return 0.6 * radiusMeters * openEnds;
}

export function pipeLengthMeters(
  frequency: number,
  tempCelsius: number,
  diameterMm: number = 0,
): number {
  const v = speedOfSound(tempCelsius);
  const acousticLength = v / (2 * frequency);
  const correctedLength = acousticLength - endCorrectionMeters(diameterMm);

  return Math.max(correctedLength, 0);
}

export function metersToCm(m: number): number {
  return m * 100;
}

export function metersToMm(m: number): number {
  return m * 1000;
}

export function metersToInches(m: number): number {
  return m * 39.3701;
}

export function mmToInches(mm: number): number {
  return mm / 25.4;
}

export function inchesToMm(inches: number): number {
  return inches * 25.4;
}

export function formatLength(meters: number, unit: "metric" | "imperial"): string {
  if (unit === "imperial") {
    const inches = metersToInches(meters);
    if (inches < 1) {
      return `${(inches * 16).toFixed(1)}/16"`;
    }
    return `${inches.toFixed(2)}"`;
  }
  const cm = metersToCm(meters);
  if (cm < 1) {
    return `${metersToMm(meters).toFixed(1)} mm`;
  }
  return `${cm.toFixed(2)} cm`;
}
