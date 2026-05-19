# 📐 AetherSphere Studio: Mathematics & Engineering Architecture

This document details the underlying math, physics simulations, and performance optimizations that power the 3D SVG particle engine in **AetherSphere Studio**.

---

## 1. Mathematical Core: Fibonacci Sphere Distribution

To place $N$ particles evenly over the surface of a 3D sphere, we use the **Fibonacci Spiral Grid** (also known as a Fibonacci Sphere). This is an approximation of the golden ratio distribution, which prevents the crowding of nodes at the poles (a common issue in standard longitude/latitude mapping).

For each index $i$ in a set of $N$ particles (where $i \in [0, N-1]$):

1. **Calculate the Vertical Elevation ($y$)**:
   We map the index linearly to the height of the sphere from $1$ (top pole) to $-1$ (bottom pole):
   $$y_i = 1 - \left( \frac{i}{N - 1} \right) \times 2$$

2. **Calculate the Horizontal Radius at $y$**:
   Using the Pythagorean identity ($x^2 + y^2 + z^2 = 1$), the radius of the circular slice of the sphere at height $y_i$ is:
   $$R_i = \sqrt{1 - y_i^2}$$

3. **Calculate the Longitude Angle ($\theta$)**:
   Each consecutive particle is rotated by the **golden angle** (approximately $137.508^\circ$ or $2.399963$ radians) to guarantee uniform distribution:
   $$\theta_i = (i \times 2.3999632297) \pmod{2\pi}$$

4. **3D Cartesian Coordinates**:
   Using spherical-to-Cartesian conversion, the base coordinates on a 3D unit sphere are:
   $$x_{3d} = R_i \cos(\theta_i)$$
   $$y_{3d} = y_i$$
   $$z_{3d} = R_i \sin(\theta_i)$$

---

## 2. 3D Rotation Engine (Euler Rotations)

The sphere's rotation is simulated by multiplying the particle's spherical coordinates by 3D rotation matrices. 

Let the base coordinates be $(x_1, y_1, z_1)$. We track two active rotation variables:
- $\theta_{\text{total}}$: The sum of automatic constant time spin and manual Y-axis drag.
- $\phi_{\text{drag}}$: The manual X-axis drag offset.

### Step 1: Rotate around the Y-axis (Yaw)
We apply a rotation of $\theta_{\text{total}}$ around the vertical axis. This shifts the coordinates from $(x_{3d}, y_{3d}, z_{3d})$ to $(x_1, y_1, z_1)$:
$$x_1 = R_i \cos(\theta_{\text{total}})$$
$$z_1 = R_i \sin(\theta_{\text{total}})$$
$$y_1 = y_{3d}$$

### Step 2: Rotate around the X-axis (Pitch)
To handle vertical grab dragging, we apply a second rotation matrix of $\phi_{\text{drag}}$ around the horizontal axis, transforming $(x_1, y_1, z_1)$ to the final rotated coordinates $(x_2, y_2, z_2)$:
$$x_2 = x_1$$
$$y_2 = y_1 \cos(\phi_{\text{drag}}) - z_1 \sin(\phi_{\text{drag}})$$
$$z_2 = y_1 \sin(\phi_{\text{drag}}) + z_1 \cos(\phi_{\text{drag}})$$

This two-stage rotation supports drag movements in any direction, spinning the sphere organically.

---

## 3. Depth Cueing & Perspective Projection

Instead of a flat orthographic projection, AetherSphere implements depth cueing (visual perspective) to simulate a 3D camera:

1. **Perspective Sizing Factor**:
   We compute a perspective multiplier based on the $z_2$ coordinate (depth). Particles at the front ($z_2 = 1$) scale up, while particles at the back ($z_2 = -1$) scale down:
   $$\text{Perspective Factor} = 0.8 + 0.2 \times \left( \frac{z_2 + 1}{2} \right)$$
   This maps the camera field of view linearly, yielding a multiplier between $0.8$ (deep back) and $1.0$ (immediate front).

2. **2D Screen Projection**:
   The final projected coordinates $(X_{2d}, Y_{2d})$ inside the SVG container of size $S$ (center coordinate $C = S/2$) and sphere radius $r$ are:
   $$X_{2d} = C + x_2 \times r \times \text{Perspective Factor}$$
   $$Y_{2d} = C + y_2 \times r \times \text{Perspective Factor}$$

3. **Opacity Scaling**:
   Particle and vector line opacities are scaled dynamically by depth. Line opacity is derived from the average depth of its two connected nodes, creating a seamless translucent occlusion effect where rear connections appear hidden or faint.

---

## 4. Pointer Physics Distortions (Gravity Fields)

When the mouse moves inside the SVG canvas, a 2D proximity force vector is computed between each projected particle coordinate $(X_{2d}, Y_{2d})$ and the cursor coordinate $(M_x, M_y)$:

$$\Delta_x = X_{2d} - M_x, \quad \Delta_y = Y_{2d} - M_y$$
$$D = \sqrt{\Delta_x^2 + \Delta_y^2}$$

If the distance $D$ is less than the influence radius $R_{\text{limit}}$ (scaled as $35\%$ of the sphere diameter), we apply a force $F$ that decays linearly as it reaches the boundary:

$$F = \left(1 - \frac{D}{R_{\text{limit}}}\right) \times \text{strength}$$

### Gravity Field Styles:
- **Repulsion Mode**: Particles are pushed directly away from the cursor along the radial vector:
  $$X_{2d} \leftarrow X_{2d} + \left(\frac{\Delta_x}{D}\right) F$$
  $$Y_{2d} \leftarrow Y_{2d} + \left(\frac{\Delta_y}{D}\right) F$$

- **Attraction Mode (Black Hole)**: Particles are sucked directly towards the cursor coordinate:
  $$X_{2d} \leftarrow X_{2d} - \left(\frac{\Delta_x}{D}\right) F$$
  $$Y_{2d} \leftarrow Y_{2d} - \left(\frac{\Delta_y}{D}\right) F$$

- **Swirling Orbit Mode**: Particles are shifted tangentially to orbit the pointer:
  $$X_{2d} \leftarrow X_{2d} + \left(-\frac{\Delta_y}{D}\right) F \times 1.2$$
  $$Y_{2d} \leftarrow Y_{2d} + \left(\frac{\Delta_x}{D}\right) F \times 1.2$$

---

## 5. High-Performance Engineering Architecture

To keep the 3D calculations at a locked **60 FPS** without dropping frames, AetherSphere uses several optimization techniques:

1. **Ref-Based Interaction Loops**:
   Standard React state updates trigger expensive reconciliation and DOM updates. Since dragging and cursor moves fire hundreds of times per second, state updates would cause severe layout thrashing and lag.
   - **Solution**: We store cursor positions ($M_x, M_y$), dragging offsets ($\theta_{\text{drag}}, \phi_{\text{drag}}$), and target targets inside React **`useRef`** bounds.
   - **Result**: Mouse movements mutate refs instantly in memory with zero React render triggers.

2. **Single requestAnimationFrame Loop**:
   A single high-performance animation thread continuously runs. On every frame, it:
   - Updates the absolute rendering time.
   - Smoothly interpolates the active dragging offsets towards their target values using linear interpolation (lerp) for physics-based inertia:
     $$\theta_{\text{actual}} \leftarrow \theta_{\text{actual}} + (\theta_{\text{target}} - \theta_{\text{actual}}) \times \alpha$$
   - Re-evaluates particle positions inside a high-speed map.
   - Forces a single atomic screen update by changing the `currentTime` state, triggering one smooth, optimized canvas redraw.
