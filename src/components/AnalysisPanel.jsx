import { useMemo } from "react";
import { computeStats, formatValue, analyzeLinearity } from "../utils/dataProcessing";

export default function AnalysisPanel({
  data = [], lux = 0, voltage = 0,
  ldrVoltage = 0, photodiodeVoltage = 0,
  ldrResistance = 0, photodiodeCurrent = 0,
}) {
  const stats = useMemo(() => {
    if (!data.length) return null;
    const luxValues = data.map((d) => d.lux);
    const ldrV = data.map((d) => d.ldrVoltage);
    const pdV = data.map((d) => d.photodiodeVoltage);

    return {
      ldrLinearity: analyzeLinearity(luxValues, ldrV),
      pdLinearity: analyzeLinearity(luxValues, pdV),
    };
  }, [data]);

  function handleExport() {
    if (!data.length) return;
    const header = "Intensity (%),LDR Output Voltage (V),Photodiode Output Voltage (V),LDR Resistance (Ω),Photodiode Current (A)\n";
    const csv = data.map(d => `${d.lux},${d.ldrVoltage},${d.photodiodeVoltage},${d.ldrResistance},${d.photodiodeCurrent}`).join("\n");
    const blob = new Blob([header + csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `semi-lab-data-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const metrics = [
    { label: "Light Intensity", value: `${lux}%`, textCol: "text-amber-400", bgCol: "bg-amber-400/8", borderCol: "border-amber-400/15", glowCol: "shadow-amber-500/5" },
    { label: "Supply Voltage", value: formatValue(voltage, "V", 1), textCol: "text-indigo-400", bgCol: "bg-indigo-400/8", borderCol: "border-indigo-400/15", glowCol: "shadow-indigo-500/5" },
    { label: "LDR Output Voltage", value: formatValue(ldrVoltage, "V", 4), textCol: "text-cyan-400", bgCol: "bg-cyan-400/8", borderCol: "border-cyan-400/15", glowCol: "shadow-cyan-500/5" },
    { label: "Photodiode Output Voltage", value: formatValue(photodiodeVoltage, "V", 4), textCol: "text-amber-400", bgCol: "bg-amber-400/8", borderCol: "border-amber-400/15", glowCol: "shadow-amber-500/5" },
    { label: "LDR Resistance", value: formatValue(ldrResistance, "Ω", 0), textCol: "text-emerald-400", bgCol: "bg-emerald-400/8", borderCol: "border-emerald-400/15", glowCol: "shadow-emerald-500/5" },
    { label: "Photodiode Current", value: formatValue(photodiodeCurrent, "A", 6), textCol: "text-rose-400", bgCol: "bg-rose-400/8", borderCol: "border-rose-400/15", glowCol: "shadow-rose-500/5" },
  ];

  return (
    <div className="panel-section flex flex-col gap-5 animate-fade-in-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-bold tracking-widest uppercase text-slate-300 flex items-center gap-2.5">
          <span className="w-1 h-4 bg-gradient-to-b from-indigo-500 to-indigo-700 rounded-full" />
          Analysis
        </h2>
        <button
          onClick={handleExport}
          disabled={!data.length}
          className="text-[10px] font-bold px-4 py-1.5 rounded-lg uppercase tracking-widest bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 hover:bg-indigo-500/20 disabled:opacity-25 transition-all cursor-pointer shadow-sm"
        >
          ↓ Export CSV
        </button>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 gap-3">
        {metrics.map((m, i) => (
          <div
            key={m.label}
            className={`metric-tile ${m.bgCol} border ${m.borderCol} shadow-lg ${m.glowCol} animate-fade-in-up stagger-${i + 1}`}
          >
            <span className="text-[10px] font-semibold text-slate-400/70 uppercase tracking-widest">
              {m.label}
            </span>
            <span className={`text-sm font-mono font-bold ${m.textCol} drop-shadow-md`}>
              {m.value}
            </span>
          </div>
        ))}
      </div>

      {/* Linearity Engine */}
      {stats && (
        <div className="flex flex-col gap-4 pt-4 border-t border-slate-800/50">
          <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400/60 flex items-center gap-2">
            <span className="w-1 h-3 bg-gradient-to-b from-emerald-500 to-emerald-700 rounded-full" />
            Linearity Analysis
          </h3>
          
          {/* LDR Response */}
          <div className="bg-slate-900/40 rounded-xl p-4 border border-slate-800/40 flex flex-col gap-3">
            <div className="flex justify-between items-center pb-3 border-b border-slate-800/40">
              <span className="text-[11px] font-bold text-cyan-400/80 uppercase tracking-widest">Photoresistor Response</span>
              <span className={`text-[9px] font-bold px-2.5 py-1 rounded-md shadow-sm uppercase tracking-wider ${stats.ldrLinearity.isLinear ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25' : 'bg-slate-800/60 text-slate-400 border border-slate-700/50'}`}>
                {stats.ldrLinearity.isLinear ? "Linear" : "Nonlinear"}
              </span>
            </div>
            <div className="flex justify-between text-[11px] items-center">
              <span className="text-slate-500 font-semibold uppercase tracking-wide">Sensitivity</span>
              <span className="font-mono text-slate-300 bg-black/30 px-2 py-0.5 rounded-md text-[10px]">{(stats.ldrLinearity.sensitivity * 100).toFixed(2)} mV/%</span>
            </div>
            <div className="flex justify-between text-[11px] items-center">
              <span className="text-slate-500 font-semibold uppercase tracking-wide">R² score</span>
              <span className="font-mono text-slate-300 bg-black/30 px-2 py-0.5 rounded-md text-[10px]">{stats.ldrLinearity.rSquared.toFixed(4)}</span>
            </div>
          </div>

          {/* Photodiode Response */}
          <div className="bg-slate-900/40 rounded-xl p-4 border border-slate-800/40 flex flex-col gap-3">
            <div className="flex justify-between items-center pb-3 border-b border-slate-800/40">
              <span className="text-[11px] font-bold text-amber-400/80 uppercase tracking-widest">Photodiode Response</span>
              <span className={`text-[9px] font-bold px-2.5 py-1 rounded-md shadow-sm uppercase tracking-wider ${stats.pdLinearity.isLinear ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25' : 'bg-slate-800/60 text-slate-400 border border-slate-700/50'}`}>
                {stats.pdLinearity.isLinear ? "Linear" : "Nonlinear"}
              </span>
            </div>
            <div className="flex justify-between text-[11px] items-center">
              <span className="text-slate-500 font-semibold uppercase tracking-wide">Sensitivity</span>
              <span className="font-mono text-slate-300 bg-black/30 px-2 py-0.5 rounded-md text-[10px]">{(stats.pdLinearity.sensitivity * 100).toFixed(4)} mV/%</span>
            </div>
            <div className="flex justify-between text-[11px] items-center">
              <span className="text-slate-500 font-semibold uppercase tracking-wide">R² score</span>
              <span className="font-mono text-slate-300 bg-black/30 px-2 py-0.5 rounded-md text-[10px]">{stats.pdLinearity.rSquared.toFixed(4)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
