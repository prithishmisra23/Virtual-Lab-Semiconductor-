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
    const header = "Intensity (%),LDR Vout(V),PD Vout(V),R_LDR,I_PD\n";
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
    { label: "Intensity", value: `${lux}%`, textCol: "text-amber-400", bgCol: "bg-amber-400/10", borderCol: "border-amber-400/20" },
    { label: "Vcc", value: formatValue(voltage, "V", 1), textCol: "text-indigo-400", bgCol: "bg-indigo-400/10", borderCol: "border-indigo-400/20" },
    { label: "LDR Vout", value: formatValue(ldrVoltage, "V", 4), textCol: "text-cyan-400", bgCol: "bg-cyan-400/10", borderCol: "border-cyan-400/20" },
    { label: "PD Vout", value: formatValue(photodiodeVoltage, "V", 4), textCol: "text-amber-400", bgCol: "bg-amber-400/10", borderCol: "border-amber-400/20" },
    { label: "R_LDR", value: formatValue(ldrResistance, "Ω", 0), textCol: "text-emerald-400", bgCol: "bg-emerald-400/10", borderCol: "border-emerald-400/20" },
    { label: "I_PD", value: formatValue(photodiodeCurrent, "A", 6), textCol: "text-rose-400", bgCol: "bg-rose-400/10", borderCol: "border-rose-400/20" },
  ];

  return (
    <div className="flex flex-col gap-5 p-2 animate-fade-in-up">
      <div className="flex items-center justify-between">
        <h2 className="text-[11px] font-bold tracking-widest uppercase text-slate-300 flex items-center gap-2">
          <span className="w-1 h-3 bg-indigo-500 rounded-full" /> Analysis
        </h2>
        <button
          onClick={handleExport}
          disabled={!data.length}
          className="text-[10px] font-bold px-3 py-1 rounded-md uppercase tracking-widest bg-indigo-500/15 text-indigo-400 border border-indigo-500/30 hover:bg-indigo-500/25 disabled:opacity-30 transition-all cursor-pointer shadow-[0_0_10px_rgba(99,102,241,0.2)]"
        >
          ↓ CSV
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {metrics.map((m) => (
          <div key={m.label} className={`rounded-lg ${m.bgCol} border ${m.borderCol} p-3 flex flex-col gap-1 backdrop-blur-sm`}>
            <span className="text-[9px] font-bold text-slate-400/80 uppercase tracking-widest">
              {m.label}
            </span>
            <span className={`text-[13px] font-mono font-bold ${m.textCol} drop-shadow-md`}>
              {m.value}
            </span>
          </div>
        ))}
      </div>

      {stats && (
        <div className="flex flex-col gap-3 pt-4 border-t border-slate-800">
          <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400/70 mb-1">
            Linearity Engine
          </h3>
          
          <div className="bg-slate-900/50 rounded-lg p-3 border border-slate-800/50 flex flex-col gap-2">
            <div className="flex justify-between items-center pb-2 border-b border-slate-800">
              <span className="text-[10px] font-bold text-cyan-400/80 uppercase tracking-widest">LDR Response</span>
              <span className={`text-[9px] font-bold px-2 py-0.5 rounded shadow-sm uppercase tracking-wider ${stats.ldrLinearity.isLinear ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-slate-800 text-slate-400 border border-slate-700'}`}>
                {stats.ldrLinearity.isLinear ? "Linear" : "Nonlinear"}
              </span>
            </div>
            <div className="flex justify-between text-[10px] pt-1"><span className="text-slate-500 font-semibold uppercase">Sensitivity</span><span className="font-mono text-slate-300 bg-black/40 px-1 rounded">{(stats.ldrLinearity.sensitivity * 100).toFixed(2)} mV/%</span></div>
            <div className="flex justify-between text-[10px]"><span className="text-slate-500 font-semibold uppercase">R² score</span><span className="font-mono text-slate-300 bg-black/40 px-1 rounded">{stats.ldrLinearity.rSquared.toFixed(4)}</span></div>
          </div>

          <div className="bg-slate-900/50 rounded-lg p-3 border border-slate-800/50 flex flex-col gap-2">
            <div className="flex justify-between items-center pb-2 border-b border-slate-800">
              <span className="text-[10px] font-bold text-amber-400/80 uppercase tracking-widest">Photodiode</span>
              <span className={`text-[9px] font-bold px-2 py-0.5 rounded shadow-sm uppercase tracking-wider ${stats.pdLinearity.isLinear ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-slate-800 text-slate-400 border border-slate-700'}`}>
                {stats.pdLinearity.isLinear ? "Linear" : "Nonlinear"}
              </span>
            </div>
            <div className="flex justify-between text-[10px] pt-1"><span className="text-slate-500 font-semibold uppercase">Sensitivity</span><span className="font-mono text-slate-300 bg-black/40 px-1 rounded">{(stats.pdLinearity.sensitivity * 100).toFixed(4)} mV/%</span></div>
            <div className="flex justify-between text-[10px]"><span className="text-slate-500 font-semibold uppercase">R² score</span><span className="font-mono text-slate-300 bg-black/40 px-1 rounded">{stats.pdLinearity.rSquared.toFixed(4)}</span></div>
          </div>
        </div>
      )}
    </div>
  );
}
