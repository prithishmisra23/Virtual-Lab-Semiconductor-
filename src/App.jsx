import { useState, useCallback, useRef, useEffect } from "react";
import Circuit3D from "./components/Circuit3D";
import ControlsPanel from "./components/ControlsPanel";
import GraphPanel from "./components/GraphPanel";
import DataTable from "./components/DataTable";
import AnalysisPanel from "./components/AnalysisPanel";
import {
  calculateLDRVoltage,
  calculatePhotodiodeVoltage,
  calculateLDRResistance,
  calculatePhotodiodeCurrent,
  ldrLuxSweep,
  photodiodeLuxSweep,
} from "./utils/physics";

const DEFAULT_INTENSITY = 10;
const DEFAULT_VOLTAGE = 5;
const SWEEP_POINTS = 50;

function App() {
  const [intensity, setIntensity] = useState(DEFAULT_INTENSITY);
  const [voltage] = useState(DEFAULT_VOLTAGE); // Voltage locked
  const [isRunning, setIsRunning] = useState(false);
  const [dataHistory, setDataHistory] = useState([]);

  /* ── Derived physics values ── */
  // Multiplying intensity by 10 to feed into existing physics formulas which expect 0-1000
  const physicsLux = intensity * 10; 
  const ldrVoltage = calculateLDRVoltage(physicsLux, voltage);
  const photodiodeVoltage = calculatePhotodiodeVoltage(physicsLux);
  const ldrResistance = calculateLDRResistance(physicsLux);
  const photodiodeCurrent = calculatePhotodiodeCurrent(physicsLux);

  /* ── Pre-calculate theoretical sweep for graphs ── */
  // Map 0-100% to 0-1000 lux for physics calculation but store % for UI
  const ldrSweep = useRef(ldrLuxSweep(0, 1000, SWEEP_POINTS, voltage).map(p => ({ ...p, lux: p.lux / 10 }))).current;
  const photodiodeSweep = useRef(photodiodeLuxSweep(0, 1000, SWEEP_POINTS).map(p => ({ ...p, lux: p.lux / 10 }))).current;

  /* ── Auto-mode: sweep intensity automatically ── */
  const autoRef = useRef(null);
  useEffect(() => {
    if (isRunning) {
      autoRef.current = setInterval(() => {
        setIntensity((prev) => {
          const next = prev + 5; // +5% per tick
          if (next > 100) {
            setIsRunning(false); // Stop experiment at max intensity
            return 100;
          }
          return next;
        });
      }, 150);
    } else {
      clearInterval(autoRef.current);
    }
    return () => clearInterval(autoRef.current);
  }, [isRunning]);

  /* ── Record data point whenever intensity changes while running ── */
  useEffect(() => {
    if (isRunning) {
      setDataHistory((prev) => {
        const point = {
          lux: intensity, // Store as percentage
          ldrVoltage: parseFloat(calculateLDRVoltage(physicsLux, voltage).toFixed(6)),
          photodiodeVoltage: parseFloat(calculatePhotodiodeVoltage(physicsLux).toFixed(6)),
          ldrResistance: parseFloat(calculateLDRResistance(physicsLux).toFixed(2)),
          photodiodeCurrent: parseFloat(calculatePhotodiodeCurrent(physicsLux).toFixed(8)),
        };
        if (prev.length > 0 && prev[prev.length - 1].lux === intensity) return prev;
        return [...prev, point];
      });
    }
  }, [intensity, voltage, isRunning, physicsLux]);

  const handleIntensityChange = useCallback((val) => {
    setIntensity(val);
  }, []);

  const handleToggleRun = useCallback(() => {
    setIsRunning((prev) => {
      if (!prev) {
        setDataHistory([]);
        setIntensity(0);
      }
      return !prev;
    });
  }, []);

  return (
    <div className="h-screen w-screen overflow-hidden flex flex-col bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black text-slate-100 font-sans selection:bg-indigo-500/30">
      
      {/* ─── Premium Header ─── */}
      <header className="h-[64px] flex-shrink-0 z-50 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/60 flex items-center justify-between px-6 lg:px-10 shadow-2xl">
        <div className="flex items-center gap-3.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-600 to-cyan-400 flex flex-col items-center justify-center shadow-[0_0_20px_rgba(99,102,241,0.4)]">
             <span className="text-lg font-bold text-white drop-shadow-md">⚡</span>
          </div>
          <div className="flex flex-col">
            <h1 className="text-base font-bold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-slate-100 to-slate-400 leading-tight">Virtual Semiconductor Lab</h1>
            <span className="text-[10px] text-slate-500 font-bold tracking-widest uppercase">
              Photoresistor vs Photodiode Analysis
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2.5 bg-slate-900/60 px-4 py-1.5 rounded-xl border border-slate-800/60">
            <span className="text-[10px] font-bold tracking-widest text-slate-500 uppercase">Light Intensity</span>
            <span className="text-sm font-mono font-bold text-amber-400 drop-shadow-[0_0_10px_rgba(251,191,36,0.6)]">
              {intensity}%
            </span>
          </div>
          <span
            className={`flex items-center gap-2 text-[10px] font-bold px-3.5 py-1.5 rounded-xl uppercase tracking-widest transition-all duration-300 ${
              isRunning
                ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.2)]"
                : "bg-slate-900/60 text-slate-500 border border-slate-800/60"
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                isRunning ? "bg-emerald-400 animate-pulse shadow-[0_0_10px_rgba(16,185,129,1)]" : "bg-slate-700"
              }`}
            />
            {isRunning ? "Simulating" : "Hardware Idle"}
          </span>
        </div>
      </header>

      {/* ─── Central Workspace (Side-by-side) ─── */}
      <main className="flex-1 flex overflow-hidden">
        
        {/* PRIMARY: 3D Visualization Canvas */}
        <section className="flex-1 relative bg-black flex flex-col">
          
          <div className="absolute inset-0">
             <Circuit3D
               lux={physicsLux}
               ldrVoltage={ldrVoltage}
               pdVoltage={photodiodeVoltage}
               isRunning={isRunning}
             />
          </div>

          {/* Floating Controls Overlay */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[88%] max-w-[780px] z-20 pointer-events-auto">
            <ControlsPanel
              lux={intensity}
              isRunning={isRunning}
              onLuxChange={handleIntensityChange}
              onToggleRun={handleToggleRun}
            />
          </div>
        </section>

        {/* SECONDARY: Data & Analysis Side Panel */}
        <aside className="w-[480px] bg-slate-950/90 backdrop-blur-3xl border-l border-slate-800/50 flex flex-col p-6 gap-6 overflow-y-auto relative z-30">
          <AnalysisPanel
            data={dataHistory}
            lux={intensity}
            voltage={voltage}
            ldrVoltage={ldrVoltage}
            photodiodeVoltage={photodiodeVoltage}
            ldrResistance={ldrResistance}
            photodiodeCurrent={photodiodeCurrent}
          />

          <GraphPanel
            sweepData={ldrSweep}
            photodiodeSweep={photodiodeSweep}
            liveData={dataHistory}
            currentLux={intensity}
          />
        </aside>

      </main>

      {/* ─── Bottom Support Block: Data Table ─── */}
      <footer className="h-[220px] flex-shrink-0 bg-slate-950/90 backdrop-blur-3xl border-t border-slate-800/50 px-6 py-5 shadow-[0_-10px_30px_rgba(0,0,0,0.3)] z-40 relative">
        <DataTable data={dataHistory} />
      </footer>

    </div>
  );
}

export default App;
