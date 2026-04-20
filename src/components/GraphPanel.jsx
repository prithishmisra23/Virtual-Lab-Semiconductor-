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
    layout: {
      padding: { top: 8, right: 12, bottom: 4, left: 4 },
    },
    plugins: {
      legend: {
        labels: {
          color: "#94a3b8",
          font: { family: "Inter, monospace", size: 10, weight: 500 },
          padding: 16,
          usePointStyle: true,
          pointStyleWidth: 8,
        },
      },
      tooltip: {
        backgroundColor: "rgba(10, 15, 30, 0.95)",
        titleColor: "#f8fafc",
        bodyColor: "#cbd5e1",
        borderColor: "rgba(99, 102, 241, 0.2)",
        borderWidth: 1,
        padding: 12,
        cornerRadius: 8,
        titleFont: { size: 11, weight: 600 },
        bodyFont: { size: 10 },
      },
    },
    scales: {
      x: {
        type: 'linear',
        title: { display: true, text: "Light Intensity (%)", color: "#64748b", font: { size: 10, weight: 500 } },
        grid: { color: "rgba(255,255,255,0.04)", lineWidth: 0.5 },
        min: 0, max: 100,
        ticks: { color: "#64748b", font: { size: 9 }, padding: 6 },
        border: { color: "rgba(255,255,255,0.06)" },
      },
      y: {
        type: 'linear',
        min: 0, max: 5,
        title: { display: true, text: "LDR Output Voltage (V)", color: "#22d3ee", font: { size: 10, weight: 500 } },
        grid: { color: "rgba(255,255,255,0.04)", lineWidth: 0.5 },
        ticks: { color: "#22d3ee", font: { size: 9 }, padding: 6 },
        border: { color: "rgba(255,255,255,0.06)" },
      },
    },
  };

  const getOptions = (tab) => {
    let opts = JSON.parse(JSON.stringify(baseOptions));
    if (tab === "combined") {
      opts.scales.y2 = {
        type: 'linear',
        position: "right", min: 0, max: 100,
        title: { display: true, text: "Photodiode Output Voltage (V)", color: "#fbbf24", font: { size: 10, weight: 500 } },
        grid: { drawOnChartArea: false },
        ticks: { color: "#fbbf24", font: { size: 9 }, padding: 6 },
        border: { color: "rgba(255,255,255,0.06)" },
      };
    } else if (tab === "pd") {
      opts.scales.y.title.text = "Photodiode Output Voltage (V)";
      opts.scales.y.title.color = "#fbbf24";
      opts.scales.y.ticks.color = "#fbbf24";
      opts.scales.y.max = 100;
    }
    return opts;
  };

  const getData = (tab) => {
    const ldrDataset = {
      label: "LDR Output Voltage",
      data: labels.map((lux, i) => ({ x: lux, y: ldrTheoretical[i] })),
      borderColor: "#22d3ee",
      borderWidth: 2,
      pointRadius: 0,
      tension: 0.4,
      yAxisID: "y",
    };
    const pdDataset = {
      label: "Photodiode Output Voltage",
      data: labels.map((lux, i) => ({ x: lux, y: pdTheoretical[i] })),
      borderColor: "#fbbf24",
      borderWidth: 2,
      pointRadius: 0,
      tension: 0,
      yAxisID: tab === "combined" ? "y2" : "y",
    };
    const ldrLiveMarker = {
      label: "Live Photoresistor",
      data: liveData.length ? liveLDR : [{ x: currentLux, y: calculateLDRVoltage(currentLux * 10, voltage) }],
      backgroundColor: "#22d3ee",
      borderColor: "#fff",
      pointRadius: 5,
      pointBorderWidth: 2,
      showLine: false,
      yAxisID: "y",
    };
    const pdLiveMarker = {
      label: "Live Photodiode",
      data: liveData.length ? livePD : [{ x: currentLux, y: calculatePhotodiodeVoltage(currentLux * 10) }],
      backgroundColor: "#fbbf24",
      borderColor: "#fff",
      pointRadius: 5,
      pointBorderWidth: 2,
      showLine: false,
      yAxisID: tab === "combined" ? "y2" : "y",
    };

    if (tab === "ldr") return { datasets: [ldrDataset, ldrLiveMarker] };
    if (tab === "pd") return { datasets: [pdDataset, pdLiveMarker] };
    return { datasets: [ldrDataset, pdDataset, ldrLiveMarker, pdLiveMarker] };
  };

  const tabs = [
    { id: "ldr", label: "Photoresistor" },
    { id: "pd", label: "Photodiode" },
    { id: "combined", label: "Combined" },
  ];

  return (
    <div className="panel-section flex flex-col gap-4 animate-fade-in-up stagger-3 flex-1 min-h-[340px]">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-bold tracking-widest uppercase text-slate-300 flex items-center gap-2.5">
           <span className="w-1 h-4 bg-gradient-to-b from-amber-500 to-amber-700 rounded-full" />
           Characteristic Curves
        </h2>
        <span className="text-[10px] font-mono text-slate-500 bg-slate-900/60 px-2.5 py-1 rounded-lg border border-slate-800/50">
          ● {currentLux}%
        </span>
      </div>

      {/* Tab Switcher */}
      <div className="flex border border-slate-800/60 rounded-xl bg-slate-900/30 p-1 gap-1">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`flex-1 py-2.5 px-2 text-[11px] font-bold uppercase tracking-wider transition-all duration-200 rounded-lg cursor-pointer ${
              activeTab === t.id
                ? "bg-slate-800/80 text-slate-200 shadow-sm"
                : "text-slate-500 hover:text-slate-300 hover:bg-slate-800/30"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Chart Area */}
      <div className="flex-1 bg-slate-900/20 rounded-xl border border-slate-800/40 p-4 relative min-h-[240px]">
        <Line options={getOptions(activeTab)} data={getData(activeTab)} />
      </div>
    </div>
  );
}
