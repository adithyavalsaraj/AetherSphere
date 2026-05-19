"use client";

import {
  Eye,
  Flame,
  Info,
  Magnet,
  MousePointerClick,
  Orbit,
  Palette,
  RefreshCw,
  RotateCw,
  Sliders,
  Sparkles,
  Zap,
} from "lucide-react";
import { useState, useTransition } from "react";
import SphereLoader from "./sphere-loader";

interface Preset {
  name: string;
  description: string;
  size: number;
  particleCount: number;
  rotationSpeed: number;
  animationDuration: number;
  particleColor: string;
  lineColor: string;
  enablePulsing: boolean;
  pulseIntensity: number;
  enableGravity: boolean;
  gravityMode: "repel" | "attract" | "swirl";
  particleShape: "dots" | "crosshairs" | "squares" | "rings";
  explosionStyle: "supernova" | "singularity" | "vortex";
  chromaCycle: boolean;
  enableGlow: boolean;
}

const PRESETS: Record<string, Preset> = {
  cosmicCore: {
    name: "Cosmic Core",
    description:
      "Classic neon cyan glowing core with default gravity repulsion.",
    size: 450, // Default 450px for gorgeous large screen scaling
    particleCount: 80,
    rotationSpeed: 0.4,
    animationDuration: 1500,
    particleColor: "#06b6d4",
    lineColor: "rgba(103, 232, 249, 0.45)",
    enablePulsing: true,
    pulseIntensity: 0.4,
    enableGravity: true,
    gravityMode: "repel",
    particleShape: "dots",
    explosionStyle: "supernova",
    chromaCycle: false,
    enableGlow: true,
  },
  singularity: {
    name: "Dark Singularity",
    description: "An imploding black hole attracting quantum nodes.",
    size: 480,
    particleCount: 160,
    rotationSpeed: 0.6,
    animationDuration: 1200,
    particleColor: "#a78bfa",
    lineColor: "rgba(139, 92, 246, 0.3)",
    enablePulsing: true,
    pulseIntensity: 0.8,
    enableGravity: true,
    gravityMode: "attract",
    particleShape: "rings",
    explosionStyle: "singularity",
    chromaCycle: false,
    enableGlow: true,
  },
  auroraSwirl: {
    name: "Aurora Swirl",
    description: "Vibrant chroma color flow swirling around the cursor.",
    size: 520,
    particleCount: 120,
    rotationSpeed: 0.3,
    animationDuration: 2000,
    particleColor: "#10b981",
    lineColor: "rgba(16, 185, 129, 0.2)",
    enablePulsing: true,
    pulseIntensity: 0.5,
    enableGravity: true,
    gravityMode: "swirl",
    particleShape: "crosshairs",
    explosionStyle: "vortex",
    chromaCycle: true,
    enableGlow: true,
  },
  quantumZen: {
    name: "Quantum Matrix",
    description: "Minimal geometric squares operating in silent harmony.",
    size: 420,
    particleCount: 24,
    rotationSpeed: 0.1,
    animationDuration: 2500,
    particleColor: "#f43f5e",
    lineColor: "rgba(244, 63, 94, 0.3)",
    enablePulsing: false,
    pulseIntensity: 0.2,
    enableGravity: true,
    gravityMode: "repel",
    particleShape: "squares",
    explosionStyle: "supernova",
    chromaCycle: false,
    enableGlow: false,
  },
};

export default function Demo() {
  const [, startTransition] = useTransition();

  // Real-time editable states (Defaults set larger for high-res large screens!)
  const [size, setSize] = useState(480);
  const [particleCount, setParticleCount] = useState(80);
  const [rotationSpeed, setRotationSpeed] = useState(0.4);
  const [animationDuration, setAnimationDuration] = useState(1500);
  const [particleColor, setParticleColor] = useState("#06b6d4");
  const [lineColor, setLineColor] = useState("rgba(103, 232, 249, 0.4)");
  const [enablePulsing, setEnablePulsing] = useState(true);
  const [pulseIntensity, setPulseIntensity] = useState(0.5);
  const [interactive, setInteractive] = useState(true);
  const [enableGravity, setEnableGravity] = useState(true);
  const [enableClickBurst, setEnableClickBurst] = useState(true);
  const [autoRotate, setAutoRotate] = useState(true);

  // Newly added high-fidelity controls!
  const [gravityMode, setGravityMode] = useState<"repel" | "attract" | "swirl">(
    "repel",
  );
  const [particleShape, setParticleShape] = useState<
    "dots" | "crosshairs" | "squares" | "rings"
  >("dots");
  const [explosionStyle, setExplosionStyle] = useState<
    "supernova" | "singularity" | "vortex"
  >("supernova");
  const [chromaCycle, setChromaCycle] = useState(false);
  const [enableGlow, setEnableGlow] = useState(true);

  const [activePreset, setActivePreset] = useState<string>("cosmicCore");
  const [triggerKey, setTriggerKey] = useState(0);

  const applyPreset = (key: string) => {
    setActivePreset(key);
    const preset = PRESETS[key];
    if (!preset) return;

    startTransition(() => {
      setSize(preset.size);
      setParticleCount(preset.particleCount);
      setRotationSpeed(preset.rotationSpeed);
      setAnimationDuration(preset.animationDuration);
      setParticleColor(preset.particleColor);
      setLineColor(preset.lineColor);
      setEnablePulsing(preset.enablePulsing);
      setPulseIntensity(preset.pulseIntensity);
      setEnableGravity(preset.enableGravity);
      setGravityMode(preset.gravityMode);
      setParticleShape(preset.particleShape);
      setExplosionStyle(preset.explosionStyle);
      setChromaCycle(preset.chromaCycle);
      setEnableGlow(preset.enableGlow);
    });
  };

  const restartConvergence = () => {
    setTriggerKey((prev) => prev + 1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100 flex flex-col lg:flex-row overflow-hidden font-sans">
      {/* 1. Main Canvas Area */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 relative min-h-[60vh] lg:min-h-screen">
        {/* Decorative Grid and Ambient Lights */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1.2px,transparent_1.2px),linear-gradient(to_bottom,#1e293b_1.2px,transparent_1.2px)] bg-[size:5rem_5rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-20 pointer-events-none" />

        {/* Ambient colored aura corresponding to active particle color */}
        <div
          className="absolute w-[500px] h-[500px] rounded-full blur-[140px] opacity-15 pointer-events-none transition-all duration-1000"
          style={{
            backgroundColor: chromaCycle ? "rgb(6, 182, 212)" : particleColor,
            top: "calc(50% - 250px)",
            left: "calc(50% - 250px)",
          }}
        />

        {/* Live Title & Instructions */}
        <div className="absolute top-8 left-8 right-8 flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6 z-10 pointer-events-none">
          <div>
            <h1 className="text-3xl xl:text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-teal-400 to-emerald-400 flex items-center gap-2">
              <Orbit className="h-9 w-9 text-cyan-400 animate-spin-slow" />
              AetherSphere Studio
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Interactive 3D mathematical particle system rendering real-time
              quantum projections
            </p>
          </div>

          {/* Scientific Telemetry HUD Card */}
          <div className="pointer-events-auto bg-slate-950/80 backdrop-blur-md px-5 py-4 rounded-xl border border-slate-800/80 text-xs text-slate-300 shadow-xl flex flex-col md:flex-row items-stretch md:items-center gap-4 min-w-[260px] md:min-w-fit">
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
              <div className="flex flex-col">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                  Node Density
                </span>
                <span className="text-cyan-400 font-mono text-sm font-semibold">
                  {particleCount} active
                </span>
              </div>
              <div className="w-px h-6 bg-slate-800 hidden md:block" />
              <div className="flex flex-col">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                  Spin Speed
                </span>
                <span className="text-cyan-400 font-mono text-sm font-semibold">
                  {rotationSpeed} rad/s
                </span>
              </div>
              <div className="w-px h-6 bg-slate-800 hidden md:block" />
              <div className="flex flex-col">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                  Gravity Mode
                </span>
                <span className="text-cyan-400 font-mono text-sm font-semibold capitalize">
                  {enableGravity
                    ? gravityMode === "repel"
                      ? "Repulsion"
                      : gravityMode === "attract"
                        ? "Attraction"
                        : "Swirl Orbit"
                    : "Disabled"}
                </span>
              </div>
            </div>

            <div className="w-full md:w-px h-px md:h-8 bg-slate-800" />

            <div className="flex items-center justify-between md:justify-start gap-4">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="font-mono text-slate-400">FPS: 60</span>
              </div>
              <button
                onClick={restartConvergence}
                className="flex items-center gap-1 transition-all text-cyan-400 hover:text-cyan-300 bg-cyan-500/10 hover:bg-cyan-500/20 px-3 py-1.5 rounded-lg border border-cyan-500/30 text-xs font-semibold"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Reset Matrix
              </button>
            </div>
          </div>
        </div>

        {/* Playable Interactive Loader Canvas (Bigger display box!) */}
        <div className="relative flex items-center justify-center p-12 bg-slate-900/10 backdrop-blur-[1px] rounded-full border border-slate-800/20 shadow-2xl transition-all duration-500 hover:border-slate-700/35">
          <SphereLoader
            key={triggerKey}
            size={size}
            particleColor={particleColor}
            lineColor={lineColor}
            particleCount={particleCount}
            animationDuration={animationDuration}
            enablePulsing={enablePulsing}
            pulseIntensity={pulseIntensity}
            interactive={interactive}
            enableGravity={enableGravity}
            enableClickBurst={enableClickBurst}
            rotationSpeed={rotationSpeed}
            autoRotate={autoRotate}
            gravityMode={gravityMode}
            particleShape={particleShape}
            explosionStyle={explosionStyle}
            chromaCycle={chromaCycle}
            enableGlow={enableGlow}
          />
        </div>

        {/* Floating Playable Tip */}
        <div className="absolute bottom-8 bg-slate-900/85 backdrop-blur-md px-5 py-3.5 rounded-xl border border-slate-800/80 max-w-md shadow-xl text-center flex items-center gap-3">
          <MousePointerClick className="h-5 w-5 text-cyan-400 animate-bounce flex-shrink-0" />
          <p className="text-xs text-slate-300 leading-relaxed">
            <strong className="text-slate-100 font-semibold">
              Play with the Sphere:
            </strong>{" "}
            Click to trigger a particle{" "}
            {explosionStyle === "supernova"
              ? "supernova"
              : explosionStyle === "singularity"
                ? "implosion singularity"
                : "vortex spiral"}
            ! Drag to rotate, and hover to deflect/swirl!
          </p>
        </div>
      </div>

      {/* 2. Interactive Control Sidebar */}
      <div className="w-full lg:w-[480px] bg-slate-950/80 backdrop-blur-xl border-t lg:border-t-0 lg:border-l border-slate-800/80 flex flex-col p-6 overflow-y-auto max-h-screen shadow-2xl relative z-20">
        {/* Header */}
        <div className="border-b border-slate-800/60 pb-5 mb-6">
          <div className="flex items-center gap-2 text-cyan-400 font-bold tracking-wide uppercase text-xs mb-1.5">
            <Sparkles className="h-3.5 w-3.5" />
            Interactive Studio v2
          </div>
          <h2 className="text-xl font-bold text-white">Quantum Parameters</h2>
          <p className="text-xs text-slate-400 mt-1">
            Adjust dimensions, custom shapes, gravitational fields & aesthetics
          </p>
        </div>

        {/* Tab 1: Presets */}
        <div className="mb-6">
          <div className="flex items-center gap-1.5 text-sm font-semibold text-slate-300 mb-3">
            <Zap className="h-4 w-4 text-amber-400" />
            Select Cosmic Preset
          </div>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(PRESETS).map(([key, p]) => (
              <button
                key={key}
                onClick={() => applyPreset(key)}
                className={`text-left p-3 rounded-lg border text-xs transition-all duration-300 ${
                  activePreset === key
                    ? "bg-cyan-500/10 border-cyan-500 text-white shadow-[0_0_15px_rgba(6,182,212,0.15)]"
                    : "bg-slate-900/50 border-slate-800/80 text-slate-400 hover:border-slate-700 hover:text-slate-200"
                }`}
              >
                <div className="font-bold flex items-center justify-between">
                  {p.name}
                  {activePreset === key && (
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                  )}
                </div>
                <div className="text-[10px] text-slate-400 mt-1 line-clamp-1 leading-tight">
                  {p.description}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Controls Section */}
        <div className="space-y-6 flex-1">
          {/* Category: Geometry & Scaling */}
          <div className="bg-slate-900/30 rounded-xl p-4 border border-slate-900/50 space-y-4">
            <div className="flex items-center gap-1.5 text-sm font-semibold text-slate-300 border-b border-slate-800 pb-2">
              <Sliders className="h-4 w-4 text-cyan-400" />
              Scale & Density
            </div>

            {/* Size Slider (Increased Max to 800px!) */}
            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-slate-400">Sphere Diameter</span>
                <span className="text-cyan-400 font-mono font-medium">
                  {size}px
                </span>
              </div>
              <input
                type="range"
                min="200"
                max="800"
                step="10"
                value={size}
                onChange={(e) => {
                  setSize(Number(e.target.value));
                  setActivePreset("");
                }}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
              />
              <p className="text-[10px] text-slate-500 mt-1">
                Scale up to 800px for massive high-res screens.
              </p>
            </div>

            {/* Particle Count Slider */}
            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-slate-400">Particle Count</span>
                <span className="text-cyan-400 font-mono font-medium">
                  {particleCount} units
                </span>
              </div>
              <input
                type="range"
                min="12"
                max="320"
                step="4"
                value={particleCount}
                onChange={(e) => {
                  setParticleCount(Number(e.target.value));
                  setActivePreset("");
                }}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
              />
            </div>
          </div>

          {/* Category: Visuals & Aesthetics */}
          <div className="bg-slate-900/30 rounded-xl p-4 border border-slate-900/50 space-y-4">
            <div className="flex items-center gap-1.5 text-sm font-semibold text-slate-300 border-b border-slate-800 pb-2">
              <Palette className="h-4 w-4 text-purple-400" />
              Visual Styling & Glow
            </div>

            {/* Particle Shapes */}
            <div>
              <span className="text-xs text-slate-400 block mb-2">
                Particle Shape
              </span>
              <div className="grid grid-cols-4 gap-1">
                {(["dots", "crosshairs", "squares", "rings"] as const).map(
                  (shape) => (
                    <button
                      key={shape}
                      onClick={() => {
                        setParticleShape(shape);
                        setActivePreset("");
                      }}
                      className={`px-1.5 py-2 rounded text-[10px] capitalize font-medium border text-center transition-all ${
                        particleShape === shape
                          ? "bg-purple-500/10 border-purple-500 text-white"
                          : "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700"
                      }`}
                    >
                      {shape}
                    </button>
                  ),
                )}
              </div>
            </div>

            {/* Glow shader and Chroma flow toggles */}
            <div className="grid grid-cols-2 gap-4 pt-1">
              {/* Glow Shader Toggle */}
              <div className="flex items-center justify-between bg-slate-950/40 p-2.5 rounded border border-slate-900">
                <div className="flex flex-col">
                  <span className="text-xs text-slate-300 flex items-center gap-1">
                    <Eye className="h-3 w-3 text-cyan-400" /> Glow
                  </span>
                </div>
                <button
                  onClick={() => setEnableGlow(!enableGlow)}
                  className={`w-9 h-5 rounded-full p-0.5 transition-colors duration-300 focus:outline-none ${
                    enableGlow ? "bg-cyan-500" : "bg-slate-800"
                  }`}
                >
                  <div
                    className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ${
                      enableGlow ? "translate-x-4" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

              {/* Chroma Rainbow Toggle */}
              <div className="flex items-center justify-between bg-slate-950/40 p-2.5 rounded border border-slate-900">
                <div className="flex flex-col">
                  <span className="text-xs text-slate-300 flex items-center gap-1">
                    <Palette className="h-3 w-3 text-emerald-400" /> Chroma
                  </span>
                </div>
                <button
                  onClick={() => setChromaCycle(!chromaCycle)}
                  className={`w-9 h-5 rounded-full p-0.5 transition-colors duration-300 focus:outline-none ${
                    chromaCycle ? "bg-cyan-500" : "bg-slate-800"
                  }`}
                >
                  <div
                    className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ${
                      chromaCycle ? "translate-x-4" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>
            </div>

            {!chromaCycle && (
              <div className="grid grid-cols-2 gap-4">
                {/* Particle Color */}
                <div>
                  <span className="text-[10px] text-slate-400 block mb-1">
                    Node Hex Color
                  </span>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="color"
                      value={particleColor}
                      onChange={(e) => {
                        setParticleColor(e.target.value);
                        setActivePreset("");
                      }}
                      className="w-7 h-7 rounded border border-slate-800 bg-transparent cursor-pointer"
                    />
                    <input
                      type="text"
                      value={particleColor}
                      onChange={(e) => setParticleColor(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded px-1.5 py-1 text-[10px] font-mono text-slate-300 focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>

                {/* Line Color */}
                <div>
                  <span className="text-[10px] text-slate-400 block mb-1">
                    Vector Hex Color
                  </span>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="color"
                      value={
                        lineColor.startsWith("rgba") ? "#67e8f9" : lineColor
                      }
                      onChange={(e) => {
                        setLineColor(e.target.value);
                        setActivePreset("");
                      }}
                      className="w-7 h-7 rounded border border-slate-800 bg-transparent cursor-pointer"
                    />
                    <input
                      type="text"
                      value={lineColor}
                      onChange={(e) => setLineColor(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded px-1.5 py-1 text-[10px] font-mono text-slate-300 focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Category: Physics & Rotation */}
          <div className="bg-slate-900/30 rounded-xl p-4 border border-slate-900/50 space-y-4">
            <div className="flex items-center gap-1.5 text-sm font-semibold text-slate-300 border-b border-slate-800 pb-2">
              <RotateCw className="h-4 w-4 text-emerald-400 animate-spin-slow" />
              Physics & Rotation
            </div>

            {/* Auto Rotate Control */}
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-xs text-slate-200">Orbital Spin</span>
                <span className="text-[10px] text-slate-400">
                  Keep sphere continuously spinning
                </span>
              </div>
              <button
                onClick={() => setAutoRotate(!autoRotate)}
                className={`w-11 h-6 rounded-full p-1 transition-colors duration-300 focus:outline-none ${
                  autoRotate ? "bg-cyan-500" : "bg-slate-800"
                }`}
              >
                <div
                  className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ${
                    autoRotate ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            {/* Velocity Slider */}
            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-slate-400">Velocity Speed</span>
                <span className="text-cyan-400 font-mono font-medium">
                  {rotationSpeed} rad/s
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="2.5"
                step="0.05"
                value={rotationSpeed}
                onChange={(e) => {
                  setRotationSpeed(Number(e.target.value));
                  setActivePreset("");
                }}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
              />
            </div>
          </div>

          {/* Category: Playable Interactivity & Gravitation */}
          <div className="bg-slate-900/30 rounded-xl p-4 border border-slate-900/50 space-y-4">
            <div className="flex items-center gap-1.5 text-sm font-semibold text-slate-300 border-b border-slate-800 pb-2">
              <Magnet className="h-4 w-4 text-blue-400" />
              Gravitation Fields & Click-Burst
            </div>

            {/* Hover Gravity/Deflection Toggle */}
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-xs text-slate-200">
                  Cursor Physics Distortion
                </span>
                <span className="text-[10px] text-slate-400">
                  Distort sphere shape around mouse position
                </span>
              </div>
              <button
                onClick={() => setEnableGravity(!enableGravity)}
                className={`w-11 h-6 rounded-full p-1 transition-colors duration-300 focus:outline-none ${
                  enableGravity ? "bg-cyan-500" : "bg-slate-800"
                }`}
              >
                <div
                  className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ${
                    enableGravity ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            {/* Gravity Field Mode Selection */}
            {enableGravity && (
              <div>
                <span className="text-xs text-slate-400 block mb-2">
                  Gravity Interaction Style
                </span>
                <div className="grid grid-cols-3 gap-1">
                  {(["repel", "attract", "swirl"] as const).map((mode) => (
                    <button
                      key={mode}
                      onClick={() => {
                        setGravityMode(mode);
                        setActivePreset("");
                      }}
                      className={`py-1.5 rounded text-[10px] capitalize font-medium border text-center transition-all ${
                        gravityMode === mode
                          ? "bg-blue-500/10 border-blue-500 text-white"
                          : "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700"
                      }`}
                    >
                      {mode === "repel"
                        ? "Repulsion"
                        : mode === "attract"
                          ? "Attraction"
                          : "Swirling Orbit"}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Explosion Type Selector */}
            <div>
              <span className="text-xs text-slate-400 block mb-2">
                Explosion / Click-Burst Style
              </span>
              <div className="grid grid-cols-3 gap-1">
                {(["supernova", "singularity", "vortex"] as const).map(
                  (style) => (
                    <button
                      key={style}
                      onClick={() => {
                        setExplosionStyle(style);
                        setActivePreset("");
                      }}
                      className={`py-1.5 rounded text-[10px] capitalize font-medium border text-center transition-all ${
                        explosionStyle === style
                          ? "bg-amber-500/10 border-amber-500 text-white"
                          : "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700"
                      }`}
                    >
                      {style === "supernova"
                        ? "Supernova"
                        : style === "singularity"
                          ? "Singularity"
                          : "Twist Vortex"}
                    </button>
                  ),
                )}
              </div>
            </div>

            {/* Click Burst Toggle */}
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-xs text-slate-200">
                  Click Particle Burst
                </span>
                <span className="text-[10px] text-slate-400">
                  Trigger active explosion when clicking sphere
                </span>
              </div>
              <button
                onClick={() => setEnableClickBurst(!enableClickBurst)}
                className={`w-11 h-6 rounded-full p-1 transition-colors duration-300 focus:outline-none ${
                  enableClickBurst ? "bg-cyan-500" : "bg-slate-800"
                }`}
              >
                <div
                  className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ${
                    enableClickBurst ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Category: Pulse Settings */}
          <div className="bg-slate-900/30 rounded-xl p-4 border border-slate-900/50 space-y-4">
            <div className="flex items-center gap-1.5 text-sm font-semibold text-slate-300 border-b border-slate-800 pb-2">
              <Flame className="h-4 w-4 text-orange-400" />
              Dynamic Pulsing Waves
            </div>

            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-xs text-slate-200">
                  Pulsing Amplitude Waves
                </span>
                <span className="text-[10px] text-slate-400">
                  Oscillate diameters periodically
                </span>
              </div>
              <button
                onClick={() => setEnablePulsing(!enablePulsing)}
                className={`w-11 h-6 rounded-full p-1 transition-colors duration-300 focus:outline-none ${
                  enablePulsing ? "bg-cyan-500" : "bg-slate-800"
                }`}
              >
                <div
                  className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ${
                    enablePulsing ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            {enablePulsing && (
              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-slate-400">Wave Intensity</span>
                  <span className="text-cyan-400 font-mono font-medium">
                    {pulseIntensity}x
                  </span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="1.5"
                  step="0.05"
                  value={pulseIntensity}
                  onChange={(e) => {
                    setPulseIntensity(Number(e.target.value));
                    setActivePreset("");
                  }}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                />
              </div>
            )}
          </div>
        </div>

        {/* Footer info */}
        <div className="mt-8 pt-5 border-t border-slate-800/60 text-[10px] text-slate-500 flex items-center justify-between">
          <span>Engine: Next.js + React 19 Canvas SVG</span>
          <span className="flex items-center gap-1 text-slate-400">
            <Info className="h-3 w-3" /> Fully Playable Sandbox
          </span>
        </div>
      </div>
    </div>
  );
}
