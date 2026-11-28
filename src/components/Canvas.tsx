import { useEffect, useRef } from "react";

export type DrawFn = (
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  t: number,
  dt: number,
) => void;

/** HiDPI canvas with a requestAnimationFrame loop. Reserves its own aspect via `height`. */
export function Canvas({
  draw,
  height = 360,
  onActivate,
  className = "",
  title,
}: {
  draw: DrawFn;
  height?: number;
  onActivate?: () => void;
  className?: string;
  title?: string;
}) {
  const ref = useRef<HTMLCanvasElement | null>(null);
  const drawRef = useRef(draw);
  drawRef.current = draw;

  useEffect(() => {
    const cv = ref.current;
    if (!cv) return;
    const ctx = cv.getContext("2d");
    if (!ctx) return;
    let raf = 0;
    let last = performance.now();
    let w = 0;
    let h = 0;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = cv.getBoundingClientRect();
      w = Math.max(10, rect.width);
      h = Math.max(10, rect.height);
      cv.width = Math.round(w * dpr);
      cv.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(cv);

    const loop = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      ctx.clearRect(0, 0, w, h);
      drawRef.current(ctx, w, h, now / 1000, dt);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, []);

  return (
    <canvas
      ref={ref}
      onClick={onActivate}
      title={title}
      className={`block w-full touch-none rounded-xl ${onActivate ? "cursor-pointer" : ""} ${className}`}
      style={{ height }}
      aria-label={title ?? "physics simulation"}
    />
  );
}
