export function speedOfSound(tempCelsius: number): number {
  return 331.3 + 0.606 * tempCelsius;
}

export function pipeLengthMeters(frequency: number, tempCelsius: number): number {
  const v = speedOfSound(tempCelsius);
  return v / (2 * frequency);
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
