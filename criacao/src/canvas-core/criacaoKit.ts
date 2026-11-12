// CRIAÇÃO KIT. The world of the Creation film in the folk-tale storybook hand: gouache and
// watercolour over an HB pencil drawing on cream cartridge. Everything here is a pure function of
// its arguments (time t in seconds, progress p in 0..1, seeds); nothing reads a clock.
//
// The drawing grammar of the whole film: a thing that comes into being is first drawn in pencil
// (made(): outline at p 0..0.45), then painted with a brush front (p 0.3..1). Nothing fades in.
import { fractal, rng, type Ctx, type Env, type Layer, type P } from "./core";
import { clamp, mix } from "./gallery";
import { bbox, darken, far, glowBand, gouache, lighten, limb, pencil, reveal, rgba, sketch, stroke, trace, type Box, type Gouache, type Line } from "./folkTaleKit";
import { registerFaces } from "./launchLook";
import lora from "../../assets/fonts/Lora-Bold.ttf";

export { clamp, mix, darken, lighten, far, rgba, gouache, pencil, reveal, stroke, trace, bbox, limb, sketch, glowBand };
export type { P, Ctx, Env, Box, Line, Gouache };

registerFaces([{ family: "Lora", file: lora }]);

export const W = 1920, H = 1080;
export const PAPER = "#f4edda", INK = "#3b2f24", GRAPH = "#6f665a";
export const TAU = Math.PI * 2;

// ---------------------------------------------------------------- time helpers
export const win = (t: number, t0: number, dur: number) => clamp((t - t0) / dur); // exactly 1 at and past the end
export const ease = (x: number) => { const v = clamp(x); return v * v * (3 - 2 * v); };
export const eio = (t: number, t0: number, dur: number) => ease(win(t, t0, dur));
export const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
export const lp = (a: P, b: P, k: number): P => [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k];
export const shift = (pts: P[], dx: number, dy: number, s = 1): P[] => pts.map(([x, y]) => [dx + x * s, dy + y * s]);
export const flipX = (pts: P[]): P[] => pts.map(([x, y]) => [-x, y]);

// ---------------------------------------------------------------- the sheet
// Cream cartridge with its tooth: a mottle and a scatter of fibres, baked once per size.
export const paper = (c: Ctx, env: Env) => {
  const k = env.scale, DW = Math.round(W * k), DH = Math.round(H * k), key = `cr:paper:${DW}x${DH}`;
  let L = env.cache.get(key) as Layer | undefined;
  if (!L) {
    L = env.canvas(DW, DH); const p = L.ctx; p.setTransform(k, 0, 0, k, 0, 0); p.fillStyle = PAPER; p.fillRect(0, 0, W, H);
    const r = rng(7);
    for (let i = 0; i < 2600; i++) { const x = r() * W, y = r() * H, n = fractal(3, x * 0.004, y * 0.004, 1, 1, 3); p.globalAlpha = 0.05 + 0.08 * n; p.fillStyle = n > 0.55 ? "#e6dcc0" : "#fbf6e6"; p.beginPath(); p.ellipse(x, y, 6 + r() * 26, 4 + r() * 14, r() * 3, 0, TAU); p.fill(); }
    p.lineCap = "round";
    for (let i = 0; i < 900; i++) { const x = r() * W, y = r() * H, a = r() * 3, l = 2 + r() * 6; p.globalAlpha = 0.12 + r() * 0.12; p.strokeStyle = r() < 0.5 ? "#d9cdb0" : "#fffaf0"; p.lineWidth = 0.6; p.beginPath(); p.moveTo(x, y); p.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l); p.stroke(); }
    p.globalAlpha = 1; env.cache.set(key, L);
  }
  c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.globalAlpha = 1; c.globalCompositeOperation = "source-over"; c.drawImage(L.canvas as CanvasImageSource, 0, 0); c.restore();
};

// draw a whole finished picture once into a layer and reuse it (key names everything it depends on)
export const baked = (c: Ctx, env: Env, key: string, draw: (c: Ctx) => void) => {
  const k = env.scale, DW = Math.round(W * k), DH = Math.round(H * k), full = `cr:bake:${key}:${DW}x${DH}`;
  let L = env.cache.get(full) as Layer | undefined;
  if (!L) { L = env.canvas(DW, DH); L.ctx.setTransform(k, 0, 0, k, 0, 0); draw(L.ctx); env.cache.set(full, L); }
  c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.globalAlpha = 1; c.drawImage(L.canvas as CanvasImageSource, 0, 0); c.restore();
};

// a shape coming into being: pencil first, then the paint swept in by a brush front
export const made = (c: Ctx, outline: P[], p: number, seed: number, paint: () => void, o: { ang?: number; line?: number; closed?: boolean } = {}) => {
  if (p <= 0) return;
  const pl = clamp(p / 0.45), pp = clamp((p - 0.3) / 0.7), b = bbox(outline);
  if (pp > 0) reveal(c, [b[0] - 6, b[1] - 6, b[2] + 6, b[3] + 6], o.ang ?? -Math.PI / 2, pp, seed, paint);
  pencil(c, { pts: outline, seed, w: o.line ?? 1.1, a: 0.6, closed: o.closed ?? true, per: 4 }, pl);
};

// ---------------------------------------------------------------- lettering
export const FONT = (px: number) => `${px}px Lora, serif`;
const wrap = (c: Ctx, text: string, maxW: number) => {
  const words = text.split(" "), lines: string[] = []; let cur = "";
  for (const w of words) { const t = cur ? cur + " " + w : w; if (c.measureText(t).width > maxW && cur) { lines.push(cur); cur = w; } else cur = t; }
  if (cur) lines.push(cur); return lines;
};
// a torn cream card with a pencil edge and a soft cast shadow
const card = (c: Ctx, x0: number, y0: number, x1: number, y1: number, seed: number): P[] => {
  const r = rng(seed), pts: P[] = [], step = 22;
  for (let x = x0; x < x1; x += step) pts.push([x, y0 + (r() - 0.5) * 4]);
  for (let y = y0; y < y1; y += step) pts.push([x1 + (r() - 0.5) * 4, y]);
  for (let x = x1; x > x0; x -= step) pts.push([x, y1 + (r() - 0.5) * 4]);
  for (let y = y1; y > y0; y -= step) pts.push([x0 + (r() - 0.5) * 4, y]);
  return pts;
};
// The verse card. It is brushed in left to right, read, and wiped away left to right.
// (t, from, to) in seconds; nothing is drawn outside [from, to].
export const caption = (c: Ctx, t: number, from: number, to: number, text: string, ref: string, o: { y?: number; seed?: number; dark?: boolean } = {}) => {
  if (t < from || t >= to) return;
  const pin = win(t, from, 0.5), pout = win(t, to - 0.45, 0.45), seed = o.seed ?? Math.round(from * 10);
  c.save(); c.font = FONT(40); const lines = wrap(c, text, 1360), lh = 52, wMax = Math.max(...lines.map((l) => c.measureText(l).width));
  const w = Math.max(wMax + 120, 640), h = lines.length * lh + 70, cx = W / 2, y1 = (o.y ?? 1048), y0 = y1 - h, x0 = cx - w / 2, x1 = cx + w / 2;
  const box: Box = [x0 - 20, y0 - 20, x1 + 20, y1 + 20];
  const body = () => {
    const pts = card(c, x0, y0, x1, y1, seed);
    c.globalAlpha = 0.18; c.fillStyle = "#2a2014"; trace(c, pts.map(([x, y]) => [x + 6, y + 8] as P)); c.fill();
    gouache(c, pts, o.dark ? "#efe3c4" : "#f8f1de", { seed, tex: { cols: ["#efe4c8", "#fffaf0"], n: 40, len: 60, w: 6, ang: 0.05, a: 0.25 }, rim: "#b9a983", rimA: 0.5, rimW: 1.2 });
    pencil(c, { pts, seed: seed + 1, w: 1, a: 0.5, closed: true, per: 3, retrace: false }, 1);
    c.globalAlpha = 1; c.fillStyle = INK; c.textAlign = "center"; c.textBaseline = "alphabetic"; c.font = FONT(40);
    lines.forEach((l, i) => c.fillText(l, cx, y0 + 58 + i * lh));
    c.font = FONT(24); c.fillStyle = "#8a5a2a"; c.textAlign = "right"; c.fillText(ref, x1 - 30, y1 - 14);
  };
  if (pout > 0) reveal(c, box, Math.PI, 1 - pout, seed + 3, body); else reveal(c, box, 0, pin, seed + 2, body);
  c.restore(); c.globalAlpha = 1;
};
// a small chapter label, top left ("Primeiro dia")
export const label = (c: Ctx, t: number, from: number, to: number, text: string) => {
  if (t < from || t >= to) return;
  const pin = win(t, from, 0.5), pout = win(t, to - 0.45, 0.45), seed = Math.round(from * 13) + 5;
  c.save(); c.font = FONT(34); const w = c.measureText(text).width + 64, x0 = 60, y0 = 46, x1 = x0 + w, y1 = y0 + 64, box: Box = [x0 - 10, y0 - 10, x1 + 10, y1 + 10];
  const body = () => {
    const pts = card(c, x0, y0, x1, y1, seed);
    gouache(c, pts, "#c9a24a", { seed, tex: { cols: ["#e2c06a", "#9a7428"], n: 20, len: 40, w: 4, ang: 0.05, a: 0.3 }, rim: "#7a5a1e", rimA: 0.5 });
    pencil(c, { pts, seed: seed + 1, w: 1, a: 0.5, closed: true, per: 3, retrace: false }, 1);
    c.globalAlpha = 1; c.fillStyle = "#fff8e6"; c.textAlign = "left"; c.textBaseline = "middle"; c.font = FONT(34); c.fillText(text, x0 + 32, y0 + 34);
  };
  if (pout > 0) reveal(c, box, Math.PI, 1 - pout, seed + 3, body); else reveal(c, box, 0, pin, seed + 2, body);
  c.restore(); c.globalAlpha = 1;
};

// ---------------------------------------------------------------- the scene change
// A covered switch: a wet wash of the paper colour is brushed across the old picture, and the
// new picture begins under it. p 0..1 over the cover; the wash is a noisy brush front.
export const wipeCover = (c: Ctx, env: Env, p: number, seed: number) => {
  if (p <= 0) return;
  reveal(c, [-40, -40, W + 40, H + 40], 0.12, p, seed, () => { paper(c, env); c.setTransform(env.scale, 0, 0, env.scale, 0, 0); });
};

// ---------------------------------------------------------------- light (the presence and voice of God is light, never a figure)
export const glory = (c: Ctx, x: number, y: number, R: number, a: number, t: number, warm = "#ffe7a0") => {
  if (a <= 0) return;
  const g = c.createRadialGradient(x, y, 0, x, y, R); g.addColorStop(0, rgba("#fffbe8", 0.95 * a)); g.addColorStop(0.25, rgba(warm, 0.6 * a)); g.addColorStop(1, rgba(warm, 0));
  c.globalAlpha = 1; c.fillStyle = g; c.fillRect(x - R, y - R, 2 * R, 2 * R);
  // rays: long thin wedges turning slowly, each breathing on its own phase
  const r = rng(91); c.save(); c.translate(x, y);
  for (let i = 0; i < 26; i++) { const a0 = (i / 26) * TAU + t * 0.05 + r() * 0.1, L = R * (0.7 + 0.35 * Math.sin(t * 1.3 + i * 1.7)), wd = 0.02 + r() * 0.025; c.globalAlpha = a * (0.12 + 0.1 * r()); c.fillStyle = "#fff4cc"; c.beginPath(); c.moveTo(0, 0); c.lineTo(Math.cos(a0 - wd) * L, Math.sin(a0 - wd) * L); c.lineTo(Math.cos(a0 + wd) * L, Math.sin(a0 + wd) * L); c.closePath(); c.fill(); }
  c.restore(); c.globalAlpha = 1;
};
// a full-frame tint laid over everything (night, dusk, the shadow after the fall)
export const tint = (c: Ctx, col: string, a: number, mode: GlobalCompositeOperation = "multiply") => {
  if (a <= 0) return; c.save(); c.globalCompositeOperation = mode; c.globalAlpha = clamp(a); c.fillStyle = col; c.fillRect(-10, -10, W + 20, H + 20); c.restore(); c.globalAlpha = 1;
};

// ---------------------------------------------------------------- sky and clouds
export const skyWash = (c: Ctx, y1: number, top: string, bottom: string, p = 1, seed = 11) => {
  if (p <= 0) return;
  reveal(c, [0, 0, W, y1], Math.PI / 2, p, seed, () => {
    const g = c.createLinearGradient(0, 0, 0, y1); g.addColorStop(0, top); g.addColorStop(1, bottom); c.fillStyle = g; c.globalAlpha = 0.92; c.fillRect(0, 0, W, y1); c.globalAlpha = 1;
    // watercolour blooms and a few backruns in the wash
    const r = rng(seed); for (let i = 0; i < 40; i++) { const x = r() * W, y = r() * y1, rr = 30 + r() * 120; c.globalAlpha = 0.06 + r() * 0.06; c.fillStyle = r() < 0.5 ? lighten(top, 0.4) : darken(bottom, 0.08); c.beginPath(); c.ellipse(x, y, rr * 1.8, rr * 0.6, r() * 0.3, 0, TAU); c.fill(); }
    c.globalAlpha = 1;
  });
};
// a cumulus: a scalloped top over a flat wet bottom, lit from the upper left
export const cloudShape = (x: number, y: number, w: number, h: number, seed: number): P[] => {
  const r = rng(seed), pts: P[] = [], n = 7 + Math.floor(r() * 3);
  pts.push([x - w / 2, y]);
  for (let i = 0; i <= n; i++) { const t = i / n, cx = x - w / 2 + w * t, bump = Math.sin(Math.PI * t) ** 0.7 * h * (0.65 + r() * 0.5); for (let k = 0; k < 5; k++) { const a = Math.PI + (k / 4) * Math.PI, rad = (w / n) * 0.62; pts.push([cx + Math.cos(a) * rad * 0.9 + (w / n) * 0.0, y - bump * 0.55 + Math.sin(a) * rad * 0.7 * (0.6 + bump / h)]); } }
  pts.push([x + w / 2, y]); for (let i = 0; i < 6; i++) pts.push([x + w / 2 - (w * (i + 1)) / 7, y + 4 + Math.sin(i * 2.1 + seed) * 3]);
  return pts;
};
export const cloud = (c: Ctx, x: number, y: number, w: number, h: number, seed: number, p = 1, tone = "#fbf7ee", shade = "#cfc7d6") => {
  if (p <= 0) return; const pts = cloudShape(x, y, w, h, seed);
  made(c, pts, p, seed, () => {
    gouache(c, pts, tone, { seed, tex: { cols: [shade, "#ffffff"], n: Math.round(w / 6), len: 26, w: 5, ang: 0.1, a: 0.3 } });
    c.save(); trace(c, pts); c.clip(); c.globalAlpha = 0.5; c.fillStyle = shade; c.beginPath(); c.ellipse(x + w * 0.1, y + h * 0.05, w * 0.55, h * 0.32, 0, 0, TAU); c.fill(); c.restore(); c.globalAlpha = 1;
  }, { line: 0.9 });
};

// ---------------------------------------------------------------- sun, moon, stars
export const sunDisc = (c: Ctx, x: number, y: number, R: number, t: number, p = 1) => {
  if (p <= 0) return;
  const g = c.createRadialGradient(x, y, R * 0.6, x, y, R * 3.2); g.addColorStop(0, rgba("#ffd66a", 0.5 * p)); g.addColorStop(1, rgba("#ffd66a", 0)); c.fillStyle = g; c.fillRect(x - R * 3.2, y - R * 3.2, R * 6.4, R * 6.4);
  // painted rays, laid one by one, gently turning
  const n = 16, shown = Math.round(n * clamp(p * 1.4 - 0.4));
  for (let i = 0; i < shown; i++) { const a = (i / n) * TAU + t * 0.08, l = R * (1.35 + 0.18 * Math.sin(t * 2 + i)); stroke(c, [[x + Math.cos(a) * R * 1.12, y + Math.sin(a) * R * 1.12], [x + Math.cos(a + 0.05) * (R * 1.12 + l * 0.3), y + Math.sin(a + 0.05) * (R * 1.12 + l * 0.3)], [x + Math.cos(a) * (R + l * 0.55), y + Math.sin(a) * (R + l * 0.55)]], R * 0.16, 1, i % 2 ? "#f6b832" : "#f8cf4a", 0.9); }
  const disc: P[] = Array.from({ length: 24 }, (_, i) => [x + Math.cos((i / 24) * TAU) * R, y + Math.sin((i / 24) * TAU) * R] as P);
  made(c, disc, p, 401, () => { gouache(c, disc, "#f7c63a", { seed: 401, tex: { cols: ["#fbe07a", "#e8962a"], n: 40, len: R * 0.5, w: 4, ang: 2.2, a: 0.35 }, rim: "#d9801c", rimA: 0.5 }); c.globalAlpha = 0.5; c.fillStyle = "#fff0b0"; c.beginPath(); c.ellipse(x - R * 0.3, y - R * 0.3, R * 0.35, R * 0.25, -0.6, 0, TAU); c.fill(); c.globalAlpha = 1; });
};
export const moon = (c: Ctx, x: number, y: number, R: number, p = 1) => {
  if (p <= 0) return; const pts: P[] = [];
  for (let i = 0; i <= 16; i++) { const a = -Math.PI / 2 + (i / 16) * Math.PI; pts.push([x + Math.cos(a) * R, y + Math.sin(a) * R]); }
  for (let i = 16; i >= 0; i--) { const a = -Math.PI / 2 + (i / 16) * Math.PI; pts.push([x + Math.cos(a) * R * 0.45, y + Math.sin(a) * R * 0.92]); }
  const g = c.createRadialGradient(x, y, R * 0.5, x, y, R * 2.6); g.addColorStop(0, rgba("#fff6d8", 0.35 * p)); g.addColorStop(1, rgba("#fff6d8", 0)); c.fillStyle = g; c.fillRect(x - R * 3, y - R * 3, R * 6, R * 6);
  made(c, pts, p, 402, () => gouache(c, pts, "#f6ecc4", { seed: 402, tex: { cols: ["#fffbe6", "#d8c890"], n: 20, len: R * 0.4, w: 3, ang: 1.2, a: 0.35 }, rim: "#bfae78", rimA: 0.5 }));
};
export const stars = (c: Ctx, a: number, t: number, y1 = 560, n = 90) => {
  if (a <= 0) return; const r = rng(77);
  for (let i = 0; i < n; i++) {
    const x = r() * W, y = r() * y1 * 0.95, s = 2 + r() * 4, tw = 0.55 + 0.45 * Math.sin(t * (1.5 + r() * 2) + r() * 9), ap = a * tw * clamp((a * n - i * 0.6) / 4 + 1);
    c.globalAlpha = clamp(ap); c.fillStyle = "#fff8dc"; c.beginPath();
    for (let k = 0; k < 8; k++) { const ang = (k / 8) * TAU, rad = k % 2 ? s * 0.35 : s * (k % 4 ? 1 : 1.4); c.lineTo(x + Math.cos(ang) * rad, y + Math.sin(ang) * rad); }
    c.closePath(); c.fill();
  }
  c.globalAlpha = 1;
};

// ---------------------------------------------------------------- water
// The sea: a wash darker toward us, with brushed ripples that travel; `light` 0 = the dark deep of day one.
export const sea = (c: Ctx, y0: number, t: number, light = 1, p = 1, x0 = 0, x1 = W, y1 = H) => {
  if (p <= 0) return;
  const deep = mix("#0e1626", "#3f7fa0", light), top = mix("#1b2638", "#8ec3c9", light), crest = mix("#3a4a66", "#eef7f2", light);
  reveal(c, [x0, y0, x1, y1], Math.PI / 2, p, 21, () => {
    const g = c.createLinearGradient(0, y0, 0, y1); g.addColorStop(0, top); g.addColorStop(1, deep); c.fillStyle = g; c.fillRect(x0, y0, x1 - x0, y1 - y0);
    const r = rng(23); c.lineCap = "round";
    for (let i = 0; i < 170; i++) {
      const v = r(), y = y0 + 6 + (y1 - y0 - 6) * v * v, persp = 0.3 + 1.7 * ((y - y0) / (y1 - y0)), sp = (12 + r() * 16) * persp, x = x0 + ((r() * (x1 - x0) + t * sp) % (x1 - x0 + 200)) - 100, l = (20 + r() * 50) * persp, bob = Math.sin(t * 1.6 + i) * 2 * persp;
      c.globalAlpha = (0.25 + r() * 0.35) * (0.6 + 0.4 * Math.sin(t * 2 + i * 0.7)); c.strokeStyle = r() < 0.6 ? crest : darken(deep, 0.2); c.lineWidth = (1.2 + r() * 2) * persp;
      c.beginPath(); c.moveTo(x, y + bob); c.quadraticCurveTo(x + l / 2, y + bob - 3 * persp, x + l, y + bob); c.stroke();
    }
    c.globalAlpha = 1;
  });
};
export const river = (c: Ctx, pts: P[], w0: number, w1: number, t: number, p = 1) => {
  if (p <= 0) return; stroke(c, pts, w0, w1, "#6fb2c0", 0.95, p, 10); stroke(c, pts, w0 * 0.6, w1 * 0.55, "#8fc9cf", 0.8, p, 10);
  const r = rng(31), n = 60;
  for (let i = 0; i < n; i++) { const k = ((r() + t * 0.05) % 1) * p, s = pts, idx = Math.min(s.length - 2, Math.floor(k * (s.length - 1))), f = k * (s.length - 1) - idx, a = lp(s[idx], s[idx + 1], f), w = lerp(w0, w1, k) * 0.35, off = (r() - 0.5) * w; c.globalAlpha = 0.5 + 0.4 * Math.sin(t * 3 + i); c.strokeStyle = "#e8f6f2"; c.lineWidth = 1 + lerp(1, 3, k); c.beginPath(); c.moveTo(a[0] - w * 0.3, a[1] + off * 0.3); c.lineTo(a[0] + w * 0.3, a[1] + off * 0.3); c.stroke(); }
  c.globalAlpha = 1;
};

// ---------------------------------------------------------------- land
export const hill = (c: Ctx, top: P[], bottom: number, col: string, seed: number, p = 1, d = 0) => {
  const pts: P[] = [[top[0][0], bottom], ...top, [top[top.length - 1][0], bottom]];
  made(c, pts, p, seed, () => {
    gouache(c, pts, far(col, d), { seed, tex: { cols: [far(lighten(col, 0.18), d), far(darken(col, 0.15), d)], n: 160, len: 46, w: 5, ang: 0.08, jit: 0.4, a: 0.3 * (1 - d) }, mottle: { cols: [far(darken(col, 0.2), d), far(lighten(col, 0.25), d)], n: 80, r: 18, a: 0.25 } });
    // the lit crest: a lighter band just under the ridge line, toward the sun
    c.save(); trace(c, pts); c.clip(); c.globalAlpha = 0.35 * (1 - d * 0.5); c.strokeStyle = far(lighten(col, 0.35), d); c.lineWidth = 26; c.lineJoin = "round"; c.beginPath(); top.forEach(([x, y], i) => (i ? c.lineTo(x, y + 12) : c.moveTo(x, y + 12))); c.stroke(); c.restore(); c.globalAlpha = 1;
  }, { ang: 0 });
};

// ---------------------------------------------------------------- plants
// A broadleaf tree: a trunk with two or three limbs, a crown of scalloped masses in three
// tones (shadow, body, light), the light on the upper left. Sway moves the crown, not the root.
export type Tree = { x: number; y: number; s: number; seed: number; col?: string; d?: number; fruit?: string; fruitN?: number; glow?: number; shape?: "round" | "tall" | "wide" };
const blob = (cx: number, cy: number, rx: number, ry: number, seed: number): P[] => {
  const r = rng(seed), n = 9 + Math.floor(r() * 4), pts: P[] = [];
  for (let i = 0; i < n; i++) { const a0 = (i / n) * TAU, a1 = ((i + 1) / n) * TAU, rr = 0.82 + r() * 0.3; for (let k = 0; k < 4; k++) { const a = lerp(a0, a1, k / 4), bulge = 1 + 0.12 * Math.sin((k / 4) * Math.PI); pts.push([cx + Math.cos(a) * rx * rr * bulge, cy + Math.sin(a) * ry * rr * bulge]); } }
  return pts;
};
export const treeCrown = (T: Tree) => {
  const r = rng(T.seed), s = T.s, cx = T.x, top = T.y - 330 * s, shape = T.shape ?? "round";
  const rw = shape === "tall" ? 0.7 : shape === "wide" ? 1.35 : 1, rh = shape === "tall" ? 1.35 : 1;
  const masses: { pts: P[]; c: P; k: number }[] = [];
  const N = 9;
  for (let i = 0; i < N; i++) { const a = (i / N) * TAU + r() * 0.5, rad = r() * 0.6 + 0.35, mx = cx + Math.cos(a) * 120 * s * rw * rad, my = top + 30 * s + Math.sin(a) * 85 * s * rh * rad, k = (Math.cos(a) * -0.6 + Math.sin(a) * -0.8) * rad; masses.push({ pts: blob(mx, my, (70 + r() * 40) * s * rw, (55 + r() * 30) * s * rh, T.seed * 10 + i), c: [mx, my], k }); }
  masses.push({ pts: blob(cx, top + 20 * s, 130 * s * rw, 100 * s * rh, T.seed * 10 + 99), c: [cx, top + 20 * s], k: 0 });
  masses.sort((a, b) => a.k - b.k);
  return { masses, top, trunkTop: T.y - 230 * s };
};
export const tree = (c: Ctx, T: Tree, p: number, t: number) => {
  if (p <= 0) return;
  const s = T.s, d = T.d ?? 0, col = T.col ?? "#5f8a3a", sway = Math.sin(t * 0.9 + T.seed) * 7 * s, pt = clamp(p / 0.4), pc = clamp((p - 0.3) / 0.7);
  const trunk: P[] = [[T.x, T.y], [T.x - 4 * s, T.y - 90 * s], [T.x + 3 * s, T.y - 180 * s], [T.x + sway * 0.5, T.y - 250 * s]];
  limb(c, trunk, 34 * s, 16 * s, "#7a5634", T.seed, d, pt, 0.35, 0.7);
  if (pt >= 1) { limb(c, [[T.x, T.y - 160 * s], [T.x - 50 * s, T.y - 220 * s], [T.x - 80 * s + sway, T.y - 270 * s]], 14 * s, 6 * s, "#7a5634", T.seed + 1, d, pc * 2, 0.35, 0.5); limb(c, [[T.x + 2 * s, T.y - 190 * s], [T.x + 46 * s, T.y - 240 * s], [T.x + 70 * s + sway, T.y - 280 * s]], 12 * s, 5 * s, "#7a5634", T.seed + 2, d, pc * 2, 0.35, 0.5); }
  if (pc <= 0) return;
  const { masses } = treeCrown(T), shown = masses.length * pc;
  c.save(); c.translate(sway, 0);
  masses.forEach((m, i) => {
    const q = clamp(shown - i); if (q <= 0) return;
    const k = clamp(m.k * 0.5 + 0.5), tone = far(mix(darken(col, 0.28), lighten(col, 0.22), k), d), pts = q >= 1 ? m.pts : m.pts.map(([x, y]) => [m.c[0] + (x - m.c[0]) * q, m.c[1] + (y - m.c[1]) * q] as P);
    gouache(c, pts, tone, { seed: T.seed + i, a: 1 - 0.4 * d, tex: d < 0.6 ? { cols: [far(lighten(col, 0.3), d), far(darken(col, 0.35), d)], n: Math.round(30 * s), len: 14 * s, w: 4 * s, ang: -0.8, jit: 1.6, a: 0.45 } : undefined, rim: far(darken(col, 0.4), d), rimA: 0.35, rimW: 1.2 });
    if (q >= 1 && d < 0.6) { const r = rng(T.seed * 3 + i); c.lineCap = "round"; for (let j = 0; j < 14 * s; j++) { const a = r() * TAU, rr = r() * 0.8, x = m.c[0] + Math.cos(a) * 60 * s * rr, y = m.c[1] + Math.sin(a) * 45 * s * rr; c.globalAlpha = 0.45; c.fillStyle = far(r() < 0.5 ? lighten(col, 0.38) : darken(col, 0.4), d); c.beginPath(); c.ellipse(x, y, 6 * s, 3.4 * s, a, 0, TAU); c.fill(); } c.globalAlpha = 1; }
  });
  // fruit: hung in the outer masses, each with its own highlight
  if (T.fruit && pc >= 1) {
    const r = rng(T.seed + 500), n = T.fruitN ?? 12;
    for (let i = 0; i < n; i++) { const m = masses[Math.floor(r() * masses.length)], a = r() * TAU, rr = r() * 0.75, x = m.c[0] + Math.cos(a) * 55 * s * rr, y = m.c[1] + Math.sin(a) * 40 * s * rr + 10 * s, R = 9 * s; if (T.glow) { const g = c.createRadialGradient(x, y, 0, x, y, R * 4); g.addColorStop(0, rgba("#fff3b0", 0.55 * T.glow * (0.7 + 0.3 * Math.sin(t * 2 + i)))); g.addColorStop(1, rgba("#fff3b0", 0)); c.fillStyle = g; c.fillRect(x - R * 4, y - R * 4, R * 8, R * 8); } c.globalAlpha = 1; c.fillStyle = far(T.fruit, d); c.beginPath(); c.arc(x, y, R, 0, TAU); c.fill(); c.fillStyle = far(darken(T.fruit, 0.3), d); c.beginPath(); c.arc(x + R * 0.25, y + R * 0.25, R * 0.7, 0.2, 1.9); c.fill(); c.fillStyle = "#fff6e0"; c.globalAlpha = 0.8; c.beginPath(); c.arc(x - R * 0.35, y - R * 0.35, R * 0.28, 0, TAU); c.fill(); c.globalAlpha = 1; }
  }
  c.restore();
  // the pencil lay-in of the crown, drawn first and left showing round the paint
  if (pc < 1) masses.forEach((m, i) => pencil(c, { pts: m.pts, seed: T.seed + i * 7, w: 0.9, a: 0.45, closed: true, per: 3, retrace: false }, clamp(pc * 3 - i * 0.15)));
};
// a low flowering bush: a few scalloped masses and a scatter of blossoms
export const bush = (c: Ctx, x: number, y: number, s: number, seed: number, p: number, t: number, flower = "#e88aa0", col = "#4f7d34") => {
  if (p <= 0) return; const r = rng(seed), sway = Math.sin(t * 1.1 + seed) * 2 * s;
  const masses = Array.from({ length: 5 }, (_, i) => { const mx = x + (i - 2) * 40 * s + (r() - 0.5) * 20 * s, my = y - (30 + r() * 40) * s - (i === 2 ? 30 * s : 0); return blob(mx + sway, my, (55 + r() * 25) * s, (42 + r() * 18) * s, seed * 9 + i); });
  masses.forEach((m, i) => { const q = clamp(p * 6 - i); if (q <= 0) return; const b = bbox(m), cx = (b[0] + b[2]) / 2, cy = (b[1] + b[3]) / 2, pts = m.map(([px, py]) => [cx + (px - cx) * q, cy + (py - cy) * q] as P); gouache(c, pts, mix(darken(col, 0.2), lighten(col, 0.15), i / 4), { seed: seed + i, tex: { cols: [lighten(col, 0.3), darken(col, 0.35)], n: Math.round(26 * s), len: 12 * s, w: 3.5 * s, ang: -0.8, jit: 1.6, a: 0.45 }, rim: darken(col, 0.45), rimA: 0.35 }); });
  const fq = clamp(p * 6 - 5);
  if (fq > 0) for (let i = 0; i < Math.round(16 * fq); i++) { const fx = x + (r() - 0.5) * 220 * s + sway, fy = y - r() * 110 * s - 10 * s; for (let k = 0; k < 5; k++) { const a = (k / 5) * TAU; c.fillStyle = k % 2 ? flower : lighten(flower, 0.3); c.beginPath(); c.ellipse(fx + Math.cos(a) * 5 * s, fy + Math.sin(a) * 5 * s, 5 * s, 3.4 * s, a, 0, TAU); c.fill(); } c.fillStyle = "#f6d24a"; c.beginPath(); c.arc(fx, fy, 2.6 * s, 0, TAU); c.fill(); }
};
// a tuft of meadow grass in strokes, swaying from its root
export const tuft = (c: Ctx, x: number, y: number, s: number, seed: number, t: number, p = 1, col = "#6e9a3c") => {
  if (p <= 0) return; const r = rng(seed), n = 9;
  for (let i = 0; i < Math.round(n * p); i++) { const lean = (r() - 0.5) * 0.9 + Math.sin(t * 1.4 + x * 0.01 + i) * 0.12, h = (30 + r() * 40) * s, x0 = x + (r() - 0.5) * 18 * s; stroke(c, [[x0, y], [x0 + lean * h * 0.4, y - h * 0.5], [x0 + lean * h, y - h]], 5 * s, 0.6, i % 3 ? col : i % 2 ? darken(col, 0.25) : lighten(col, 0.2), 0.9); }
};
export const flower = (c: Ctx, x: number, y: number, s: number, col: string, seed: number, t: number, p = 1) => {
  if (p <= 0) return; const sw = Math.sin(t * 1.3 + seed) * 4 * s, hx = x + sw, hy = y - 46 * s * clamp(p * 2);
  stroke(c, [[x, y], [x + sw * 0.4, y - 25 * s * clamp(p * 2)], [hx, hy]], 3 * s, 1.6 * s, "#5d8a34", 1);
  const q = clamp(p * 2 - 1); if (q <= 0) return; const n = 6;
  for (let k = 0; k < n; k++) { const a = (k / n) * TAU + seed; c.globalAlpha = 1; c.fillStyle = k % 2 ? col : lighten(col, 0.25); c.beginPath(); c.ellipse(hx + Math.cos(a) * 8 * s * q, hy + Math.sin(a) * 8 * s * q * 0.8, 8 * s * q, 4.5 * s * q, a, 0, TAU); c.fill(); }
  c.fillStyle = "#f2c63a"; c.beginPath(); c.arc(hx, hy, 4 * s * q, 0, TAU); c.fill();
};

// a butterfly on a looping path, wings beating
export const butterfly = (c: Ctx, x: number, y: number, s: number, t: number, col: string, seed: number) => {
  const flap = Math.abs(Math.sin(t * 14 + seed)), dir = Math.cos(t * 0.7 + seed) > 0 ? 1 : -1;
  c.save(); c.translate(x, y); c.scale(s * dir, s);
  for (const k of [-1, 1]) { c.save(); c.scale(1, 0.25 + 0.75 * flap); gouache(c, [[0, 0], [k * 4, -14], [k * 16, -18], [k * 18, -6], [k * 6, 2], [k * 14, 10], [k * 8, 16], [k * 1, 6]], k < 0 ? col : lighten(col, 0.2), { seed: seed + k, rim: darken(col, 0.5), rimA: 0.6, rimW: 1 }); c.restore(); }
  stroke(c, [[0, -8], [1, 0], [0, 10]], 3, 2, "#2a1a10", 1); c.restore();
};
export const butterflies = (c: Ctx, t: number, n = 6, y0 = 560, y1 = 860) => {
  for (let i = 0; i < n; i++) { const sp = 0.25 + (i % 3) * 0.07, x = ((i * 337 + t * 60 * (i % 2 ? 1 : -1)) % (W + 200) + W + 200) % (W + 200) - 100 + Math.sin(t * sp * 3 + i) * 80, y = lerp(y0, y1, ((i * 0.37) % 1)) + Math.sin(t * 1.7 + i * 2) * 40; butterfly(c, x, y, 0.9 + (i % 3) * 0.2, t, ["#f2c53a", "#e86a8a", "#8ac0e8", "#f08a3a"][i % 4], 1500 + i); }
};
