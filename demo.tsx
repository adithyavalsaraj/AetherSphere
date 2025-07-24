"use client"

import SphereLoader from "./sphere-loader"

export default function Demo() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl">
        {/* Default loader */}
        <div className="flex flex-col items-center space-y-4">
          <h3 className="text-white text-lg font-semibold">Default</h3>
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-8 border border-white/10">
            <SphereLoader />
          </div>
        </div>

        {/* Large cyan loader with pulsing */}
        <div className="flex flex-col items-center space-y-4">
          <h3 className="text-white text-lg font-semibold">Pulsing Cyan</h3>
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-8 border border-white/10">
            <SphereLoader
              size={500}
              particleColor="#06b6d4"
              lineColor="#67e8f9"
              particleCount={320}
              animationDuration={3000}
              enablePulsing={true}
              pulseIntensity={0.3}
            />
          </div>
        </div>

        {/* Purple loader with intense pulsing */}
        <div className="flex flex-col items-center space-y-4">
          <h3 className="text-white text-lg font-semibold">Pulsing Purple</h3>
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-8 border border-white/10">
            <SphereLoader
              size={120}
              particleColor="#8b5cf6"
              lineColor="#c4b5fd"
              particleCount={28}
              animationDuration={1200}
              enablePulsing={true}
              pulseIntensity={0.8}
            />
          </div>
        </div>

        {/* Subtle pulsing green loader */}
        <div className="flex flex-col items-center space-y-4">
          <h3 className="text-white text-lg font-semibold">Subtle Pulse</h3>
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-8 border border-white/10">
            <SphereLoader
              size={100}
              particleColor="#10b981"
              lineColor="#6ee7b7"
              particleCount={20}
              animationDuration={1800}
              enablePulsing={true}
              pulseIntensity={0.3}
            />
          </div>
        </div>

        {/* Orange loader */}
        <div className="flex flex-col items-center space-y-4">
          <h3 className="text-white text-lg font-semibold">Orange</h3>
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-8 border border-white/10">
            <SphereLoader
              size={140}
              particleColor="#f97316"
              lineColor="#fdba74"
              particleCount={36}
              animationDuration={1000}
            />
          </div>
        </div>

        {/* Pink loader */}
        <div className="flex flex-col items-center space-y-4">
          <h3 className="text-white text-lg font-semibold">Pink</h3>
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-8 border border-white/10">
            <SphereLoader
              size={110}
              particleColor="#ec4899"
              lineColor="#f9a8d4"
              particleCount={24}
              animationDuration={1600}
            />
          </div>
        </div>
      </div>

      {/* Usage example */}
      <div className="absolute top-8 left-8 bg-black/20 backdrop-blur-sm rounded-lg p-4 border border-white/10 max-w-sm">
        <h4 className="text-white font-semibold mb-2">Usage:</h4>
        <pre className="text-green-400 text-xs overflow-x-auto">
          {`<SphereLoader
  size={120}
  particleColor="#06b6d4"
  lineColor="#67e8f9"
  particleCount={24}
  animationDuration={1500}
  enablePulsing={true}
  pulseIntensity={0.5}
/>`}
        </pre>
      </div>

      {/* Animation phases info */}
      <div className="absolute bottom-8 right-8 bg-black/20 backdrop-blur-sm rounded-lg p-4 border border-white/10 max-w-xs">
        <h4 className="text-white font-semibold mb-2">Animation Phases:</h4>
        <div className="text-sm text-gray-300 space-y-1">
          <div>1. Particles start scattered</div>
          <div>2. Converge to sphere surface</div>
          <div>3. Continuous 3D rotation</div>
          <div>4. Synchronized pulsing waves</div>
        </div>
      </div>
    </div>
  )
}
