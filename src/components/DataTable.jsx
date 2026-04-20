import { formatValue } from "../utils/dataProcessing";

export default function DataTable({ data = [] }) {
  return (
    <div className="h-full flex flex-col gap-3 animate-fade-in-up">
      {/* Header */}
      <div className="flex items-center justify-between px-1">
        <h2 className="text-xs font-bold tracking-widest uppercase text-slate-300 flex items-center gap-2.5">
           <span className="w-1 h-4 bg-gradient-to-b from-cyan-500 to-cyan-700 rounded-full" />
           Recorded Data Archive
        </h2>
        <span className="text-[10px] font-mono text-slate-500 font-bold bg-slate-900/60 border border-slate-800/50 px-3 py-1 flex items-center rounded-lg">
          {data.length} points
        </span>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto rounded-xl border border-slate-800/50 bg-slate-900/30 shadow-inner">
        <table className="w-full text-left border-collapse text-[11px]">
          <thead className="sticky top-0 bg-slate-950/95 backdrop-blur-md z-10 border-b border-slate-800/60">
            <tr>
              <th className="py-3 px-5 font-bold uppercase tracking-wider text-slate-500 w-14">#</th>
              <th className="py-3 px-5 font-bold uppercase tracking-wider text-slate-400">Intensity</th>
              <th className="py-3 px-5 font-bold uppercase tracking-wider text-cyan-400/70">LDR Output Voltage</th>
              <th className="py-3 px-5 font-bold uppercase tracking-wider text-amber-400/70">Photodiode Output Voltage</th>
              <th className="py-3 px-5 font-bold uppercase tracking-wider text-emerald-400/70">LDR Resistance</th>
              <th className="py-3 px-5 font-bold uppercase tracking-wider text-rose-400/70">Photodiode Current</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/30">
            {data.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-10 text-center text-slate-600 font-medium uppercase tracking-widest text-[10px]">
                  No data — Start auto sweep to record
                </td>
              </tr>
            ) : (
              data.map((row, i) => (
                <tr key={i} className="hover:bg-slate-800/30 transition-colors duration-150 font-mono">
                  <td className="py-2.5 px-5 text-slate-600 font-semibold">{i + 1}</td>
                  <td className="py-2.5 px-5 text-slate-300">{row.lux}%</td>
                  <td className="py-2.5 px-5 text-cyan-400/70">{formatValue(row.ldrVoltage, "V", 4)}</td>
                  <td className="py-2.5 px-5 text-amber-400/70">{formatValue(row.photodiodeVoltage, "V", 4)}</td>
                  <td className="py-2.5 px-5 text-emerald-400/70">{formatValue(row.ldrResistance, "Ω", 0)}</td>
                  <td className="py-2.5 px-5 text-rose-400/70">{formatValue(row.photodiodeCurrent, "A", 6)}</td>
                </tr>
              ))
            )}
            {/* Invisible bottom div to ensure latest is visible */}
            <tr id="table-bottom" />
          </tbody>
        </table>
      </div>
    </div>
  );
}
