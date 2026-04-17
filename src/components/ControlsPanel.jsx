export default function ControlsPanel({ lux = 100, isRunning = false, onLuxChange, onToggleRun }) {
  const luxLabel = lux < 50 ? "Darkness" : lux < 200 ? "Dim Light" : lux < 500 ? "Moderate" : lux < 800 ? "Bright" : "Very Bright";

  return (
    <div className="bg-slate-950/80 p-5 flex items-center justify-between gap-6 animate-fade-in-up border border-slate-800/80 rounded-2xl shadow-[0_20px_40px_rgba(0,0,0,0.8)] backdrop-blur-xl">
      
      {/* ── Auto-Sweep Button ── */}
      <button
        onClick={onToggleRun}
        className={`w-52 h-14 rounded-xl font-bold uppercase tracking-widest text-[11px] shadow-lg transition-all duration-300 cursor-pointer border flex-shrink-0 ${
          isRunning
            ? "bg-rose-500/10 text-rose-400 border-rose-500/30 shadow-[0_0_20px_rgba(244,63,94,0.15)] hover:bg-rose-500/20"
            : "bg-indigo-500/10 text-indigo-400 border-indigo-500/30 shadow-[0_0_20px_rgba(99,102,241,0.15)] hover:bg-indigo-500/20"
        }`}
      >
        {isRunning ? "⏹ Stop Simulation" : "▶ Start Auto Sweep"}
      </button>

      <div className="w-[1px] h-12 bg-slate-800 flex-shrink-0" />

      {/* ── Light Source Slider (Primary Interaction) ── */}
      <div className="flex-1 flex flex-col gap-2">
        <div className="flex items-center justify-between pointer-events-none">
          <label className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
            Light Source Intensity
          </label>
          <span className="text-xs font-mono font-bold text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.6)] bg-slate-950 px-2 py-0.5 rounded border border-slate-800 shadow-inner">
            {lux}%
          </span>
        </div>
        
        <div className="relative group flex items-center mt-1">
          <input
            id="slider-lux"
            type="range"
            min="0"
            max="100"
            step="1"
            value={lux}
            onChange={(e) => onLuxChange?.(Number(e.target.value))}
            disabled={isRunning}
            className={`w-full h-2.5 appearance-none bg-slate-900 rounded-full outline-none
                       border border-slate-800 shadow-inner cursor-pointer relative z-10
                       ${isRunning ? 'opacity-50' : 'opacity-100'}
                       [&::-webkit-slider-thumb]:appearance-none 
                       [&::-webkit-slider-thumb]:w-6 
                       [&::-webkit-slider-thumb]:h-6 
                       [&::-webkit-slider-thumb]:rounded-full 
                       [&::-webkit-slider-thumb]:bg-amber-400
                       [&::-webkit-slider-thumb]:shadow-[0_0_15px_rgba(251,191,36,0.8)]
                       [&::-webkit-slider-thumb]:border-4
                       [&::-webkit-slider-thumb]:border-slate-950
                       [&::-webkit-slider-thumb]:transition-transform
                       hover:[&::-webkit-slider-thumb]:scale-110`}
          />
        </div>

        <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-slate-600 mt-1">
          <span>0% (Dark)</span>
          <span className="text-amber-500/60 drop-shadow-sm">{luxLabel}</span>
          <span>100% (Sunlight)</span>
        </div>
      </div>

    </div>
  );
}
