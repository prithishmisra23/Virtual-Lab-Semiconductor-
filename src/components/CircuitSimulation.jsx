import { useMemo } from "react";

/**
 * CircuitSimulation — Interactive SVG circuits for LDR & Photodiode.
 *
 * Props:
 *  - lux {number}              — light intensity (0–1000)
 *  - voltage {number}          — Vcc supply voltage (V)
 *  - ldrVoltage {number}       — LDR divider output voltage (V)
 *  - photodiodeVoltage {number}— Photodiode output voltage (V)
 *  - ldrResistance {number}    — Current LDR resistance (Ω)
 *  - photodiodeCurrent {number}— Photodiode current (A)
 *  - isRunning {boolean}       — simulation active
 */
export default function CircuitSimulation({
  lux = 100,
  voltage = 5,
  ldrVoltage = 0,
  photodiodeVoltage = 0,
  ldrResistance = 50000,
  photodiodeCurrent = 0,
  isRunning = false,
}) {
  /* ── Derived visual values ── */
  const lightIntensity = Math.min(lux / 1000, 1);
  const glowRadius = 4 + lightIntensity * 18;
  const glowOpacity = 0.15 + lightIntensity * 0.55;
  const currentSpeed = isRunning ? 1.5 + lightIntensity * 3 : 0;

  const formattedLDR_R = useMemo(() => {
    if (ldrResistance >= 1000) return `${(ldrResistance / 1000).toFixed(1)}kΩ`;
    return `${ldrResistance.toFixed(0)}Ω`;
  }, [ldrResistance]);

  return (
    <div className="glass-card p-5 flex flex-col gap-3 animate-fade-in-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold tracking-wide uppercase text-surface-200">
          Circuit Simulation
        </h2>
        <span
          className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
            isRunning
              ? "bg-accent-emerald/15 text-accent-emerald"
              : "bg-surface-700/40 text-surface-200/60"
          }`}
        >
          {isRunning ? "● LIVE" : "○ IDLE"}
        </span>
      </div>

      {/* Two circuits side by side */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* ═══ LDR Voltage Divider Circuit ═══ */}
        <div className="rounded-xl bg-surface-950/60 border border-surface-700/20 p-2 relative overflow-hidden">
          <div className="text-[10px] font-semibold text-accent-cyan/70 uppercase tracking-wider text-center mb-1">
            LDR Voltage Divider
          </div>
          <svg viewBox="0 0 200 220" className="w-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              {/* Glow filters */}
              <filter id="ldr-glow">
                <feGaussianBlur stdDeviation={glowRadius} result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
              <filter id="node-glow">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
              <filter id="wire-glow">
                <feGaussianBlur stdDeviation="1.5" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
              {/* Current flow animation */}
              <circle id="dot" r="2" fill="#22d3ee" opacity="0.9" />
            </defs>

            {/* ── Light source glow ── */}
            <circle
              cx="100" cy="30"
              r={12 + lightIntensity * 8}
              fill={`rgba(251, 191, 36, ${glowOpacity})`}
              filter="url(#ldr-glow)"
            >
              {isRunning && (
                <animate attributeName="r" values={`${12 + lightIntensity * 6};${14 + lightIntensity * 10};${12 + lightIntensity * 6}`} dur="2s" repeatCount="indefinite" />
              )}
            </circle>
            <text x="100" y="33" textAnchor="middle" className="fill-accent-amber" style={{ fontSize: "9px", fontFamily: "Inter", fontWeight: 600 }}>
              ☀ {lux} lux
            </text>

            {/* ── Vcc rail ── */}
            <line x1="40" y1="55" x2="160" y2="55" stroke="rgba(129,140,248,0.5)" strokeWidth="1.5" filter={isRunning ? "url(#wire-glow)" : undefined} />
            <text x="30" y="58" textAnchor="end" style={{ fontSize: "8px", fontFamily: "Inter", fontWeight: 700 }} className="fill-primary-400">
              +{voltage.toFixed(1)}V
            </text>

            {/* ── R_fixed (top resistor) ── */}
            <line x1="100" y1="55" x2="100" y2="75" stroke="rgba(129,140,248,0.4)" strokeWidth="1.5" />
            {/* Resistor zigzag */}
            <polyline
              points="100,75 106,80 94,88 106,96 94,104 106,112 100,117"
              fill="none"
              stroke="rgba(52,211,153,0.7)"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <text x="118" y="98" style={{ fontSize: "7px", fontFamily: "Inter", fontWeight: 600 }} className="fill-accent-emerald/80">
              R₁ = 10kΩ
            </text>

            {/* ── Junction node (Vout) ── */}
            <circle cx="100" cy="130" r="3.5" fill="#22d3ee" filter={isRunning ? "url(#node-glow)" : undefined}>
              {isRunning && (
                <animate attributeName="opacity" values="0.7;1;0.7" dur="1.5s" repeatCount="indefinite" />
              )}
            </circle>
            <line x1="100" y1="117" x2="100" y2="130" stroke="rgba(129,140,248,0.4)" strokeWidth="1.5" />

            {/* Vout label */}
            <line x1="100" y1="130" x2="145" y2="130" stroke="rgba(34,211,238,0.3)" strokeWidth="1" strokeDasharray="3,2" />
            <rect x="145" y="122" width="50" height="16" rx="4" fill="rgba(15,23,42,0.9)" stroke="rgba(34,211,238,0.3)" strokeWidth="0.8" />
            <text x="170" y="133" textAnchor="middle" style={{ fontSize: "7.5px", fontFamily: "Inter", fontWeight: 700 }} className="fill-accent-cyan">
              {ldrVoltage.toFixed(3)}V
            </text>

            {/* ── LDR (bottom) ── */}
            <line x1="100" y1="130" x2="100" y2="145" stroke="rgba(129,140,248,0.4)" strokeWidth="1.5" />
            {/* LDR component box */}
            <rect x="82" y="145" width="36" height="28" rx="5"
              fill={`rgba(251, 191, 36, ${0.04 + lightIntensity * 0.12})`}
              stroke={`rgba(251, 191, 36, ${0.3 + lightIntensity * 0.5})`}
              strokeWidth="1.5"
            >
              {isRunning && (
                <animate attributeName="opacity" values="0.8;1;0.8" dur="2s" repeatCount="indefinite" />
              )}
            </rect>
            {/* Light arrows hitting LDR */}
            <line x1="72" y1="148" x2="82" y2="155" stroke={`rgba(251,191,36,${0.2 + lightIntensity * 0.6})`} strokeWidth="0.8" markerEnd="none">
              {isRunning && <animate attributeName="opacity" values="0.3;0.9;0.3" dur="1.2s" repeatCount="indefinite" />}
            </line>
            <line x1="72" y1="158" x2="82" y2="162" stroke={`rgba(251,191,36,${0.2 + lightIntensity * 0.6})`} strokeWidth="0.8">
              {isRunning && <animate attributeName="opacity" values="0.3;0.9;0.3" dur="1.2s" begin="0.3s" repeatCount="indefinite" />}
            </line>
            <text x="100" y="157" textAnchor="middle" style={{ fontSize: "6.5px", fontFamily: "Inter", fontWeight: 700 }} className="fill-accent-amber">
              LDR
            </text>
            <text x="100" y="167" textAnchor="middle" style={{ fontSize: "6px", fontFamily: "Inter", fontWeight: 500 }} className="fill-surface-200/50">
              {formattedLDR_R}
            </text>

            {/* ── GND rail ── */}
            <line x1="100" y1="173" x2="100" y2="195" stroke="rgba(129,140,248,0.4)" strokeWidth="1.5" />
            <line x1="85" y1="195" x2="115" y2="195" stroke="rgba(148,163,184,0.5)" strokeWidth="2" />
            <line x1="90" y1="199" x2="110" y2="199" stroke="rgba(148,163,184,0.35)" strokeWidth="1.5" />
            <line x1="95" y1="203" x2="105" y2="203" stroke="rgba(148,163,184,0.2)" strokeWidth="1" />
            <text x="100" y="215" textAnchor="middle" style={{ fontSize: "8px", fontFamily: "Inter", fontWeight: 600 }} className="fill-surface-200/40">
              GND
            </text>

            {/* ── Animated current dots ── */}
            {isRunning && currentSpeed > 0 && (
              <>
                <circle r="2" fill="#22d3ee" opacity="0.8" filter="url(#node-glow)">
                  <animateMotion dur={`${3 / currentSpeed}s`} repeatCount="indefinite" path="M100,55 L100,130 L100,195" />
                </circle>
                <circle r="1.5" fill="#22d3ee" opacity="0.5">
                  <animateMotion dur={`${3 / currentSpeed}s`} repeatCount="indefinite" begin="0.5s" path="M100,55 L100,130 L100,195" />
                </circle>
              </>
            )}
          </svg>
        </div>

        {/* ═══ Photodiode Circuit ═══ */}
        <div className="rounded-xl bg-surface-950/60 border border-surface-700/20 p-2 relative overflow-hidden">
          <div className="text-[10px] font-semibold text-accent-amber/70 uppercase tracking-wider text-center mb-1">
            Photodiode (Reverse Bias)
          </div>
          <svg viewBox="0 0 200 220" className="w-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <filter id="pd-glow">
                <feGaussianBlur stdDeviation={glowRadius * 0.8} result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* ── Light source glow ── */}
            <circle
              cx="100" cy="30"
              r={12 + lightIntensity * 8}
              fill={`rgba(251, 191, 36, ${glowOpacity})`}
              filter="url(#pd-glow)"
            >
              {isRunning && (
                <animate attributeName="r" values={`${12 + lightIntensity * 6};${14 + lightIntensity * 10};${12 + lightIntensity * 6}`} dur="2s" repeatCount="indefinite" />
              )}
            </circle>
            <text x="100" y="33" textAnchor="middle" className="fill-accent-amber" style={{ fontSize: "9px", fontFamily: "Inter", fontWeight: 600 }}>
              ☀ {lux} lux
            </text>

            {/* ── Vcc rail (reverse bias) ── */}
            <line x1="40" y1="55" x2="160" y2="55" stroke="rgba(129,140,248,0.5)" strokeWidth="1.5" filter={isRunning ? "url(#wire-glow)" : undefined} />
            <text x="30" y="58" textAnchor="end" style={{ fontSize: "8px", fontFamily: "Inter", fontWeight: 700 }} className="fill-primary-400">
              +V
            </text>

            {/* ── R_load (top resistor) ── */}
            <line x1="100" y1="55" x2="100" y2="72" stroke="rgba(129,140,248,0.4)" strokeWidth="1.5" />
            <polyline
              points="100,72 106,77 94,85 106,93 94,101 106,109 100,114"
              fill="none"
              stroke="rgba(52,211,153,0.7)"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <text x="118" y="95" style={{ fontSize: "7px", fontFamily: "Inter", fontWeight: 600 }} className="fill-accent-emerald/80">
              R_L = 10kΩ
            </text>

            {/* ── Junction node (Vout) ── */}
            <circle cx="100" cy="125" r="3.5" fill="#fbbf24" filter={isRunning ? "url(#node-glow)" : undefined}>
              {isRunning && (
                <animate attributeName="opacity" values="0.7;1;0.7" dur="1.5s" repeatCount="indefinite" />
              )}
            </circle>
            <line x1="100" y1="114" x2="100" y2="125" stroke="rgba(129,140,248,0.4)" strokeWidth="1.5" />

            {/* Vout label */}
            <line x1="100" y1="125" x2="145" y2="125" stroke="rgba(251,191,36,0.3)" strokeWidth="1" strokeDasharray="3,2" />
            <rect x="145" y="117" width="50" height="16" rx="4" fill="rgba(15,23,42,0.9)" stroke="rgba(251,191,36,0.3)" strokeWidth="0.8" />
            <text x="170" y="128" textAnchor="middle" style={{ fontSize: "7.5px", fontFamily: "Inter", fontWeight: 700 }} className="fill-accent-amber">
              {photodiodeVoltage.toFixed(3)}V
            </text>

            {/* ── Photodiode symbol ── */}
            <line x1="100" y1="125" x2="100" y2="140" stroke="rgba(129,140,248,0.4)" strokeWidth="1.5" />
            {/* Triangle (anode) */}
            <polygon
              points="85,155 115,155 100,140"
              fill={`rgba(251, 191, 36, ${0.05 + lightIntensity * 0.15})`}
              stroke={`rgba(251, 191, 36, ${0.3 + lightIntensity * 0.5})`}
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
            {/* Cathode bar */}
            <line x1="85" y1="155" x2="115" y2="155" stroke={`rgba(251,191,36,${0.4 + lightIntensity * 0.4})`} strokeWidth="2" />

            {/* Light arrows */}
            <line x1="68" y1="138" x2="82" y2="147" stroke={`rgba(251,191,36,${0.2 + lightIntensity * 0.6})`} strokeWidth="0.8">
              {isRunning && <animate attributeName="opacity" values="0.3;0.9;0.3" dur="1s" repeatCount="indefinite" />}
            </line>
            <line x1="68" y1="150" x2="82" y2="153" stroke={`rgba(251,191,36,${0.2 + lightIntensity * 0.6})`} strokeWidth="0.8">
              {isRunning && <animate attributeName="opacity" values="0.3;0.9;0.3" dur="1s" begin="0.4s" repeatCount="indefinite" />}
            </line>

            {/* Current label */}
            <rect x="118" y="142" width="55" height="14" rx="3" fill="rgba(15,23,42,0.9)" stroke="rgba(251,113,133,0.25)" strokeWidth="0.6" />
            <text x="145" y="152" textAnchor="middle" style={{ fontSize: "6.5px", fontFamily: "Inter", fontWeight: 600 }} className="fill-accent-rose/80">
              I = {(photodiodeCurrent * 1000).toFixed(3)} mA
            </text>

            {/* ── GND rail ── */}
            <line x1="100" y1="155" x2="100" y2="195" stroke="rgba(129,140,248,0.4)" strokeWidth="1.5" />
            <line x1="85" y1="195" x2="115" y2="195" stroke="rgba(148,163,184,0.5)" strokeWidth="2" />
            <line x1="90" y1="199" x2="110" y2="199" stroke="rgba(148,163,184,0.35)" strokeWidth="1.5" />
            <line x1="95" y1="203" x2="105" y2="203" stroke="rgba(148,163,184,0.2)" strokeWidth="1" />
            <text x="100" y="215" textAnchor="middle" style={{ fontSize: "8px", fontFamily: "Inter", fontWeight: 600 }} className="fill-surface-200/40">
              GND
            </text>

            {/* ── Animated current dots ── */}
            {isRunning && currentSpeed > 0 && (
              <>
                <circle r="2" fill="#fbbf24" opacity="0.8" filter="url(#node-glow)">
                  <animateMotion dur={`${3 / currentSpeed}s`} repeatCount="indefinite" path="M100,55 L100,125 L100,195" />
                </circle>
                <circle r="1.5" fill="#fbbf24" opacity="0.5">
                  <animateMotion dur={`${3 / currentSpeed}s`} repeatCount="indefinite" begin="0.6s" path="M100,55 L100,125 L100,195" />
                </circle>
              </>
            )}
          </svg>
        </div>
      </div>
    </div>
  );
}
