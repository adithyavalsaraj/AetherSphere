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
  interactive?: boolean
  enableGravity?: boolean
  enableClickBurst?: boolean
  rotationSpeed?: number
  autoRotate?: boolean
  // High fidelity features!
  gravityMode?: "repel" | "attract" | "swirl"
  particleShape?: "dots" | "crosshairs" | "squares" | "rings"
  explosionStyle?: "supernova" | "singularity" | "vortex"
  chromaCycle?: boolean
  enableGlow?: boolean
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
  size = 450, // Updated default diameter for large screens
  particleColor = "#06b6d4",
  lineColor = "#67e8f9",
  particleCount = 64,
  animationDuration = 1500,
  enablePulsing = true,
  pulseIntensity = 0.5,
  className = "",
  interactive = true,
  enableGravity = true,
  enableClickBurst = true,
  rotationSpeed = 0.4,
  autoRotate = true,
  gravityMode = "repel",
  particleShape = "dots",
  explosionStyle = "supernova",
  chromaCycle = false,
  enableGlow = true,
}: SphereLoaderProps) {
  const [currentTime, setCurrentTime] = useState(0)
  const [isConverged, setIsConverged] = useState(false)
  const [explosionProgress, setExplosionProgress] = useState(0)
  const animationRef = useRef<number | undefined>(undefined)
  const startTimeRef = useRef<number | undefined>(undefined)

  // Interactive interaction states
  const isDraggingRef = useRef(false)
  const previousMousePositionRef = useRef({ x: 0, y: 0 })
  const dragThetaRef = useRef(0)
  const dragPhiRef = useRef(0)
  const targetDragThetaRef = useRef(0)
  const targetDragPhiRef = useRef(0)
  const mousePosRef = useRef<{ x: number; y: number } | null>(null)
  const explosionRef = useRef<{ active: boolean; startTime: number }>({ active: false, startTime: 0 })

  const radius = size * 0.35
  const centerX = size / 2
  const centerY = size / 2

  // Color generator for chroma cycling
  const activeParticleColor = useMemo(() => {
    if (!chromaCycle) return particleColor
    const speed = 0.0003
    const hue = (currentTime * speed * 1000) % 360
    return `hsl(${hue}, 85%, 60%)`
  }, [chromaCycle, particleColor, currentTime])

  const activeLineColor = useMemo(() => {
    if (!chromaCycle) return lineColor
    const speed = 0.0003
    const hue = (currentTime * speed * 1000) % 360
    return `hsla(${hue}, 80%, 65%, 0.45)`
  }, [chromaCycle, lineColor, currentTime])

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

      // Deterministic pseudo-random starting positions to prevent SSR hydration mismatch
      const pseudoRandom = (seed: number) => {
        const x = Math.sin(seed) * 10000
        return x - Math.floor(x)
      }
      const randomValX = pseudoRandom(i * 12.9898 + 4.321)
      const randomValY = pseudoRandom(i * 78.233 + 7.654)

      const startX = centerX + (randomValX - 0.5) * size * 1.5
      const startY = centerY + (randomValY - 0.5) * size * 1.5

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

  // Get current Z depth for perspective rendering during rotation and drag
  const getZ = (p: Particle3D) => {
    const rotationTime = (currentTime - animationDuration) / 1000
    const currentRotationSpeed = rotationSpeed
    
    // Vortex twist angles during explosion style "vortex"
    let twistAngle = 0
    if (explosionStyle === "vortex" && explosionProgress > 0) {
      twistAngle = explosionProgress * 3.5 * (1 - Math.sqrt(p.x3d * p.x3d + p.y3d * p.y3d))
    }

    const baseTheta = p.theta + (autoRotate ? rotationTime * currentRotationSpeed : 0) + twistAngle
    const totalTheta = baseTheta + dragThetaRef.current
    
    const radiusAtY = Math.sqrt(1 - p.y3d * p.y3d)
    const x1 = radiusAtY * Math.cos(totalTheta)
    const z1 = radiusAtY * Math.sin(totalTheta)
    const y1 = p.y3d

    // Rotate around X-axis for vertical drag
    const z2 = y1 * Math.sin(dragPhiRef.current) + z1 * Math.cos(dragPhiRef.current)
    return z2
  }

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
        const currentRotationSpeed = rotationSpeed // Radians per second

        // Vortex twist angles during explosion style "vortex"
        let twistAngle = 0
        if (explosionStyle === "vortex" && explosionProgress > 0) {
          // Twist outer particles more than inner particles
          const radiusAtY = Math.sqrt(1 - particle.y3d * particle.y3d)
          twistAngle = explosionProgress * 3.5 * (1 - radiusAtY)
        }

        const baseTheta = particle.theta + (autoRotate ? rotationTime * currentRotationSpeed : 0) + twistAngle
        const totalTheta = baseTheta + dragThetaRef.current

        // Convert back to 3D Cartesian coordinates with full 3D rotation
        // 1. Rotate around Y axis
        const radiusAtY = Math.sqrt(1 - particle.y3d * particle.y3d)
        const x1 = radiusAtY * Math.cos(totalTheta)
        const z1 = radiusAtY * Math.sin(totalTheta)
        const y1 = particle.y3d

        // 2. Rotate around X axis
        const x2 = x1
        const y2 = y1 * Math.cos(dragPhiRef.current) - z1 * Math.sin(dragPhiRef.current)
        const z2 = y1 * Math.sin(dragPhiRef.current) + z1 * Math.cos(dragPhiRef.current)

        // Project to 2D with slight perspective (particles further back are slightly smaller/dimmer)
        const perspectiveFactor = 0.8 + (0.2 * (z2 + 1)) / 2

        // Explosion/Burst offset styles
        let explosionOffset = 1
        let pertubX = 0
        let pertubY = 0

        if (explosionStyle === "supernova") {
          explosionOffset = 1 + explosionProgress * 1.5
          pertubX = Math.sin(particle.id * 45.3) * 0.1 * explosionProgress
          pertubY = Math.cos(particle.id * 32.7) * 0.1 * explosionProgress
        } else if (explosionStyle === "singularity") {
          // Inward black hole collapse
          explosionOffset = 1 - explosionProgress * 0.92
        } else if (explosionStyle === "vortex") {
          // Expands subtly but spins heavily (twist is handled in theta)
          explosionOffset = 1 + explosionProgress * 0.4
        }

        x2d = centerX + (x2 + pertubX) * radius * perspectiveFactor * explosionOffset
        y2d = centerY + (y2 + pertubY) * radius * perspectiveFactor * explosionOffset
      }

      // Mouse hover physics distortion based on selected gravity mode
      if (interactive && enableGravity && mousePosRef.current && currentTime >= animationDuration) {
        const dx = x2d - mousePosRef.current.x
        const dy = y2d - mousePosRef.current.y
        const distance = Math.sqrt(dx * dx + dy * dy)
        const maxEffectDistance = size * 0.35 // Scope interaction boundary with sphere size

        if (distance < maxEffectDistance && distance > 0) {
          const strength = size * 0.14
          const force = (1 - distance / maxEffectDistance) * strength

          if (gravityMode === "repel") {
            // Push away
            x2d += (dx / distance) * force
            y2d += (dy / distance) * force
          } else if (gravityMode === "attract") {
            // Pull in towards cursor
            x2d -= (dx / distance) * force
            y2d -= (dy / distance) * force
          } else if (gravityMode === "swirl") {
            // Swirl tangentially around the cursor
            const tangentX = -dy / distance
            const tangentY = dx / distance
            x2d += tangentX * force * 1.2
            y2d += tangentY * force * 1.2
          }
        }
      }

      return {
        ...particle,
        x2d,
        y2d,
      }
    })
  }, [
    initialParticles, 
    currentTime, 
    animationDuration, 
    centerX, 
    centerY, 
    radius, 
    explosionProgress, 
    explosionStyle, 
    interactive, 
    enableGravity, 
    size, 
    rotationSpeed, 
    autoRotate, 
    gravityMode
  ])

  // Animation loop
  useEffect(() => {
    const animate = (timestamp: number) => {
      if (!startTimeRef.current) {
        startTimeRef.current = timestamp
      }

      const elapsed = timestamp - startTimeRef.current
      setCurrentTime(elapsed)

      // Handle explosion/burst animation inside the loop
      if (explosionRef.current.active) {
        const explosionElapsed = timestamp - explosionRef.current.startTime
        const duration = 1200 // Extended explosion to show gorgeous vortex/decay
        if (explosionElapsed >= duration) {
          explosionRef.current.active = false
          setExplosionProgress(0)
        } else {
          // Progress goes 0 -> 1 -> 0
          const progress = explosionElapsed / duration
          // Standard ease out-in curve
          setExplosionProgress(Math.sin(progress * Math.PI))
        }
      }

      // Smooth drag inertia
      if (!isDraggingRef.current) {
        dragThetaRef.current += (targetDragThetaRef.current - dragThetaRef.current) * 0.1
        dragPhiRef.current += (targetDragPhiRef.current - dragPhiRef.current) * 0.1
      } else {
        dragThetaRef.current += (targetDragThetaRef.current - dragThetaRef.current) * 0.3
        dragPhiRef.current += (targetDragPhiRef.current - dragPhiRef.current) * 0.3
      }

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
  const getParticleProps = (particle: Particle3D) => {
    if (currentTime < animationDuration) {
      // During convergence, fade in
      const progress = currentTime / animationDuration
      return {
        opacity: 0.3 + 0.7 * progress,
        radius: 1.5 + 1.5 * progress,
      }
    } else {
      const z3d = getZ(particle)
      const depthFactor = 0.6 + (0.4 * (z3d + 1)) / 2 // 0.6 to 1.0 based on z-depth

      let finalRadius = 2.5 + depthFactor * 2.0 // Slightly chunkier nodes on large screens
      let finalOpacity = depthFactor

      // Scale modifications during explosion
      if (explosionProgress > 0) {
        if (explosionStyle === "supernova") {
          finalRadius *= (1 + explosionProgress * 0.4)
          finalOpacity = Math.min(finalOpacity + explosionProgress * 0.3, 1)
        } else if (explosionStyle === "singularity") {
          // Shrinks and compacts during implosion
          finalRadius *= (1 - explosionProgress * 0.5)
          finalOpacity = Math.max(finalOpacity * (1 - explosionProgress * 0.4), 0.2)
        }
      }

      // Add pulsing effect if enabled
      if (enablePulsing) {
        const rotationTime = (currentTime - animationDuration) / 1000
        const baseTheta = particle.theta + (autoRotate ? rotationTime * rotationSpeed : 0)
        const rotatedTheta = baseTheta + dragThetaRef.current
        
        const pulsePhase = rotatedTheta + particle.phi * 2
        const pulseFrequency = 2
        const pulseSpeed = 1.5

        const pulseValue = Math.sin(pulsePhase * pulseFrequency + rotationTime * pulseSpeed * Math.PI * 2)
        const normalizedPulse = (pulseValue + 1) / 2

        const pulseMultiplier = 1 + normalizedPulse * pulseIntensity
        finalRadius *= pulseMultiplier

        const opacityPulse = 1 + normalizedPulse * pulseIntensity * 0.3
        finalOpacity = Math.min(finalOpacity * opacityPulse, 1)

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
      const z1 = getZ(fromParticle)
      const z2 = getZ(toParticle)
      const avgDepth = (z1 + z2) / 2

      let baseOpacity = 0.25 + (0.35 * (avgDepth + 1)) / 2

      // Fade out lines slightly during explosion to look like scattered particles
      if (explosionProgress > 0) {
        if (explosionStyle === "supernova") {
          baseOpacity *= (1 - explosionProgress * 0.8)
        } else if (explosionStyle === "singularity") {
          baseOpacity *= (1 + explosionProgress * 0.6) // lines become brighter as it compacts
        }
      }

      // Add pulsing effect to lines if enabled
      if (enablePulsing) {
        const rotationTime = (currentTime - animationDuration) / 1000
        const baseTheta1 = fromParticle.theta + (autoRotate ? rotationTime * rotationSpeed : 0)
        const baseTheta2 = toParticle.theta + (autoRotate ? rotationTime * rotationSpeed : 0)
        const rotatedTheta1 = baseTheta1 + dragThetaRef.current
        const rotatedTheta2 = baseTheta2 + dragThetaRef.current
        
        const avgTheta = (rotatedTheta1 + rotatedTheta2) / 2
        const avgPhi = (fromParticle.phi + toParticle.phi) / 2

        const pulsePhase = avgTheta + avgPhi * 2
        const pulseValue = Math.sin(pulsePhase * 2 + rotationTime * 1.5 * Math.PI * 2)
        const normalizedPulse = (pulseValue + 1) / 2

        const pulseMultiplier = 1 + normalizedPulse * pulseIntensity * 0.4
        baseOpacity *= pulseMultiplier
      }

      return Math.min(baseOpacity, 0.85)
    }
  }

  // Pointer event listeners to allow dynamic 3D drag rotation
  const handlePointerDown = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!interactive) return
    isDraggingRef.current = true
    previousMousePositionRef.current = { x: e.clientX, y: e.clientY }
    e.currentTarget.setPointerCapture(e.pointerId)
  }

  const handlePointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    mousePosRef.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    }

    if (!interactive || !isDraggingRef.current) return

    const deltaX = e.clientX - previousMousePositionRef.current.x
    const deltaY = e.clientY - previousMousePositionRef.current.y

    const sensitivity = 0.007
    targetDragThetaRef.current += deltaX * sensitivity
    targetDragPhiRef.current -= deltaY * sensitivity

    previousMousePositionRef.current = { x: e.clientX, y: e.clientY }
  }

  const handlePointerUp = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!interactive) return
    isDraggingRef.current = false
    e.currentTarget.releasePointerCapture(e.pointerId)
  }

  const handlePointerLeave = () => {
    mousePosRef.current = null
  }

  const handleClick = () => {
    if (!enableClickBurst || explosionRef.current.active || currentTime < animationDuration) return
    explosionRef.current = {
      active: true,
      startTime: performance.now(),
    }
  }

  return (
    <div className={`flex items-center justify-center ${className}`} role="status" aria-label="Loading">
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerLeave}
        onClick={handleClick}
        style={{
          cursor: interactive ? (isDraggingRef.current ? "grabbing" : "grab") : "default",
          touchAction: "none",
        }}
        className="overflow-visible"
      >
        {/* Glow Filters for high-fidelity plasma effect */}
        <defs>
          <filter id="vector-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="node-glow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="1.8" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Render connections */}
        <g filter={enableGlow ? "url(#vector-glow)" : undefined}>
          {connections.map((connection, index) => {
            const fromParticle = currentParticles[connection.from]
            const toParticle = currentParticles[connection.to]

            if (!fromParticle || !toParticle) return null

            return (
              <line
                key={`connection-${index}`}
                x1={fromParticle.x2d}
                y1={fromParticle.y2d}
                x2={toParticle.x2d}
                y2={toParticle.y2d}
                stroke={activeLineColor}
                strokeWidth={size > 400 ? "1.2" : "1.0"}
                opacity={getLineOpacity(fromParticle, toParticle)}
              />
            )
          })}
        </g>

        {/* Render particles */}
        <g filter={enableGlow ? "url(#node-glow)" : undefined}>
          {currentParticles.map((particle) => {
            const props = getParticleProps(particle)
            const cx = particle.x2d
            const cy = particle.y2d
            const r = props.radius

            if (particleShape === "dots") {
              return (
                <circle
                  key={`particle-${particle.id}`}
                  cx={cx}
                  cy={cy}
                  r={r}
                  fill={activeParticleColor}
                  opacity={props.opacity}
                  className="transition-transform duration-300"
                />
              )
            } else if (particleShape === "squares") {
              return (
                <rect
                  key={`particle-${particle.id}`}
                  x={cx - r}
                  y={cy - r}
                  width={r * 2}
                  height={r * 2}
                  rx="1"
                  fill={activeParticleColor}
                  opacity={props.opacity}
                  className="transition-transform duration-300"
                />
              )
            } else if (particleShape === "rings") {
              return (
                <circle
                  key={`particle-${particle.id}`}
                  cx={cx}
                  cy={cy}
                  r={r * 1.1}
                  fill="none"
                  stroke={activeParticleColor}
                  strokeWidth="1.5"
                  opacity={props.opacity}
                  className="transition-transform duration-300"
                />
              )
            } else if (particleShape === "crosshairs") {
              return (
                <g key={`particle-${particle.id}`} opacity={props.opacity}>
                  <line
                    x1={cx - r * 1.3}
                    y1={cy}
                    x2={cx + r * 1.3}
                    y2={cy}
                    stroke={activeParticleColor}
                    strokeWidth="1.2"
                  />
                  <line
                    x1={cx}
                    y1={cy - r * 1.3}
                    x2={cx}
                    y2={cy + r * 1.3}
                    stroke={activeParticleColor}
                    strokeWidth="1.2"
                  />
                </g>
              )
            }
            return null
          })}
        </g>

        {/* Central glow core */}
        <circle
          cx={centerX}
          cy={centerY}
          r={isConverged ? "8" : "5"}
          fill={activeParticleColor}
          opacity={isConverged ? "0.2" : "0.05"}
          className="transition-all duration-1000"
        />
      </svg>
    </div>
  )
}
