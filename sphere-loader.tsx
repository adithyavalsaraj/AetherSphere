"use client"

import { useState, useEffect, useRef, useMemo } from "react"

interface SphereLoaderProps {
  size?: number
  particleColor?: string
  lineColor?: string
  particleCount?: number
  animationDuration?: number
  enablePulsing?: boolean
  pulseIntensity?: number
  className?: string
}

interface Particle3D {
  id: number
  // 3D coordinates on sphere
  x3d: number
  y3d: number
  z3d: number
  // Current 2D projected position
  x2d: number
  y2d: number
  // Initial random position
  startX: number
  startY: number
  // Spherical coordinates for rotation
  theta: number
  phi: number
}

interface Connection {
  from: number
  to: number
}

export default function SphereLoader({
  size = 120,
  particleColor = "#06b6d4",
  lineColor = "#67e8f9",
  particleCount = 24,
  animationDuration = 1500,
  enablePulsing = false,
  pulseIntensity = 0.5,
  className = "",
}: SphereLoaderProps) {
  const [currentTime, setCurrentTime] = useState(0)
  const [isConverged, setIsConverged] = useState(false)
  const animationRef = useRef<number>()
  const startTimeRef = useRef<number>()

  const radius = size * 0.35
  const centerX = size / 2
  const centerY = size / 2

  // Generate initial particles with spherical distribution
  const initialParticles = useMemo(() => {
    const particles: Particle3D[] = []

    for (let i = 0; i < particleCount; i++) {
      // Fibonacci sphere distribution for even spacing
      const y = 1 - (i / (particleCount - 1)) * 2 // y goes from 1 to -1
      const radiusAtY = Math.sqrt(1 - y * y)
      const theta = (i * 2.39996322972865332) % (2 * Math.PI) // Golden angle

      // Spherical coordinates
      const phi = Math.acos(y)

      // Convert to 3D Cartesian coordinates
      const x3d = radiusAtY * Math.cos(theta)
      const z3d = radiusAtY * Math.sin(theta)
      const y3d = y

      // Project to 2D (orthographic projection)
      const x2d = centerX + x3d * radius
      const y2d = centerY + y3d * radius

      // Random starting position
      const startX = centerX + (Math.random() - 0.5) * size * 1.5
      const startY = centerY + (Math.random() - 0.5) * size * 1.5

      particles.push({
        id: i,
        x3d,
        y3d,
        z3d,
        x2d,
        y2d,
        startX,
        startY,
        theta,
        phi,
      })
    }

    return particles
  }, [particleCount, size, radius, centerX, centerY])

  // Calculate nearest neighbor connections
  const connections = useMemo(() => {
    const conns: Connection[] = []
    const maxConnections = 4

    initialParticles.forEach((particle, i) => {
      // Calculate distances to all other particles
      const distances = initialParticles
        .map((other, j) => ({
          index: j,
          distance: Math.sqrt(
            Math.pow(particle.x3d - other.x3d, 2) +
              Math.pow(particle.y3d - other.y3d, 2) +
              Math.pow(particle.z3d - other.z3d, 2),
          ),
        }))
        .filter((_, j) => j !== i)
        .sort((a, b) => a.distance - b.distance)
        .slice(0, maxConnections)

      // Add connections to nearest neighbors
      distances.forEach(({ index }) => {
        // Avoid duplicate connections
        const exists = conns.some(
          (conn) => (conn.from === i && conn.to === index) || (conn.from === index && conn.to === i),
        )
        if (!exists) {
          conns.push({ from: i, to: index })
        }
      })
    })

    return conns
  }, [initialParticles])

  // Calculate current particle positions
  const currentParticles = useMemo(() => {
    return initialParticles.map((particle) => {
      let x2d: number
      let y2d: number

      if (currentTime < animationDuration) {
        // Convergence phase: interpolate from start to sphere position
        const progress = currentTime / animationDuration
        const easeProgress = 1 - Math.pow(1 - progress, 3) // Ease out cubic

        x2d = particle.startX + (particle.x2d - particle.startX) * easeProgress
        y2d = particle.startY + (particle.y2d - particle.startY) * easeProgress
      } else {
        // Rotation phase: rotate the sphere and re-project
        const rotationTime = (currentTime - animationDuration) / 1000 // Convert to seconds
        const rotationSpeed = 0.5 // Radians per second

        // Rotate around Y-axis
        const rotatedTheta = particle.theta + rotationTime * rotationSpeed

        // Convert back to 3D coordinates with rotation
        const radiusAtY = Math.sqrt(1 - particle.y3d * particle.y3d)
        const x3d = radiusAtY * Math.cos(rotatedTheta)
        const z3d = radiusAtY * Math.sin(rotatedTheta)

        // Project to 2D with slight perspective (particles further back are slightly smaller/dimmer)
        const perspectiveFactor = 0.8 + (0.2 * (z3d + 1)) / 2 // Scale based on z-depth
        x2d = centerX + x3d * radius * perspectiveFactor
        y2d = centerY + particle.y3d * radius * perspectiveFactor
      }

      return {
        ...particle,
        x2d,
        y2d,
      }
    })
  }, [initialParticles, currentTime, animationDuration, centerX, centerY, radius])

  // Animation loop
  useEffect(() => {
    const animate = (timestamp: number) => {
      if (!startTimeRef.current) {
        startTimeRef.current = timestamp
      }

      const elapsed = timestamp - startTimeRef.current
      setCurrentTime(elapsed)

      if (elapsed >= animationDuration && !isConverged) {
        setIsConverged(true)
      }

      animationRef.current = requestAnimationFrame(animate)
    }

    animationRef.current = requestAnimationFrame(animate)

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [animationDuration, isConverged])

  // Calculate particle opacity and size based on z-depth during rotation and pulsing
  const getParticleProps = (particle: Particle3D, index: number) => {
    if (currentTime < animationDuration) {
      // During convergence, fade in
      const progress = currentTime / animationDuration
      return {
        opacity: 0.3 + 0.7 * progress,
        radius: 1.5 + 1.5 * progress,
      }
    } else {
      // During rotation, vary based on z-depth and add pulsing
      const rotationTime = (currentTime - animationDuration) / 1000
      const rotationSpeed = 0.5
      const rotatedTheta = particle.theta + rotationTime * rotationSpeed
      const radiusAtY = Math.sqrt(1 - particle.y3d * particle.y3d)
      const z3d = radiusAtY * Math.sin(rotatedTheta)

      const depthFactor = 0.6 + (0.4 * (z3d + 1)) / 2 // 0.6 to 1.0 based on z-depth

      let finalRadius = 2 + depthFactor
      let finalOpacity = depthFactor

      // Add pulsing effect if enabled
      if (enablePulsing) {
        // Create wave effect based on particle's angular position and rotation
        const pulsePhase = rotatedTheta + particle.phi * 2 // Combine theta and phi for complex patterns
        const pulseFrequency = 2 // How many pulse waves around the sphere
        const pulseSpeed = 1.5 // Speed of the pulsing animation

        // Calculate pulse value using sine wave
        const pulseValue = Math.sin(pulsePhase * pulseFrequency + rotationTime * pulseSpeed * Math.PI * 2)
        const normalizedPulse = (pulseValue + 1) / 2 // Normalize to 0-1

        // Apply pulsing to radius and opacity
        const pulseMultiplier = 1 + normalizedPulse * pulseIntensity
        finalRadius *= pulseMultiplier

        // Subtle opacity pulsing
        const opacityPulse = 1 + normalizedPulse * pulseIntensity * 0.3
        finalOpacity = Math.min(finalOpacity * opacityPulse, 1)

        // Add extra glow effect for particles at pulse peaks
        if (normalizedPulse > 0.8) {
          finalOpacity = Math.min(finalOpacity * 1.2, 1)
        }
      }

      return {
        opacity: finalOpacity,
        radius: finalRadius,
      }
    }
  }

  // Calculate line opacity based on particle depths and pulsing
  const getLineOpacity = (fromParticle: Particle3D, toParticle: Particle3D) => {
    if (currentTime < animationDuration) {
      const progress = currentTime / animationDuration
      return 0.1 + 0.4 * progress
    } else {
      const rotationTime = (currentTime - animationDuration) / 1000
      const rotationSpeed = 0.5

      // Calculate z-depths for both particles
      const getZ = (p: Particle3D) => {
        const rotatedTheta = p.theta + rotationTime * rotationSpeed
        const radiusAtY = Math.sqrt(1 - p.y3d * p.y3d)
        return radiusAtY * Math.sin(rotatedTheta)
      }

      const z1 = getZ(fromParticle)
      const z2 = getZ(toParticle)
      const avgDepth = (z1 + z2) / 2

      let baseOpacity = 0.2 + (0.3 * (avgDepth + 1)) / 2

      // Add pulsing effect to lines if enabled
      if (enablePulsing) {
        const rotatedTheta1 = fromParticle.theta + rotationTime * rotationSpeed
        const rotatedTheta2 = toParticle.theta + rotationTime * rotationSpeed
        const avgTheta = (rotatedTheta1 + rotatedTheta2) / 2
        const avgPhi = (fromParticle.phi + toParticle.phi) / 2

        const pulsePhase = avgTheta + avgPhi * 2
        const pulseValue = Math.sin(pulsePhase * 2 + rotationTime * 1.5 * Math.PI * 2)
        const normalizedPulse = (pulseValue + 1) / 2

        const pulseMultiplier = 1 + normalizedPulse * pulseIntensity * 0.4
        baseOpacity *= pulseMultiplier
      }

      return Math.min(baseOpacity, 0.8)
    }
  }

  return (
    <div className={`flex items-center justify-center ${className}`} role="status" aria-label="Loading">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Render connections */}
        {connections.map((connection, index) => {
          const fromParticle = currentParticles[connection.from]
          const toParticle = currentParticles[connection.to]

          return (
            <line
              key={`connection-${index}`}
              x1={fromParticle.x2d}
              y1={fromParticle.y2d}
              x2={toParticle.x2d}
              y2={toParticle.y2d}
              stroke={lineColor}
              strokeWidth="1"
              opacity={getLineOpacity(fromParticle, toParticle)}
            />
          )
        })}

        {/* Render particles */}
        {currentParticles.map((particle, index) => {
          const props = getParticleProps(particle, index)

          return (
            <circle
              key={`particle-${particle.id}`}
              cx={particle.x2d}
              cy={particle.y2d}
              r={props.radius}
              fill={particleColor}
              opacity={props.opacity}
            />
          )
        })}

        {/* Central glow effect */}
        <circle
          cx={centerX}
          cy={centerY}
          r="6"
          fill={particleColor}
          opacity={isConverged ? "0.1" : "0.05"}
          className="transition-opacity duration-1000"
        />
      </svg>
    </div>
  )
}
