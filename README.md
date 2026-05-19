# 🌌 AetherSphere Studio

[![Next.js](https://img.shields.io/badge/Framework-Next.js%2015-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React 19](https://img.shields.io/badge/Library-React%2019-blue?style=for-the-badge&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/Language-TypeScript-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Styling-Tailwind%20CSS%203-38bdf8?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

**AetherSphere Studio** is a state-of-the-art interactive 3D mathematical particle system and loading canvas playground. Built with Next.js, React 19, and SVG rendering, it delivers highly performant, customizable 3D coordinate convergence, orbital mechanics, and fluid pointer-gravitation physics directly in the browser.

---

## ✨ Features

- 🕹️ **Playable Grab & Spin**: Grabbing and dragging the canvas rotates the mathematical model in full 3D space with fluid momentum and deceleration inertia.
- 🧲 **Multi-Modal Gravity Fields**:
  - **Repulsion**: Pushes nodes away from the cursor.
  - **Attraction (Black Hole)**: Warps and gathers nodes under the pointer coordinate.
  - **Swirling Orbit**: Captures nearby nodes into a fluid tangential vortex orbit surrounding the cursor.
- 📐 **Node Sizing & Display Scaling**: Default core size standard set to `480px` for gorgeous rendering on large, high-resolution screens (adjustable up to `800px` in real-time).
- 🧩 **Geometric Particle Shapes**: Toggle between standard **Dots**, rotating vector **Crosshairs**, modular **Squares**, and hollow **Rings**.
- 💥 **3 Cosmic Click-Burst Styles**:
  - **Supernova**: Expanding outward particle scatter with speed decay.
  - **Singularity**: Inward particle collapse before structural snaps.
  - **Vortex**: Intense spiraling rotation along the vertical axis.
- 🌈 **Aesthetic Visual Effects**:
  - **feGaussianBlur Bloom**: Authentic glowing neon gas-discharge bloom on nodes and links.
  - **Chroma Rainbow Cycling**: Time-based HSL color morphing flowing smoothly through neon spectrums.
- 📊 **Scientific Telemetry HUD**: Floating telemetry dashboard overlay reporting node density, spin velocity, active forces, and core stability metrics in real-time.

---

## 🚀 Getting Started

Follow these steps to run the interactive sandbox locally:

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/adithyavalsaraj/sphere-loader.git
cd sphere-loader
npm install
```

### 2. Launch Development Server
Clear the build cache and run the local hot-reload dev environment:
```bash
rm -rf .next
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to access the AetherSphere interactive studio.

### 3. Production Compilation
Compile the optimized production package:
```bash
npm run build
npm run start
```

---

## 🧩 Component Integration

### Basic Implementation
```tsx
import SphereLoader from './sphere-loader'

export default function MyPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-950">
      <SphereLoader size={450} particleColor="#06b6d4" />
    </div>
  )
}
```

### High-Fidelity Interactive Playground Implementation
```tsx
<SphereLoader
  size={480}
  particleColor="#06b6d4"
  lineColor="rgba(103, 232, 249, 0.4)"
  particleCount={80}
  animationDuration={1500}
  enablePulsing={true}
  pulseIntensity={0.5}
  interactive={true}
  enableGravity={true}
  gravityMode="repel"
  particleShape="dots"
  explosionStyle="supernova"
  chromaCycle={false}
  enableGlow={true}
/>
```

---

## 🛠️ Configuration Props (`SphereLoaderProps`)

| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `size` | `number` | `450` | Sizing diameter of the SVG rendering container in pixels. |
| `particleColor` | `string` | `"#06b6d4"` | Color of the nodes (Hex, HSL, or RGBA). |
| `lineColor` | `string` | `"#67e8f9"` | Color of the vector lattices connecting adjacent nodes. |
| `particleCount` | `number` | `64` | Total particle nodes calculated in the Fibonacci distribution. |
| `animationDuration`| `number` | `1500` | Duration (ms) of the convergence animation on mount. |
| `enablePulsing` | `boolean` | `true` | Enables periodic wave size and opacity breathing. |
| `pulseIntensity` | `number` | `0.5` | Amplification scale of the pulse waves. |
| `interactive` | `boolean` | `true` | Enables pointer grab dragging and 3D rotation. |
| `enableGravity` | `boolean` | `true` | Enables cursor field physics distortion inside SVG coordinate bounds. |
| `gravityMode` | `"repel" \| "attract" \| "swirl"` | `"repel"` | Style of cursor-gravity field (push away, pull in, or orbit). |
| `particleShape` | `"dots" \| "crosshairs" \| "squares" \| "rings"` | `"dots"` | Geometric shape rendered at active node coordinates. |
| `explosionStyle` | `"supernova" \| "singularity" \| "vortex"` | `"supernova"` | Physics motion of click-burst expansion/implosion animations. |
| `chromaCycle` | `boolean` | `false` | Time-based HSL multi-color flow morphing over time. |
| `enableGlow` | `boolean` | `true` | Applies SVG `<feGaussianBlur>` bloom filters to components. |

---

## 📐 Math & Architecture

For a deep explanation of the mathematics behind this library (Fibonacci sphere distribution, 3D Euler coordinate rotation matrices, perspective camera projection, and cursor force mechanics), please read [**ARCHITECTURE.md**](./ARCHITECTURE.md).

---

## 📄 License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
