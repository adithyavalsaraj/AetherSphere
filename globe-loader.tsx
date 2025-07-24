"use client"

import { useMemo } from "react"

interface GlobeLoaderProps {
  size?: number
  particleColor?: string
  lineColor?: string
  particleCount?: number
  animationDuration?: number
  className?: string
}

interface Particle {
  id: number
  x: number
  y: number
  z: number
  initialX: number
  initialY: number
  scale: number
  opacity: number
}

export default function GlobeLoader({
  size = 120,
  particleColor = "#06b6d4",
  lineColor = "#67e8f9",
  particleCount = 24,
  animationDuration = 1500,
  className = "",
}: GlobeLoaderProps) {
  const radius = size * 0.35
  const center = size / 2

  // Generate particles positioned on a sphere surface
  const particles = useMemo(() => {
    const particleArray: Particle[] = []

    for (let i = 0; i < particleCount; i++) {
      // Use Fibonacci sphere distribution for even particle placement
      const y = 1 - (i / (particleCount - 1)) * 2
      const radiusAtY = Math.sqrt(1 - y * y)
      const theta = (i * 2.4) % (2 * Math.PI) // Golden angle approximation

      // Sphere coordinates
      const x = Math.cos(theta) * radiusAtY
      const z = Math.sin(theta) * radiusAtY

      // Convert to screen coordinates with perspective
      const screenX = center + x * radius
      const screenY = center + y * radius

      // Calculate scale and opacity based on z-depth for 3D effect
      const scale = 0.5 + (z + 1) * 0.25 // Scale from 0.5 to 1
      const opacity = 0.4 + (z + 1) * 0.3 // Opacity from 0.4 to 1

      // Random initial scattered position
      const initialX = center + (Math.random() - 0.5) * size * 1.5
      const initialY = center + (Math.random() - 0.5) * size * 1.5

      particleArray.push({
        id: i,
        x: screenX,
        y: screenY,
        z,
        initialX,
        initialY,
        scale,
        opacity,
      })
    }

    return particleArray
  }, [particleCount, size, radius, center])

  // Generate connections between nearby particles
  const connections = useMemo(() => {
    const connectionArray: Array<{ from: Particle; to: Particle; opacity: number }> = []
    const maxDistance = radius * 0.8

    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const p1 = particles[i]
        const p2 = particles[j]

        // Calculate 3D distance
        const dx = p1.x - center - (p2.x - center)
        const dy = p1.y - center - (p2.y - center)
        const dz = p1.z - p2.z
        const distance = Math.sqrt(dx * dx + dy * dy + dz * dz)

        if (distance < maxDistance) {
          // Connection opacity based on distance and z-depth
          const baseOpacity = 1 - distance / maxDistance
          const depthOpacity = (p1.opacity + p2.opacity) / 2
          const finalOpacity = baseOpacity * depthOpacity * 0.6

          connectionArray.push({
            from: p1,
            to: p2,
            opacity: finalOpacity,
          })
        }
      }
    }

    return connectionArray
  }, [particles, radius, center])

  return (
    <div className={`flex items-center justify-center ${className}`} role="status" aria-label="Loading">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="overflow-visible">
          {/* Define animations */}
          <defs>
            <style>
              {`
                .globe-container {
                  transform-origin: ${center}px ${center}px;
                  animation: globeRotate 8s linear infinite;
                }
                
                .particle {
                  transform-origin: center;
                  animation: particleConverge ${animationDuration}ms ease-out forwards,
                             particleFloat 4s ease-in-out infinite ${animationDuration}ms;
                }
                
                .connection {
                  animation: connectionFade ${animationDuration}ms ease-out forwards;
                }
                
                @keyframes globeRotate {
                  from { transform: rotateY(0deg) rotateX(10deg); }
                  to { transform: rotateY(360deg) rotateX(10deg); }
                }
                
                @keyframes particleConverge {
                  from {
                    opacity: 0.8;
                    transform: scale(0.3);
                  }
                  to {
                    opacity: 1;
                    transform: scale(1);
                  }
                }
                
                @keyframes particleFloat {
                  0%, 100% { transform: scale(1) translateY(0px); }
                  50% { transform: scale(1.1) translateY(-2px); }
                }
                
                @keyframes connectionFade {
                  from { opacity: 0; }
                  to { opacity: 1; }
                }
              `}
            </style>
          </defs>

          {/* Globe container for rotation */}
          <g className="globe-container">
            {/* Render connections first (behind particles) */}
            {connections.map((connection, index) => (
              <line
                key={`connection-${index}`}
                x1={connection.from.initialX}
                y1={connection.from.initialY}
                x2={connection.to.initialX}
                y2={connection.to.initialY}
                stroke={lineColor}
                strokeWidth="1"
                strokeOpacity={connection.opacity}
                className="connection"
                style={{
                  animationDelay: `${index * 20}ms`,
                }}
              >
                <animate
                  attributeName="x1"
                  values={`${connection.from.initialX};${connection.from.x}`}
                  dur={`${animationDuration}ms`}
                  fill="freeze"
                />
                <animate
                  attributeName="y1"
                  values={`${connection.from.initialY};${connection.from.y}`}
                  dur={`${animationDuration}ms`}
                  fill="freeze"
                />
                <animate
                  attributeName="x2"
                  values={`${connection.to.initialX};${connection.to.x}`}
                  dur={`${animationDuration}ms`}
                  fill="freeze"
                />
                <animate
                  attributeName="y2"
                  values={`${connection.to.initialY};${connection.to.y}`}
                  dur={`${animationDuration}ms`}
                  fill="freeze"
                />
              </line>
            ))}

            {/* Render particles */}
            {particles.map((particle, index) => (
              <circle
                key={`particle-${particle.id}`}
                cx={particle.initialX}
                cy={particle.initialY}
                r="3"
                fill={particleColor}
                opacity={particle.opacity}
                className="particle"
                style={{
                  animationDelay: `${index * 30}ms`,
                  transformOrigin: `${particle.x}px ${particle.y}px`,
                }}
              >
                <animate
                  attributeName="cx"
                  values={`${particle.initialX};${particle.x}`}
                  dur={`${animationDuration}ms`}
                  fill="freeze"
                />
                <animate
                  attributeName="cy"
                  values={`${particle.initialY};${particle.y}`}
                  dur={`${animationDuration}ms`}
                  fill="freeze"
                />
                <animate
                  attributeName="r"
                  values={`1;${2 + particle.scale}`}
                  dur={`${animationDuration}ms`}
                  fill="freeze"
                />
              </circle>
            ))}
          </g>

          {/* Central glow effect */}
          <circle cx={center} cy={center} r="8" fill={particleColor} opacity="0.1" className="animate-pulse" />
        </svg>
      </div>
    </div>
  )
}
