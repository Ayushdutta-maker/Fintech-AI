import React, { useEffect, useRef } from 'react';
import { useTheme } from '../lib/ThemeContext';

interface GridPoint {
  col: number;
  row: number;
  baseX: number;
  baseZ: number;
  currentY: number;
  projX: number;
  projY: number;
  scale: number;
  depthAlpha: number;
}

interface AmbientParticle {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  size: number;
  baseAlpha: number;
  color: string;
}

interface FloatingPolyhedron {
  x: number;
  y: number;
  z: number;
  rotX: number;
  rotY: number;
  rotZ: number;
  rotSpeedX: number;
  rotSpeedY: number;
  rotSpeedZ: number;
  size: number;
  vertices: { x: number; y: number; z: number }[];
  edges: [number, number][];
}

export const Canvas3DBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { theme } = useTheme();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Mouse tracking with smooth spring inertia
    let mouseX = width / 2;
    let mouseY = height / 2;
    let targetMouseX = width / 2;
    let targetMouseY = height / 2;
    let rotX = 0;
    let rotY = 0;
    let targetRotX = 0;
    let targetRotY = 0;

    const handlePointerMove = (clientX: number, clientY: number) => {
      targetMouseX = clientX;
      targetMouseY = clientY;
      const normalizedX = (clientX - width / 2) / (width / 2);
      const normalizedY = (clientY - height / 2) / (height / 2);
      targetRotY = normalizedX * 0.35;
      targetRotX = -normalizedY * 0.25;
    };

    const onMouseMove = (e: MouseEvent) => handlePointerMove(e.clientX, e.clientY);
    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        handlePointerMove(e.touches[0].clientX, e.touches[0].clientY);
      }
    };

    const handleResize = () => {
      if (!canvas) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.scale(dpr, dpr);
    };

    handleResize();
    window.addEventListener('mousemove', onMouseMove, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('resize', handleResize);

    const isDark = theme === 'dark';

    // 1. Configure 3D Topographic Mesh (Financial Horizon Grid)
    const isMobile = width < 768;
    const cols = isMobile ? 22 : 36;
    const rows = isMobile ? 18 : 26;
    const gridSpacingX = isMobile ? 70 : 85;
    const gridSpacingZ = isMobile ? 70 : 80;
    const gridOriginX = -((cols - 1) * gridSpacingX) / 2;
    const gridOriginZ = -200;

    const gridPoints: GridPoint[] = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        gridPoints.push({
          col: c,
          row: r,
          baseX: gridOriginX + c * gridSpacingX,
          baseZ: gridOriginZ + r * gridSpacingZ,
          currentY: 0,
          projX: 0,
          projY: 0,
          scale: 0,
          depthAlpha: 0,
        });
      }
    }

    // 2. Configure Ambient Floating 3D Micro-Particles
    const particleCount = isMobile ? 30 : 65;
    const particles: AmbientParticle[] = [];
    const spreadX = width * 1.2;
    const spreadY = height * 1.1;
    const spreadZ = 1200;

    const particleColors = isDark
      ? ['#10B981', '#34D399', '#6EE7B7', '#059669', '#38BDF8']
      : ['#059669', '#047857', '#10B981', '#0284C7', '#34D399'];

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: (Math.random() - 0.5) * spreadX,
        y: (Math.random() - 0.5) * spreadY,
        z: Math.random() * spreadZ - 200,
        vx: (Math.random() - 0.5) * 0.4,
        vy: -0.2 - Math.random() * 0.5, // Slow float upwards
        vz: (Math.random() - 0.5) * 0.4,
        size: Math.random() * 2.2 + 0.8,
        baseAlpha: Math.random() * 0.6 + 0.2,
        color: particleColors[Math.floor(Math.random() * particleColors.length)],
      });
    }

    // 3. Configure Floating 3D Polyhedra (Wireframe Crystal & Octahedron)
    const createOctahedron = (size: number) => {
      const vertices = [
        { x: 0, y: -size, z: 0 },
        { x: size, y: 0, z: 0 },
        { x: 0, y: 0, z: size },
        { x: -size, y: 0, z: 0 },
        { x: 0, y: 0, z: -size },
        { x: 0, y: size, z: 0 },
      ];
      const edges: [number, number][] = [
        [0, 1], [0, 2], [0, 3], [0, 4],
        [5, 1], [5, 2], [5, 3], [5, 4],
        [1, 2], [2, 3], [3, 4], [4, 1],
      ];
      return { vertices, edges };
    };

    const oct1 = createOctahedron(isMobile ? 50 : 80);
    const oct2 = createOctahedron(isMobile ? 40 : 65);
    const oct3 = createOctahedron(isMobile ? 35 : 55);

    const polyhedra: FloatingPolyhedron[] = [
      {
        x: width * 0.38,
        y: -height * 0.18,
        z: 350,
        rotX: 0.4,
        rotY: 0.2,
        rotZ: 0.1,
        rotSpeedX: 0.006,
        rotSpeedY: 0.009,
        rotSpeedZ: 0.004,
        size: 80,
        ...oct1,
      },
      {
        x: -width * 0.36,
        y: height * 0.22,
        z: 480,
        rotX: 0.1,
        rotY: 0.5,
        rotZ: 0.3,
        rotSpeedX: 0.007,
        rotSpeedY: 0.005,
        rotSpeedZ: 0.008,
        size: 65,
        ...oct2,
      },
      {
        x: width * 0.28,
        y: height * 0.32,
        z: 600,
        rotX: 0.3,
        rotY: 0.7,
        rotZ: 0.2,
        rotSpeedX: 0.005,
        rotSpeedY: 0.008,
        rotSpeedZ: 0.006,
        size: 55,
        ...oct3,
      },
    ];

    const cameraY = isMobile ? -140 : -190;
    const cameraPitch = 0.42; // Tilted downward looking onto terrain
    const focalLength = isMobile ? 380 : 460;
    let time = 0;

    // Render Loop
    const render = () => {
      time += 1;

      // Smooth camera and cursor inertia
      mouseX += (targetMouseX - mouseX) * 0.06;
      mouseY += (targetMouseY - mouseY) * 0.06;
      rotX += (targetRotX - rotX) * 0.05;
      rotY += (targetRotY - rotY) * 0.05;

      const cosY = Math.cos(rotY);
      const sinY = Math.sin(rotY);
      const cosPitch = Math.cos(cameraPitch + rotX);
      const sinPitch = Math.sin(cameraPitch + rotX);

      // --- Clear & Draw Ambient Atmosphere Background ---
      if (isDark) {
        // Deep obsidian canvas base
        ctx.fillStyle = '#090D16';
        ctx.fillRect(0, 0, width, height);

        // Ambient radial light following cursor
        const lightGrad = ctx.createRadialGradient(
          mouseX, mouseY, 0,
          mouseX, mouseY, width * 0.65
        );
        lightGrad.addColorStop(0, 'rgba(16, 185, 129, 0.14)');
        lightGrad.addColorStop(0.35, 'rgba(6, 78, 59, 0.08)');
        lightGrad.addColorStop(1, 'rgba(9, 13, 22, 0)');
        ctx.fillStyle = lightGrad;
        ctx.fillRect(0, 0, width, height);

        // Subtle upper-left emerald aurora glow
        const auroraGrad = ctx.createRadialGradient(
          width * 0.2, height * 0.2, 0,
          width * 0.2, height * 0.2, width * 0.5
        );
        auroraGrad.addColorStop(0, 'rgba(4, 120, 87, 0.12)');
        auroraGrad.addColorStop(1, 'rgba(9, 13, 22, 0)');
        ctx.fillStyle = auroraGrad;
        ctx.fillRect(0, 0, width, height);
      } else {
        // Pristine light canvas base
        ctx.fillStyle = '#F8FAF9';
        ctx.fillRect(0, 0, width, height);

        // Soft emerald luminous spotlight following cursor
        const lightGrad = ctx.createRadialGradient(
          mouseX, mouseY, 0,
          mouseX, mouseY, width * 0.55
        );
        lightGrad.addColorStop(0, 'rgba(16, 185, 129, 0.08)');
        lightGrad.addColorStop(0.4, 'rgba(5, 150, 105, 0.04)');
        lightGrad.addColorStop(1, 'rgba(248, 250, 249, 0)');
        ctx.fillStyle = lightGrad;
        ctx.fillRect(0, 0, width, height);
      }

      // --- 1. Compute 3D Financial Horizon Mesh Vertices ---
      const t = time * 0.022;

      for (let i = 0; i < gridPoints.length; i++) {
        const pt = gridPoints[i];

        // Complex harmonic wave terrain calculation
        const wave1 = Math.sin(pt.col * 0.32 + t) * 38;
        const wave2 = Math.cos(pt.row * 0.28 + t * 0.75) * 32;
        const wave3 = Math.sin((pt.col + pt.row) * 0.2 + t * 0.45) * 22;
        let y = wave1 + wave2 + wave3 + 240; // Base terrain depth position

        // 3D coordinate in world space relative to camera
        let wx = pt.baseX;
        let wy = y - cameraY;
        let wz = pt.baseZ;

        // Interactive mouse swell/depression ripple
        const dx = wx - (mouseX - width / 2) * 1.4;
        const dz = wz - (mouseY - height / 2) * 1.2;
        const distToMouse = Math.sqrt(dx * dx + dz * dz);
        if (distToMouse < 450) {
          const mouseFactor = (1 - distToMouse / 450);
          y -= mouseFactor * mouseFactor * 65 * Math.sin(distToMouse * 0.03 - t * 1.5);
          wy = y - cameraY;
        }

        pt.currentY = y;

        // Apply Y rotation (yaw)
        const rx = wx * cosY - wz * sinY;
        const rz = wz * cosY + wx * sinY;

        // Apply pitch (tilt down towards plane)
        const ry = wy * cosPitch - rz * sinPitch;
        const rz2 = rz * cosPitch + wy * sinPitch;

        // Project with perspective
        const depth = rz2 + 650;
        if (depth > 60) {
          const scale = focalLength / depth;
          pt.projX = width / 2 + rx * scale;
          pt.projY = height / 2 + ry * scale;
          pt.scale = scale;

          // Atmospheric depth fade (near is bright, distant fades)
          const depthProgress = Math.max(0, Math.min(1, (1200 - depth) / 1000));
          pt.depthAlpha = depthProgress * depthProgress;
        } else {
          pt.scale = 0;
        }
      }

      // --- Draw Mesh Lines (Rows & Columns) ---
      // Lateral Row Lines (Curving liquidity waves)
      for (let r = 0; r < rows; r++) {
        ctx.beginPath();
        let started = false;
        let avgAlpha = 0;

        for (let c = 0; c < cols; c++) {
          const idx = r * cols + c;
          const pt = gridPoints[idx];
          if (pt.scale > 0 && pt.projX >= -50 && pt.projX <= width + 50 && pt.projY >= -50 && pt.projY <= height + 50) {
            if (!started) {
              ctx.moveTo(pt.projX, pt.projY);
              started = true;
            } else {
              ctx.lineTo(pt.projX, pt.projY);
            }
            avgAlpha += pt.depthAlpha;
          }
        }

        if (started) {
          const finalAlpha = Math.min(1, (avgAlpha / cols) * (isDark ? 0.38 : 0.22));
          ctx.strokeStyle = isDark
            ? `rgba(16, 185, 129, ${finalAlpha})`
            : `rgba(5, 150, 105, ${finalAlpha})`;
          ctx.lineWidth = Math.max(0.7, (avgAlpha / cols) * (isDark ? 1.4 : 1.1));
          ctx.stroke();
        }
      }

      // Depth Column Lines (Perspective vanishing grid)
      for (let c = 0; c < cols; c += (isMobile ? 2 : 1)) {
        ctx.beginPath();
        let started = false;
        let avgAlpha = 0;

        for (let r = 0; r < rows; r++) {
          const idx = r * cols + c;
          const pt = gridPoints[idx];
          if (pt.scale > 0 && pt.projX >= -50 && pt.projX <= width + 50 && pt.projY >= -50 && pt.projY <= height + 50) {
            if (!started) {
              ctx.moveTo(pt.projX, pt.projY);
              started = true;
            } else {
              ctx.lineTo(pt.projX, pt.projY);
            }
            avgAlpha += pt.depthAlpha;
          }
        }

        if (started) {
          const finalAlpha = Math.min(1, (avgAlpha / rows) * (isDark ? 0.28 : 0.16));
          ctx.strokeStyle = isDark
            ? `rgba(52, 211, 153, ${finalAlpha})`
            : `rgba(4, 120, 87, ${finalAlpha})`;
          ctx.lineWidth = Math.max(0.6, (avgAlpha / rows) * 1.0);
          ctx.stroke();
        }
      }

      // Luminous Intersection Nodes with Shimmer Pulse
      const pulsePhase = (time * 0.05) % (Math.PI * 2);
      const step = isMobile ? 3 : 2;

      for (let r = 0; r < rows; r += step) {
        for (let c = 0; c < cols; c += step) {
          const idx = r * cols + c;
          const pt = gridPoints[idx];

          if (pt.scale > 0 && pt.depthAlpha > 0.15) {
            const nodeShimmer = Math.sin(pulsePhase + pt.col * 0.4 + pt.row * 0.3);
            const radius = Math.max(1.0, pt.scale * 3.2 * (1 + nodeShimmer * 0.25));
            const nodeAlpha = Math.min(1, pt.depthAlpha * (0.4 + nodeShimmer * 0.3) * (isDark ? 0.85 : 0.65));

            ctx.beginPath();
            ctx.arc(pt.projX, pt.projY, radius, 0, Math.PI * 2);
            ctx.fillStyle = isDark
              ? `rgba(110, 231, 183, ${nodeAlpha})`
              : `rgba(5, 150, 105, ${nodeAlpha})`;
            ctx.fill();
          }
        }
      }

      // --- 2. Render Floating 3D Polyhedra Crystals ---
      polyhedra.forEach((poly) => {
        poly.rotX += poly.rotSpeedX;
        poly.rotY += poly.rotSpeedY;
        poly.rotZ += poly.rotSpeedZ;

        // Subtle floating bob
        const currentY = poly.y + Math.sin(time * 0.02 + poly.x) * 18;

        const pCosX = Math.cos(poly.rotX);
        const pSinX = Math.sin(poly.rotX);
        const pCosY = Math.cos(poly.rotY);
        const pSinY = Math.sin(poly.rotY);
        const pCosZ = Math.cos(poly.rotZ);
        const pSinZ = Math.sin(poly.rotZ);

        // Project vertices
        const projectedVertices: { x: number; y: number; scale: number }[] = [];

        poly.vertices.forEach((v) => {
          // Local 3D rotation
          let x1 = v.x * pCosY - v.z * pSinY;
          let z1 = v.z * pCosY + v.x * pSinY;

          let y1 = v.y * pCosX - z1 * pSinX;
          let z2 = z1 * pCosX + v.y * pSinX;

          let x2 = x1 * pCosZ - y1 * pSinZ;
          let y2 = y1 * pCosZ + x1 * pSinZ;

          // World placement + mouse parallax
          const wx = poly.x + x2 - (mouseX - width / 2) * 0.15;
          const wy = currentY + y2 - (mouseY - height / 2) * 0.15;
          const wz = poly.z + z2;

          const depth = wz + 500;
          if (depth > 50) {
            const scale = focalLength / depth;
            projectedVertices.push({
              x: width / 2 + wx * scale,
              y: height / 2 + wy * scale,
              scale,
            });
          }
        });

        // Draw wireframe edges with luminous gradient
        if (projectedVertices.length === poly.vertices.length) {
          poly.edges.forEach(([i1, i2]) => {
            const v1 = projectedVertices[i1];
            const v2 = projectedVertices[i2];
            const avgScale = (v1.scale + v2.scale) / 2;
            const edgeAlpha = Math.min(1, avgScale * (isDark ? 0.45 : 0.3));

            ctx.beginPath();
            ctx.moveTo(v1.x, v1.y);
            ctx.lineTo(v2.x, v2.y);
            ctx.strokeStyle = isDark
              ? `rgba(52, 211, 153, ${edgeAlpha})`
              : `rgba(5, 150, 105, ${edgeAlpha})`;
            ctx.lineWidth = Math.max(0.8, avgScale * 1.8);
            ctx.stroke();
          });

          // Polyhedron node vertices
          projectedVertices.forEach((v) => {
            ctx.beginPath();
            ctx.arc(v.x, v.y, Math.max(1.5, v.scale * 3.5), 0, Math.PI * 2);
            ctx.fillStyle = isDark ? '#6EE7B7' : '#047857';
            ctx.fill();
          });
        }
      });

      // --- 3. Render Floating Ambient Micro-Particles (Stardust) ---
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.z += p.vz;

        // Wrap around boundaries
        if (p.y < -spreadY / 2) p.y = spreadY / 2;
        if (p.x < -spreadX / 2) p.x = spreadX / 2;
        if (p.x > spreadX / 2) p.x = -spreadX / 2;
        if (p.z < -200) p.z = spreadZ - 200;
        if (p.z > spreadZ - 200) p.z = -200;

        const wx = p.x - (mouseX - width / 2) * 0.2;
        const wy = p.y - (mouseY - height / 2) * 0.2;
        const depth = p.z + 500;

        if (depth > 50) {
          const scale = focalLength / depth;
          const projX = width / 2 + wx * scale;
          const projY = height / 2 + wy * scale;

          if (projX >= 0 && projX <= width && projY >= 0 && projY <= height) {
            const r = Math.max(0.8, p.size * scale);
            const alpha = Math.min(1, p.baseAlpha * scale * (isDark ? 0.9 : 0.65));

            ctx.beginPath();
            ctx.arc(projX, projY, r, 0, Math.PI * 2);
            ctx.fillStyle = p.color;
            ctx.globalAlpha = alpha;
            ctx.fill();
            ctx.globalAlpha = 1.0;
          }
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('resize', handleResize);
    };
  }, [theme]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 0,
        display: 'block',
      }}
      aria-hidden="true"
    />
  );
};

export default Canvas3DBackground;
