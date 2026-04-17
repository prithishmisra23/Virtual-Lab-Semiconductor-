import { useState } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

// Register Chart.js models
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

import { calculateLDRVoltage, calculatePhotodiodeVoltage } from "../utils/physics";

export default function GraphPanel({ sweepData = [], photodiodeSweep = [], liveData = [], currentLux = 0, voltage = 5 }) {
  const [activeTab, setActiveTab] = useState("ldr");

  // Chart data extraction
  const labels = sweepData.map((d) => d.lux);
  const ldrTheoretical = sweepData.map((d) => d.voltage);
  const pdTheoretical = photodiodeSweep.map((d) => d.voltage);

  // Live points
  const liveLDR = liveData.map((d) => ({ x: d.lux, y: d.ldrVoltage }));
  const livePD = liveData.map((d) => ({ x: d.lux, y: d.photodiodeVoltage }));

  // Options configuration
  const baseOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 0 },
    interaction: { mode: "index", intersect: false },
    plugins: {
      legend: { labels: { color: "#94a3b8", font: { family: "monospace", size: 10 } } },
      tooltip: { backgroundColor: "rgba(15,23,42,0.9)", titleColor: "#f8fafc", bodyColor: "#cbd5e1" },
    },
    scales: {
      x: { type: 'linear', title: { display: true, text: "Light Intensity (%)", color: "#64748b" }, grid: { color: "rgba(255,255,255,0.05)" }, min: 0, max: 100, ticks: { color: "#94a3b8" } },
      y: { type: 'linear', min: 0, max: 5, title: { display: true, text: "LDR Vout (V)", color: "#22d3ee" }, grid: { color: "rgba(255,255,255,0.05)" }, ticks: { color: "#22d3ee" } },
    },
  };

  const getOptions = (tab) => {
    let opts = JSON.parse(JSON.stringify(baseOptions));
    if (tab === "combined") {
      opts.scales.y2 = {
        type: 'linear',
        position: "right", min: 0, max: 100,
        title: { display: true, text: "PD Vout (V)", color: "#fbbf24" },
        grid: { drawOnChartArea: false },
        ticks: { color: "#fbbf24" },
      };
    } else if (tab === "pd") {
      opts.scales.y.title.text = "PD Vout (V)";
      opts.scales.y.title.color = "#fbbf24";
      opts.scales.y.ticks.color = "#fbbf24";
      opts.scales.y.max = 100;
    }
    return opts;
  };

  const getData = (tab) => {
    const ldrDataset = {
      label: "LDR Vout",
      data: labels.map((lux, i) => ({ x: lux, y: ldrTheoretical[i] })),
      borderColor: "#22d3ee",
      borderWidth: 2,
      pointRadius: 0,
      tension: 0.4,
      yAxisID: "y",
    };
    const pdDataset = {
      label: "Photodiode Vout",
      data: labels.map((lux, i) => ({ x: lux, y: pdTheoretical[i] })),
      borderColor: "#fbbf24",
      borderWidth: 2,
      pointRadius: 0,
      tension: 0,
      yAxisID: tab === "combined" ? "y2" : "y",
    };
    const ldrLiveMarker = {
      label: "Live LDR",
      data: liveData.length ? liveLDR : [{ x: currentLux, y: calculateLDRVoltage(currentLux * 10, voltage) }],
      backgroundColor: "#22d3ee",
      borderColor: "#fff",
      pointRadius: 4,
      showLine: false,
      yAxisID: "y",
    };
    const pdLiveMarker = {
      label: "Live PD",
      data: liveData.length ? livePD : [{ x: currentLux, y: calculatePhotodiodeVoltage(currentLux * 10) }],
      backgroundColor: "#fbbf24",
      borderColor: "#fff",
      pointRadius: 4,
      showLine: false,
      yAxisID: tab === "combined" ? "y2" : "y",
    };

    if (tab === "ldr") return { datasets: [ldrDataset, ldrLiveMarker] };
    if (tab === "pd") return { datasets: [pdDataset, pdLiveMarker] };
    return { datasets: [ldrDataset, pdDataset, ldrLiveMarker, pdLiveMarker] };
  };

  return (
    <div className="flex flex-col gap-3 p-2 animate-fade-in-up flex-1 min-h-[350px]">
      <div className="flex items-center justify-between">
        <h2 className="text-[11px] font-bold tracking-widest uppercase text-slate-300 flex items-center gap-2">
           <span className="w-1 h-3 bg-amber-500 rounded-full" /> Characteristic Curves
        </h2>
        <span className="text-[9px] font-mono text-slate-500 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">● {currentLux}%</span>
      </div>

      <div className="flex border border-slate-800 rounded-lg overflow-hidden bg-slate-900/40">
        {[
          { id: "ldr", label: "LDR V vs Intensity" },
          { id: "pd", label: "PD V vs Intensity" },
          { id: "combined", label: "Combined" },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`flex-1 py-1.5 text-[10px] font-bold uppercase tracking-widest transition-colors ${
              activeTab === t.id ? "bg-slate-800 text-slate-200" : "text-slate-500 hover:text-slate-300 hover:bg-slate-800/50"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="flex-1 bg-slate-900/20 rounded-lg border border-slate-800/50 p-2 relative">
        <Line options={getOptions(activeTab)} data={getData(activeTab)} />
      </div>
    </div>
  );
}
