import { useRef, useMemo, useState, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { CameraControls, Html, ContactShadows, MeshReflectorMaterial, Text, Tube, Sphere, Box } from "@react-three/drei";
import * as THREE from "three";

/* ─── Shared Realistic Materials ─── */
const MAT_WIRE = new THREE.MeshStandardMaterial({ color: "#e2e8f0", metalness: 0.9, roughness: 0.3 });
const MAT_BATTERY = new THREE.MeshStandardMaterial({ color: "#0f172a", metalness: 0.7, roughness: 0.4 });
const MAT_RESISTOR = new THREE.MeshStandardMaterial({ color: "#b45309", roughness: 0.9, metalness: 0.1 });
const MAT_GND = new THREE.MeshStandardMaterial({ color: "#64748b", metalness: 0.8, roughness: 0.2 });
const MAT_NODE = new THREE.MeshStandardMaterial({ color: "#cbd5e1", metalness: 1, roughness: 0.1 });

// Helper to create a curved wire tube from points
function CurvedWire({ points }) {
  const curve = useMemo(() => new THREE.CatmullRomCurve3(points, false, "catmullrom", 0.05), [points]);
  return (
    <mesh castShadow receiveShadow>
      <tubeGeometry args={[curve, 64, 0.03, 16, false]} />
      <primitive object={MAT_WIRE} attach="material" />
    </mesh>
  );
}

// Particle Flow System (Upgraded with Energy Trails)
function CurrentFlow({ points, isRunning, speedMultiplier, color = "cyan", erratic = false, count = 8 }) {
  const curve = useMemo(() => new THREE.CatmullRomCurve3(points, false, "catmullrom", 0.05), [points]);
  const groupRef = useRef();
  
  // Base offsets representing the main particles spaced out
  const offsets = useMemo(() => Array.from({ length: count }, (_, i) => i / count), [count]);

  useFrame((state, delta) => {
    if (!groupRef.current) return;
    
    // Smooth delta multiplier
    let currentSpeed = isRunning ? Math.max(0.1, speedMultiplier * 0.15) : 0;
    
    // Add jitter for LDR
    if (erratic && isRunning) {
      currentSpeed += (Math.random() - 0.5) * 0.05;
    }

    groupRef.current.children.forEach((group) => {
      // Update the master time property for this energy cluster
      group.userData.t -= currentSpeed * delta;
      if (group.userData.t < 0) group.userData.t = 1;

      // Position the main particle and its glowing trail segments
      group.children.forEach((mesh) => {
        let subT = group.userData.t + mesh.userData.tOffset;
        if (subT > 1) subT -= 1; 
        if (subT < 0) subT += 1;
        
        const pos = curve.getPointAt(subT);
        mesh.position.copy(pos);
      });
    });
  });

  return (
    <group ref={groupRef}>
      {offsets.map((t, i) => (
        <group key={i} userData={{ t }}>
          {/* Main Particle */}
          <mesh userData={{ tOffset: 0 }} castShadow>
            <sphereGeometry args={[0.042]} />
            <meshStandardMaterial color={color} emissive={color} emissiveIntensity={isRunning ? 2.5 : 0} />
          </mesh>
          {/* Trail Segments */}
          <mesh userData={{ tOffset: 0.015 }} castShadow>
            <sphereGeometry args={[0.03]} />
            <meshStandardMaterial color={color} emissive={color} emissiveIntensity={isRunning ? 1.5 : 0} transparent opacity={0.6} />
          </mesh>
          <mesh userData={{ tOffset: 0.03 }} castShadow>
            <sphereGeometry args={[0.02]} />
            <meshStandardMaterial color={color} emissive={color} emissiveIntensity={isRunning ? 0.7 : 0} transparent opacity={0.3} />
          </mesh>
          <mesh userData={{ tOffset: 0.045 }} castShadow>
            <sphereGeometry args={[0.012]} />
            <meshStandardMaterial color={color} emissive={color} emissiveIntensity={isRunning ? 0.2 : 0} transparent opacity={0.1} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

// Component Tooltip
function Tooltip({ show, title, desc }) {
  return show ? (
    <Html position={[0.5, 0, 0]} className="pointer-events-none z-50">
      <div className="bg-slate-950/90 border border-slate-700/50 p-2 text-slate-100 rounded shadow-2xl backdrop-blur-md w-36 animate-fade-in-up">
        <h4 className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest border-b border-white/10 pb-1 mb-1">{title}</h4>
        <p className="text-[9px] text-slate-400 leading-tight">{desc}</p>
      </div>
    </Html>
  ) : null;
}

// LDR Circuit Component
function LDRCircuit({ lux, voltage, isRunning, position }) {
  const [hoveredNode, setHoveredNode] = useState(null);
  const emissiveRef = useRef();
  const ldrMeshRef = useRef();
  const voutMeshRef = useRef();
  const voutMatRef = useRef();
  
  // Wire Path Points (Vertical path with slight bends)
  const path = [
    new THREE.Vector3(0, 3, 0),
    new THREE.Vector3(0, 1.5, 0), // Battery -> Resistor
    new THREE.Vector3(0, -0.5, 0), // Resistor -> Node
    new THREE.Vector3(0, -2, 0), // Node -> LDR
    new THREE.Vector3(0, -3.5, 0) // LDR -> GND
  ];

  // LDR Glow Physics: Slower response, slight erratic flicker, lower overall brightness
  useFrame((state, delta) => {
    const elapsed = state.clock.elapsedTime;
    
    // Smooth LDR surface lag and flicker
    if (emissiveRef.current) {
      let targetGlow = (lux / 1000) * 1.2; 
      if (lux > 0) targetGlow += (Math.random() * 0.15);
      emissiveRef.current.emissiveIntensity = THREE.MathUtils.lerp(
        emissiveRef.current.emissiveIntensity,
        targetGlow,
        delta * 1.5 
      );
    }
    
    // Subtle sensor surface breathing animation
    if (ldrMeshRef.current) {
      ldrMeshRef.current.scale.setScalar(1 + Math.sin(elapsed * 2) * 0.02);
    }

    // Vout node micro-interactions
    if (voutMatRef.current && voutMeshRef.current) {
      // Small pulsing glow
      voutMatRef.current.emissiveIntensity = (voltage / 10) + (Math.sin(elapsed * 6) * 0.15);
      
      // Slight vibration effect on active current flow
      if (lux > 0) {
         voutMeshRef.current.position.x = (Math.sin(elapsed * 40) * 0.006);
         voutMeshRef.current.position.z = (Math.cos(elapsed * 45) * 0.006);
      } else {
         voutMeshRef.current.position.lerp(new THREE.Vector3(0, 0, 0), 0.1);
      }
    }
  });

  return (
    <group position={position}>
      <CurvedWire points={path} />
      <CurrentFlow points={path} isRunning={isRunning} speedMultiplier={voltage} color="#22d3ee" erratic={true} count={10} />

      {/* Title */}
      <Text position={[0, 4, 0]} fontSize={0.25} color="#22d3ee" outlineWidth={0.02} outlineColor="#000">
        Photoresistor Circuit
      </Text>

      {/* Battery */}
      <group position={[0, 3, 0]} onPointerOver={() => setHoveredNode('battery')} onPointerOut={() => setHoveredNode(null)}>
        <mesh castShadow receiveShadow>
          <cylinderGeometry args={[0.25, 0.25, 0.6, 32]} />
          <primitive object={MAT_BATTERY} attach="material" />
        </mesh>
        <mesh position={[0, 0.35, 0]} castShadow>
          <cylinderGeometry args={[0.1, 0.1, 0.1, 16]} />
          <primitive object={MAT_NODE} attach="material" />
        </mesh>
        <Tooltip show={hoveredNode === 'battery'} title="Vcc (Supply)" desc="Provides steady voltage to the circuit." />
        <Html position={[-0.8, 0, 0]} center><div className="text-[10px] text-slate-400 font-mono font-bold bg-black/60 px-1.5 py-0.5 rounded border border-slate-800">Vcc: 5.0V</div></Html>
      </group>

      {/* Resistor */}
      <group position={[0, 1.2, 0]} onPointerOver={() => setHoveredNode('resistor')} onPointerOut={() => setHoveredNode(null)}>
        <mesh castShadow receiveShadow>
          <cylinderGeometry args={[0.1, 0.1, 0.8, 16]} />
          <primitive object={MAT_RESISTOR} attach="material" />
        </mesh>
        {/* Ceramic stripes */}
        <mesh position={[0, 0.2, 0]}><cylinderGeometry args={[0.11, 0.11, 0.05, 16]} /><meshBasicMaterial color="#ef4444" /></mesh>
        <mesh position={[0, 0, 0]}><cylinderGeometry args={[0.11, 0.11, 0.05, 16]} /><meshBasicMaterial color="#000000" /></mesh>
        <mesh position={[0, -0.2, 0]}><cylinderGeometry args={[0.11, 0.11, 0.05, 16]} /><meshBasicMaterial color="#f59e0b" /></mesh>
        
        <Tooltip show={hoveredNode === 'resistor'} title="Fixed Resistor" desc="Used in a voltage divider to create measurable Vout." />
        <Html position={[-0.8, 0, 0]} center><div className="text-[10px] text-slate-400 font-mono font-bold bg-black/60 px-1.5 py-0.5 rounded border border-slate-800">R_fix: 10kΩ</div></Html>
      </group>

      {/* Vout Node */}
      <group position={[0, 0, 0]} onPointerOver={() => setHoveredNode('node')} onPointerOut={() => setHoveredNode(null)}>
        <mesh ref={voutMeshRef} castShadow receiveShadow>
          <sphereGeometry args={[0.15]} />
          <meshStandardMaterial ref={voutMatRef} color="#38bdf8" metalness={0.6} roughness={0.2} emissive="#0284c7" />
        </mesh>
        <Tooltip show={hoveredNode === 'node'} title="Vout Node" desc="Voltage drops here based on LDR resistance." />
        <Html position={[0.8, 0, 0]} center>
          <div className="bg-slate-950/90 border border-cyan-500/40 text-cyan-400 text-[11px] font-bold px-3 py-1.5 rounded shadow-[0_0_12px_rgba(34,211,238,0.2)] whitespace-nowrap backdrop-blur-md">
            Vout: {voltage.toFixed(2)}V
          </div>
        </Html>
      </group>

      {/* LDR */}
      <group position={[0, -1.8, 0]} onPointerOver={() => setHoveredNode('ldr')} onPointerOut={() => setHoveredNode(null)}>
        <mesh ref={ldrMeshRef} castShadow receiveShadow>
          <cylinderGeometry args={[0.3, 0.3, 0.15, 32]} />
          <meshStandardMaterial color="#64748b" metalness={0.4} roughness={0.8} />
        </mesh>
        <mesh position={[0, 0.08, 0]}>
          <cylinderGeometry args={[0.25, 0.25, 0.05, 32]} />
          <meshStandardMaterial ref={emissiveRef} color="#fbbf24" emissive="#fbbf24" emissiveIntensity={0} />
        </mesh>
        <Tooltip show={hoveredNode === 'ldr'} title="Photoresistor Sensor" desc="Light Dependent Resistor. Nonlinear resistance drops as light hits it." />
        <Html position={[-0.8, 0, 0]} center><div className="text-[10px] text-amber-400 font-mono font-bold bg-black/60 px-1.5 py-0.5 border border-slate-800 rounded">Photoresistor</div></Html>
      </group>

      {/* Ground Plate */}
      <group position={[0, -3.5, 0]} onPointerOver={() => setHoveredNode('gnd')} onPointerOut={() => setHoveredNode(null)}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[0.8, 0.1, 0.8]} />
          <primitive object={MAT_GND} attach="material" />
        </mesh>
        <Tooltip show={hoveredNode === 'gnd'} title="Ground (GND)" desc="0V reference point." />
        <Html position={[0, -0.3, 0]} center><div className="text-[9px] text-surface-200/40 font-bold tracking-widest bg-black/40 px-1 rounded uppercase">Gnd</div></Html>
      </group>
    </group>
  );
}

// Photodiode Circuit Component
function PhotodiodeCircuit({ lux, voltage, isRunning, position }) {
  const [hoveredNode, setHoveredNode] = useState(null);
  const pdMeshRef = useRef();
  const voutMeshRef = useRef();
  const voutMatRef = useRef();
  
  const path = [
    new THREE.Vector3(0, 3, 0),
    new THREE.Vector3(0, 1.5, 0),
    new THREE.Vector3(0, -0.5, 0),
    new THREE.Vector3(0, -2, 0),
    new THREE.Vector3(0, -3.5, 0)
  ];

  useFrame((state) => {
    const elapsed = state.clock.elapsedTime;
    
    if (pdMeshRef.current) {
      // Fast, strong, aggressive breathing for active photodiode
      pdMeshRef.current.scale.setScalar(1 + Math.sin(elapsed * 5) * 0.02);
    }

    if (voutMatRef.current && voutMeshRef.current) {
      // Faster pulsing glow to represent linear immediate current
      voutMatRef.current.emissiveIntensity = (voltage / 10) + (Math.sin(elapsed * 8) * 0.2);
      
      // Rigid but fast vibration when active
      if (lux > 0) {
         voutMeshRef.current.position.x = (Math.sin(elapsed * 60) * 0.005);
         voutMeshRef.current.position.y = (Math.cos(elapsed * 60) * 0.005);
      } else {
         voutMeshRef.current.position.lerp(new THREE.Vector3(0, 0, 0), 0.1);
      }
    }
  });

  return (
    <group position={position}>
      <CurvedWire points={path} />
      {/* Higher counts and faster flow for PD to demonstrate linear fast response */}
      <CurrentFlow points={path} isRunning={isRunning} speedMultiplier={voltage * 1.5} color="#10b981" erratic={false} count={14} />

      <Text position={[0, 4, 0]} fontSize={0.25} color="#fbbf24" outlineWidth={0.02} outlineColor="#000">
        Photodiode Circuit
      </Text>

      {/* Battery */}
      <group position={[0, 3, 0]}>
        <mesh castShadow receiveShadow><cylinderGeometry args={[0.25, 0.25, 0.6, 32]} /><primitive object={MAT_BATTERY} attach="material" /></mesh>
        <mesh position={[0, 0.35, 0]} castShadow><cylinderGeometry args={[0.1, 0.1, 0.1, 16]} /><primitive object={MAT_NODE} attach="material" /></mesh>
        <Html position={[0.8, 0, 0]} center><div className="text-[10px] text-slate-400 font-mono font-bold bg-black/60 px-1.5 py-0.5 border border-slate-800 rounded">Vcc: 5.0V</div></Html>
      </group>

      {/* Resistor */}
      <group position={[0, 1.2, 0]}>
        <mesh castShadow receiveShadow><cylinderGeometry args={[0.1, 0.1, 0.8, 16]} /><primitive object={MAT_RESISTOR} attach="material" /></mesh>
        {/* Ceramic stripes */}
        <mesh position={[0, 0.2, 0]}><cylinderGeometry args={[0.11, 0.11, 0.05, 16]} /><meshBasicMaterial color="#ef4444" /></mesh>
        <mesh position={[0, 0, 0]}><cylinderGeometry args={[0.11, 0.11, 0.05, 16]} /><meshBasicMaterial color="#000000" /></mesh>
        <mesh position={[0, -0.2, 0]}><cylinderGeometry args={[0.11, 0.11, 0.05, 16]} /><meshBasicMaterial color="#f59e0b" /></mesh>
        <Html position={[0.8, 0, 0]} center><div className="text-[10px] text-slate-400 font-mono font-bold bg-black/60 px-1.5 py-0.5 border border-slate-800 rounded">R_load: 10kΩ</div></Html>
      </group>

      {/* Vout Node */}
      <group position={[0, 0, 0]}>
        <mesh ref={voutMeshRef} castShadow receiveShadow>
          <sphereGeometry args={[0.15]} />
          <meshStandardMaterial ref={voutMatRef} color="#fbbf24" metalness={0.6} roughness={0.2} emissive="#d97706" />
        </mesh>
        <Html position={[-0.8, 0, 0]} center>
          <div className="bg-slate-950/90 border border-amber-500/40 text-amber-400 text-[11px] font-bold px-3 py-1.5 rounded shadow-[0_0_12px_rgba(251,191,36,0.2)] whitespace-nowrap backdrop-blur-md">
            Vout: {voltage.toFixed(2)}V
          </div>
        </Html>
      </group>

      {/* Photodiode (Reverse Bias) */}
      <group position={[0, -1.8, 0]} onPointerOver={() => setHoveredNode('pd')} onPointerOut={() => setHoveredNode(null)}>
        <mesh ref={pdMeshRef} castShadow receiveShadow rotation={[0, 0, Math.PI]}>
           <coneGeometry args={[0.25, 0.5, 16]} />
           <meshStandardMaterial 
              color="#38bdf8" 
              emissive="#38bdf8" 
              emissiveIntensity={(lux / 1000) * 3} // Instant linear glow update
              metalness={0.4}
           />
        </mesh>
        <mesh position={[0, 0.25, 0]} castShadow>
          <boxGeometry args={[0.5, 0.05, 0.5]} />
          <primitive object={MAT_NODE} attach="material" />
        </mesh>
        <Tooltip show={hoveredNode === 'pd'} title="Photodiode" desc="Reverse-biased PN Junction. Instant, linear photocurrent generation." />
        <Html position={[0.8, 0, 0]} center><div className="text-[10px] text-cyan-400 font-mono font-bold bg-black/60 px-1.5 py-0.5 border border-slate-800 rounded">PD (Rev Bias)</div></Html>
      </group>

      {/* Ground Plate */}
      <group position={[0, -3.5, 0]}>
        <mesh castShadow receiveShadow><boxGeometry args={[0.8, 0.1, 0.8]} /><primitive object={MAT_GND} attach="material" /></mesh>
        <Html position={[0, -0.3, 0]} center><div className="text-[9px] text-surface-200/40 font-bold tracking-widest bg-black/40 px-1 rounded uppercase">Gnd</div></Html>
      </group>
    </group>
  );
}



// Lab Lighting
function LabLighting({ lux }) {
  const intensity = lux / 1000;
  
  return (
    <>
      <ambientLight intensity={0.2} />
      
      {/* Soft Fill Light */}
      <directionalLight position={[10, 5, 10]} intensity={0.5} />
      <directionalLight position={[-10, 5, -10]} intensity={0.2} />

      {/* The Central Spotlight (Experiment Light Source) */}
      <group position={[0, 5, 4]}>
        <mesh>
          <sphereGeometry args={[0.4]} />
          <meshStandardMaterial emissive="#fffbeb" emissiveIntensity={0.2 + intensity * 3} color="#fef08a" />
        </mesh>
        <spotLight 
          position={[0, 0, 0]}
          target-position={[0, -2, 0]}
          color="#fffbeb"
          intensity={intensity * 10}
          angle={Math.PI / 4}
          penumbra={0.6}
          castShadow
          shadow-mapSize={[2048, 2048]}
          shadow-bias={-0.0001}
        />
        <Html position={[0, 0.8, 0]} center className="pointer-events-none">
           <div className="text-[#fcd34d] font-mono font-bold text-[14px] whitespace-nowrap drop-shadow-[0_0_12px_rgba(251,191,36,0.9)] bg-black/40 px-2 rounded-full border border-yellow-500/30">
             ☼ {lux / 10}% Intensity
           </div>
        </Html>
      </group>
    </>
  );
}

/**
 * Circuit3D — Highly polished, interactive 3D physics lab simulator.
 */
export default function Circuit3D({ lux, ldrVoltage, pdVoltage, isRunning }) {
  const [view, setView] = useState('default');
  const cameraControlRef = useRef(null);

  // Cinematic Camera Easing
  useEffect(() => {
    if (!cameraControlRef.current) return;
    const cc = cameraControlRef.current;
    
    // setLookAt(CamX, CamY, CamZ, TargetX, TargetY, TargetZ, enableTransition)
    if (view === 'ldr') {
       cc.setLookAt(-2.5, 0, 4, -2.5, -1, 0, true);
    } else if (view === 'pd') {
       cc.setLookAt(2.5, 0, 4, 2.5, -1, 0, true);
    } else {
       cc.setLookAt(0, 0, 8, 0, -1, 0, true);
    }
  }, [view]);

  return (
    <div className="w-full h-full relative group">
      
      {/* 3D Canvas */}
      <Canvas 
        shadows
        frameloop="always"
        camera={{ position: [0, 0, 8], fov: 45 }}
        gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.2 }}
      >
        <fog attach="fog" args={["#020202", 10, 30]} />
        <CameraControls ref={cameraControlRef} makeDefault minDistance={3} maxDistance={15} maxPolarAngle={Math.PI / 1.5} />
        
        <LabLighting lux={lux} />

        {/* Scene Floor with Realistic Reflections & Soft Shadows */}
        <mesh position={[0, -3.5, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[50, 50]} />
          <MeshReflectorMaterial
            blur={[300, 100]}
            resolution={2048}
            mixBlur={1}
            mixStrength={40}
            roughness={0.8}
            depthScale={1.2}
            minDepthThreshold={0.4}
            maxDepthThreshold={1.4}
            color="#050505"
            metalness={0.5}
          />
        </mesh>
        
        {/* Soft Ambient Contact Shadows resting strictly on the floor */}
        <ContactShadows resolution={1024} scale={30} blur={2.5} opacity={0.8} far={10} color="#000000" position={[0, -3.49, 0]} />
        
        <LDRCircuit lux={lux} voltage={ldrVoltage} isRunning={isRunning} position={[-2.5, 0, 0]} />
        <PhotodiodeCircuit lux={lux} voltage={pdVoltage} isRunning={isRunning} position={[2.5, 0, 0]} />

      </Canvas>

      {/* Camera View Controls overlaid */}
      <div className="absolute top-6 left-6 flex gap-3 z-10 pointer-events-auto">
        <button onPointerEnter={() => setView('ldr')} onPointerLeave={() => setView('default')} className="bg-slate-900/80 hover:bg-slate-800 text-[10px] text-slate-300 border border-slate-700/50 px-4 py-2 rounded-lg backdrop-blur-md transition-colors cursor-pointer font-bold uppercase tracking-widest shadow-lg">
          🔍 Focus Photoresistor
        </button>
        <button onPointerEnter={() => setView('pd')} onPointerLeave={() => setView('default')} className="bg-slate-900/80 hover:bg-slate-800 text-[10px] text-slate-300 border border-slate-700/50 px-4 py-2 rounded-lg backdrop-blur-md transition-colors cursor-pointer font-bold uppercase tracking-widest shadow-lg">
          🔍 Focus Photodiode
        </button>
      </div>

    </div>
  );
}
