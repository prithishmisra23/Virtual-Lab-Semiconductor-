/**
 * dataProcessing.js — Data transformation and statistics utilities.
 *
 * Used by AnalysisPanel and DataTable to derive insights
 * from raw simulation data.
 */

/**
 * Calculate basic statistics for a numeric array.
 * @param {number[]} values
 * @returns {{ min: number, max: number, mean: number, stdDev: number }}
 */
export function computeStats(values) {
  if (!values || values.length === 0) {
    return { min: 0, max: 0, mean: 0, stdDev: 0 };
  }
  const min = Math.min(...values);
  const max = Math.max(...values);
  const mean = values.reduce((s, v) => s + v, 0) / values.length;
  const variance =
    values.reduce((s, v) => s + (v - mean) ** 2, 0) / values.length;
  const stdDev = Math.sqrt(variance);
  return {
    min: parseFloat(min.toFixed(6)),
    max: parseFloat(max.toFixed(6)),
    mean: parseFloat(mean.toFixed(6)),
    stdDev: parseFloat(stdDev.toFixed(6)),
  };
}

/**
 * Format a number to a fixed decimal string with unit suffix.
 * @param {number} value
 * @param {string} unit - e.g. "V", "A", "W", "Ω"
 * @param {number} [decimals=4]
 * @returns {string}
 */
export function formatValue(value, unit, decimals = 4) {
  if (value === Infinity) return "∞ " + unit;
  if (value === -Infinity) return "-∞ " + unit;
  if (isNaN(value)) return "NaN";
  return `${value.toFixed(decimals)} ${unit}`;
}

/**
 * Convert raw sweep data into Chart.js-compatible datasets.
 * @param {{ voltage: number, current: number, power: number }[]} sweepData
 * @returns {{ labels: string[], currentData: number[], powerData: number[] }}
 */
export function toChartData(sweepData) {
  return {
    labels: sweepData.map((d) => d.voltage.toFixed(2)),
    currentData: sweepData.map((d) => d.current),
    powerData: sweepData.map((d) => d.power),
  };
}

/**
 * Export data as a downloadable CSV string.
 * @param {{ voltage: number, current: number, power: number }[]} data
 * @returns {string} CSV content
 */
export function toCSV(data) {
  const header = "Voltage (V),Current (A),Power (W)";
  const rows = data.map(
    (d) => `${d.voltage},${d.current},${d.power}`
  );
  return [header, ...rows].join("\n");
}

/**
 * Perform linear regression and return sensitivity (slope) and linearity (R²).
 * @param {number[]} xValues - independent variable (e.g. lux)
 * @param {number[]} yValues - dependent variable (e.g. voltage)
 * @returns {{ sensitivity: number, rSquared: number, isLinear: boolean }}
 */
export function analyzeLinearity(xValues, yValues) {
  const n = xValues.length;
  if (n < 2) {
    return { sensitivity: 0, rSquared: 0, isLinear: false };
  }

  let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;
  for (let i = 0; i < n; i++) {
    sumX += xValues[i];
    sumY += yValues[i];
    sumXY += xValues[i] * yValues[i];
    sumXX += xValues[i] * xValues[i];
  }

  const denominator = n * sumXX - sumX * sumX;
  if (denominator === 0) {
    return { sensitivity: 0, rSquared: 0, isLinear: false };
  }

  // Calculate slope (Sensitivity: Δy / Δx)
  const slope = (n * sumXY - sumX * sumY) / denominator;
  // Calculate intercept
  const intercept = (sumY - slope * sumX) / n;

  // Calculate R-squared for linearity check
  const meanY = sumY / n;
  let ssTot = 0, ssRes = 0;
  for (let i = 0; i < n; i++) {
    const yPred = slope * xValues[i] + intercept;
    ssTot += Math.pow(yValues[i] - meanY, 2);
    ssRes += Math.pow(yValues[i] - yPred, 2);
  }

  const rSquared = ssTot === 0 ? 1 : 1 - (ssRes / ssTot);
  const isLinear = rSquared >= 0.98; // Strict threshold for linearity

  return {
    sensitivity: slope,
    rSquared: rSquared,
    isLinear: isLinear,
  };
}
