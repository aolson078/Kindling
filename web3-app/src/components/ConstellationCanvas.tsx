"use client";

import { useEffect, useRef } from "react";

type Star = { x: number; y: number; vx: number; vy: number; r: number };

type Grid = Map<string, number[]>; // key -> indices into stars array

export default function ConstellationCanvas({
  density = 0.0006,
}: {
  density?: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const starsRef = useRef<Star[]>([]);
  const runningRef = useRef<boolean>(true);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d", { alpha: true })!;

    const DPR = Math.min(window.devicePixelRatio || 1, 1.5);
    const LINK_DIST = 110 * DPR; // pixels
    const LINK_DIST2 = LINK_DIST * LINK_DIST;
    const CELL_SIZE = 120 * DPR; // spatial grid cell size

    let width = 0;
    let height = 0;
    let resizeTimer: number | null = null;

    const sizeCanvas = () => {
      const cssW = canvas.offsetWidth;
      const cssH = canvas.offsetHeight;
      width = canvas.width = Math.max(1, Math.floor(cssW * DPR));
      height = canvas.height = Math.max(1, Math.floor(cssH * DPR));
    };

    const random = (min: number, max: number) =>
      Math.random() * (max - min) + min;

    const init = () => {
      sizeCanvas();
      const count = Math.min(
        220,
        Math.max(30, Math.floor(width * height * density))
      );
      const stars: Star[] = [];
      for (let i = 0; i < count; i++) {
        const r = random(0.6, 2.0);
        stars.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: random(-0.04, 0.04) * DPR,
          vy: random(-0.04, 0.04) * DPR,
          r,
        });
      }
      starsRef.current = stars;
    };

    const buildGrid = (stars: Star[]): Grid => {
      const grid: Grid = new Map();
      const keyFor = (x: number, y: number) =>
        `${Math.floor(x / CELL_SIZE)}:${Math.floor(y / CELL_SIZE)}`;
      for (let i = 0; i < stars.length; i++) {
        const s = stars[i];
        const k = keyFor(s.x, s.y);
        const arr = grid.get(k);
        if (arr) arr.push(i);
        else grid.set(k, [i]);
      }
      return grid;
    };

    const neighbors = (grid: Grid, sx: number, sy: number): number[] => {
      const cx = Math.floor(sx / CELL_SIZE);
      const cy = Math.floor(sy / CELL_SIZE);
      const list: number[] = [];
      for (let dx = -1; dx <= 1; dx++) {
        for (let dy = -1; dy <= 1; dy++) {
          const arr = grid.get(`${cx + dx}:${cy + dy}`);
          if (arr) list.push(...arr);
        }
      }
      return list;
    };

    const step = () => {
      if (!runningRef.current) {
        rafRef.current = requestAnimationFrame(step);
        return;
      }
      const stars = starsRef.current;
      ctx.clearRect(0, 0, width, height);

      // Spatial grid for neighbor pruning
      const grid = buildGrid(stars);

      // Links
      ctx.strokeStyle = "rgba(231,227,255,0.06)";
      ctx.lineWidth = 1 * DPR;
      for (let i = 0; i < stars.length; i++) {
        const a = stars[i];
        const candidates = neighbors(grid, a.x, a.y);
        for (let j = 0; j < candidates.length; j++) {
          const idx = candidates[j];
          if (idx <= i) continue; // avoid double work
          const b = stars[idx];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < LINK_DIST2) {
            const t = 1 - d2 / LINK_DIST2;
            const alpha = Math.max(0, Math.min(0.14, t * 0.14));
            ctx.globalAlpha = alpha;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }
      ctx.globalAlpha = 1;

      // Stars
      ctx.fillStyle = "rgba(231,227,255,0.75)";
      for (const s of stars) {
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r * DPR, 0, Math.PI * 2);
        ctx.fill();

        s.x += s.vx;
        s.y += s.vy;
        if (s.x < 0) s.x = width;
        if (s.x > width) s.x = 0;
        if (s.y < 0) s.y = height;
        if (s.y > height) s.y = 0;
      }

      rafRef.current = requestAnimationFrame(step);
    };

    const onResize = () => {
      if (resizeTimer) window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(() => {
        init();
      }, 120);
    };

    const onVisibility = () => {
      runningRef.current = !document.hidden;
    };

    init();
    rafRef.current = requestAnimationFrame(step);
    window.addEventListener("resize", onResize);
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [density]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 h-full w-full opacity-30 [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_80%)]"
      role="img"
      aria-label="Animated constellation background"
    >
      Animated constellation background
    </canvas>
  );
}
