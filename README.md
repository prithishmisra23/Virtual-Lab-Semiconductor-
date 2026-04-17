# ⚡ Virtual Semiconductor Lab

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![React](https://img.shields.io/badge/-React_19-61DAFB?logo=react&logoColor=white)](#)
[![Three.js](https://img.shields.io/badge/-Three.js-000000?logo=three.js&logoColor=white)](#)
[![Tailwind CSS](https://img.shields.io/badge/-Tailwind_CSS_4-38B2AC?logo=tailwind-css&logoColor=white)](#)

![Project Banner](./public/screenshots/banner.png)

## 🌟 Overview

**Virtual Semiconductor Lab** is a high-fidelity, professional-grade simulation platform designed for deep analysis of semiconductor components. This iteration focuses on the comparative study of **Photoresistors (LDR)** and **Photodiodes**, providing a cinematic 3D environment coupled with real-time physics calculations and advanced data visualization.

The lab bridges the gap between theoretical physics and interactive experimentation, allowing users to observe non-linear vs. linear responses in light-sensing circuits through a premium, glassmorphic interface.

---

## ✨ Key Features

-   **🎮 Cinematic 3D Circuitry**: An immersive environment built with React Three Fiber featuring spring-physics camera transitions, dynamic emissive lighting, and reflective floor planes.
-   **⚛️ High-Fidelity Physics Engine**: Real-time simulation of LDR resistance (nonlinear CdS model) and Photodiode photocurrent (linear model) based on precise mathematical formulas.
-   **📈 Advanced Data Visualization**: Dynamic, real-time graphing using Chart.js to visualize characteristic sweeps (V vs. Lux) and compare component efficiency.
-   **🤖 Automated Experimentation**: A "Run" mode that automatically sweeps light intensity and records high-precision data points for analysis.
-   **💎 Premium UX/UI**: A sleek, dark-themed dashboard using Tailwind CSS 4, featuring glassmorphism, micro-animations, and a responsive layout.
-   **📊 Tabular Data Export**: Real-time data logging into structured tables for easy review of experimental results.

---

## 🛠️ Tech Stack

-   **Frontend**: React 19 (Hooks, Context, Performance Optimized)
-   **3D Rendering**: Three.js, React Three Fiber (R3F), @react-three/drei
-   **Styling**: Tailwind CSS 4 (Modern utility-first design)
-   **Charts**: Chart.js, react-chartjs-2
-   **Build Tool**: Vite (Lightning-fast HMR)
-   **Mathematics**: Custom Physics Engine (`physics.js`)

---

## 🚀 Getting Started

### Prerequisites

-   [Node.js](https://nodejs.org/) (Recommended: v18 or later)
-   npm (or yarn / pnpm)

### Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/yourusername/semi-lab.git
    cd semi-lab
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Start development server**
    ```bash
    npm run dev
    ```

4.  **Build for production**
    ```bash
    npm run build
    ```

---

## 📁 Repository Structure

```text
├── public/                 # Static assets & screenshots
├── src/
│   ├── components/         # Interactive UI & 3D Components
│   │   ├── Circuit3D.jsx   # Three.js Scene Implementation
│   │   ├── GraphPanel.jsx  # Charting Logic
│   │   ├── AnalysisPanel.jsx# Physics Summary UI
│   │   └── ...
│   ├── utils/
│   │   └── physics.js      # Core Simulation Logic & Formulas
│   ├── App.jsx             # Main Application Logic
│   ├── main.jsx            # Entry Point
│   └── index.css           # Design System & Styling
├── package.json            # Dependencies & Scripts
└── vite.config.js          # Build Configuration
```

---

## 🔬 Physics Model Breakdown

### Photoresistor (LDR)
Modeled using the nonlinear resistance-illuminance relationship:
$$R_{LDR} = \frac{k}{(lux + 1)^n}$$
where $k$ is the dark resistance factor and $n$ is the nonlinearity exponent (~0.7 to 1.5).

### Photodiode
Modeled with a linear response to light, resulting in a photocurrent:
$$I_{photo} = k \times lux$$
This highlights the superior linearity and speed of semiconductor photodiodes compared to cadmium-sulfide cells.

---

## 🤝 Contributing

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📜 License

Distributed under the MIT License. See `LICENSE` for more information.

---

<p align="center">
  Built with ❤️ for Semiconductor Education
</p>
