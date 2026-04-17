/**
 * physics.js — Core physics utilities for semiconductor circuit simulation.
 *
 * Provides Ohm's law, power, and series/parallel resistance calculations
 * used across the dashboard components.
 */

/**
 * Calculate current using Ohm's law: I = V / R
 * @param {number} voltage - Voltage in volts (V)
 * @param {number} resistance - Resistance in ohms (Ω)
 * @returns {number} Current in amperes (A)
 */
export function calculateCurrent(voltage, resistance) {
  if (resistance === 0) return Infinity;
  return voltage / resistance;
}

/**
 * Calculate voltage using Ohm's law: V = I × R
 * @param {number} current - Current in amperes (A)
 * @param {number} resistance - Resistance in ohms (Ω)
 * @returns {number} Voltage in volts (V)
 */
export function calculateVoltage(current, resistance) {
  return current * resistance;
}

/**
 * Calculate power: P = V × I  or  P = V² / R
 * @param {number} voltage - Voltage in volts (V)
 * @param {number} current - Current in amperes (A)
 * @returns {number} Power in watts (W)
 */
export function calculatePower(voltage, current) {
  return voltage * current;
}

/**
 * Calculate total resistance for resistors in series.
 * @param {number[]} resistances - Array of resistance values (Ω)
 * @returns {number} Total series resistance (Ω)
 */
export function seriesResistance(resistances) {
  return resistances.reduce((sum, r) => sum + r, 0);
}

/**
 * Calculate total resistance for resistors in parallel.
 * @param {number[]} resistances - Array of resistance values (Ω)
 * @returns {number} Total parallel resistance (Ω)
 */
export function parallelResistance(resistances) {
  if (resistances.length === 0) return 0;
  const reciprocalSum = resistances.reduce((sum, r) => {
    if (r === 0) return Infinity;
    return sum + 1 / r;
  }, 0);
  return reciprocalSum === Infinity ? 0 : 1 / reciprocalSum;
}

/**
 * Generate a voltage sweep dataset.
 * Returns an array of { voltage, current, power } objects.
 * @param {number} startV - Start voltage (V)
 * @param {number} endV - End voltage (V)
 * @param {number} steps - Number of data points
 * @param {number} resistance - Circuit resistance (Ω)
 * @returns {{ voltage: number, current: number, power: number }[]}
 */
export function voltageSweep(startV, endV, steps, resistance) {
  const data = [];
  const stepSize = (endV - startV) / (steps - 1);
  for (let i = 0; i < steps; i++) {
    const voltage = parseFloat((startV + stepSize * i).toFixed(4));
    const current = parseFloat(calculateCurrent(voltage, resistance).toFixed(6));
    const power = parseFloat(calculatePower(voltage, current).toFixed(6));
    data.push({ voltage, current, power });
  }
  return data;
}

/* ═══════════════════════════════════════════════════════════════
 *  MODULE 2 — LIGHT SENSOR PHYSICS ENGINE
 *  LDR (Light Dependent Resistor) & Photodiode models
 * ═══════════════════════════════════════════════════════════════ */

/** Default constants — exposed so UI can let users tune them */
export const LDR_DEFAULTS = {
  k: 50000,       // dark resistance scaling factor (Ω)
  n: 1.2,         // nonlinearity exponent
  R_fixed: 10000, // series resistor in voltage divider (Ω)
};

export const PHOTODIODE_DEFAULTS = {
  k: 0.00001,     // photocurrent sensitivity (A/lux)
  R_load: 10000,  // load resistor (Ω)
};

/**
 * LDR resistance as a function of illuminance.
 *   R_LDR = k / (lux + 1)^n
 *
 * As light ↑ → resistance ↓  (nonlinear, realistic CdS cell behavior)
 *
 * @param {number} lux       - Illuminance (lux), ≥ 0
 * @param {object} [constants] - { k, n } overrides
 * @returns {number} LDR resistance in ohms (Ω)
 */
export function calculateLDRResistance(lux, constants = {}) {
  const { k = LDR_DEFAULTS.k, n = LDR_DEFAULTS.n } = constants;
  return k / Math.pow(Math.max(lux, 0) + 1, n);
}

/**
 * LDR voltage divider output.
 *   Vout = Vcc × R_LDR / (R_fixed + R_LDR)
 *
 * @param {number} lux       - Illuminance (lux)
 * @param {number} Vcc       - Supply voltage (V)
 * @param {object} [constants] - { k, n, R_fixed } overrides
 * @returns {number} Output voltage (V)
 */
export function calculateLDRVoltage(lux, Vcc, constants = {}) {
  const {
    k = LDR_DEFAULTS.k,
    n = LDR_DEFAULTS.n,
    R_fixed = LDR_DEFAULTS.R_fixed,
  } = constants;

  const R_LDR = k / Math.pow(Math.max(lux, 0) + 1, n);
  return Vcc * (R_LDR / (R_fixed + R_LDR));
}

/**
 * Photodiode photocurrent.
 *   I = k × lux
 *
 * Linear response — faster & more accurate than LDR.
 *
 * @param {number} lux       - Illuminance (lux)
 * @param {object} [constants] - { k } override
 * @returns {number} Photocurrent in amperes (A)
 */
export function calculatePhotodiodeCurrent(lux, constants = {}) {
  const { k = PHOTODIODE_DEFAULTS.k } = constants;
  return k * Math.max(lux, 0);
}

/**
 * Photodiode voltage output across load resistor.
 *   Vout = I × R_load = k × lux × R_load
 *
 * @param {number} lux       - Illuminance (lux)
 * @param {object} [constants] - { k, R_load } overrides
 * @returns {number} Output voltage (V)
 */
export function calculatePhotodiodeVoltage(lux, constants = {}) {
  const {
    k = PHOTODIODE_DEFAULTS.k,
    R_load = PHOTODIODE_DEFAULTS.R_load,
  } = constants;

  const I = k * Math.max(lux, 0);
  return I * R_load;
}

/**
 * Generate a lux sweep for LDR.
 * Returns an array of { lux, resistance, voltage } objects.
 *
 * @param {number} startLux  - Starting illuminance (lux)
 * @param {number} endLux    - Ending illuminance (lux)
 * @param {number} steps     - Number of data points
 * @param {number} Vcc       - Supply voltage (V)
 * @param {object} [constants] - LDR constant overrides
 * @returns {{ lux: number, resistance: number, voltage: number }[]}
 */
export function ldrLuxSweep(startLux, endLux, steps, Vcc, constants = {}) {
  const data = [];
  const stepSize = (endLux - startLux) / (steps - 1);
  for (let i = 0; i < steps; i++) {
    const lux = parseFloat((startLux + stepSize * i).toFixed(2));
    const resistance = parseFloat(calculateLDRResistance(lux, constants).toFixed(2));
    const voltage = parseFloat(calculateLDRVoltage(lux, Vcc, constants).toFixed(6));
    data.push({ lux, resistance, voltage });
  }
  return data;
}

/**
 * Generate a lux sweep for Photodiode.
 * Returns an array of { lux, current, voltage } objects.
 *
 * @param {number} startLux  - Starting illuminance (lux)
 * @param {number} endLux    - Ending illuminance (lux)
 * @param {number} steps     - Number of data points
 * @param {object} [constants] - Photodiode constant overrides
 * @returns {{ lux: number, current: number, voltage: number }[]}
 */
export function photodiodeLuxSweep(startLux, endLux, steps, constants = {}) {
  const data = [];
  const stepSize = (endLux - startLux) / (steps - 1);
  for (let i = 0; i < steps; i++) {
    const lux = parseFloat((startLux + stepSize * i).toFixed(2));
    const current = parseFloat(calculatePhotodiodeCurrent(lux, constants).toFixed(8));
    const voltage = parseFloat(calculatePhotodiodeVoltage(lux, constants).toFixed(6));
    data.push({ lux, current, voltage });
  }
  return data;
}
