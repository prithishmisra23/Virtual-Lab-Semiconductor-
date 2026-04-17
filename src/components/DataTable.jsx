import { formatValue } from "../utils/dataProcessing";

export default function DataTable({ data = [] }) {
  return (
    <div className="h-full flex flex-col gap-3 animate-fade-in-up">
      <div className="flex items-center justify-between pb-2 border-b border-slate-800 px-2">
        <h2 className="text-[11px] font-bold tracking-widest uppercase text-slate-300 flex items-center gap-2">
           <span className="w-1 h-3 bg-cyan-500 rounded-full" /> Recorded Data Archive
        </h2>
        <span className="text-[10px] font-mono text-slate-500 font-bold bg-slate-900 border border-slate-800 px-2 flex items-center rounded h-6">{data.length} pts</span>
      </div>

      <div className="flex-1 overflow-auto rounded-lg border border-slate-800 bg-slate-900/50 shadow-inner">
        <table className="w-full text-left border-collapse text-[11px]">
          <thead className="sticky top-0 bg-slate-950/90 backdrop-blur-md z-10 shadow-sm border-b border-slate-800">
            <tr>
              <th className="py-2.5 px-4 font-bold uppercase tracking-wider text-slate-500 w-12">#</th>
              <th className="py-2.5 px-4 font-bold uppercase tracking-wider text-slate-400">Intensity</th>
              <th className="py-2.5 px-4 font-bold uppercase tracking-wider text-cyan-400/80">LDR Vout</th>
              <th className="py-2.5 px-4 font-bold uppercase tracking-wider text-amber-400/80">PD Vout</th>
              <th className="py-2.5 px-4 font-bold uppercase tracking-wider text-emerald-400/80">R_LDR</th>
              <th className="py-2.5 px-4 font-bold uppercase tracking-wider text-rose-400/80">I_PD</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/40">
            {data.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-slate-600 font-medium uppercase tracking-widest text-[10px]">
                  No data — Start auto sweep to record
                </td>
              </tr>
            ) : (
              data.map((row, i) => (
                <tr key={i} className="hover:bg-slate-800/50 transition-colors font-mono">
                  <td className="py-2 px-4 text-slate-600 font-semibold">{i + 1}</td>
                  <td className="py-2 px-4 text-slate-300">{row.lux}%</td>
                  <td className="py-2 px-4 text-cyan-400/80">{formatValue(row.ldrVoltage, "V", 4)}</td>
                  <td className="py-2 px-4 text-amber-400/80">{formatValue(row.photodiodeVoltage, "V", 4)}</td>
                  <td className="py-2 px-4 text-emerald-400/80">{formatValue(row.ldrResistance, "Ω", 0)}</td>
                  <td className="py-2 px-4 text-rose-400/80">{formatValue(row.photodiodeCurrent, "A", 6)}</td>
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
