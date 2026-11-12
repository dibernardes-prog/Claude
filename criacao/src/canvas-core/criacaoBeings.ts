// CRIAÇÃO BEINGS. Everything alive in the film, in the same storybook hand: people, animals,
// birds, fish, the serpent and the cherubim. Each is authored on its own local frame (origin on
// the ground between the feet, facing right, y up is negative) and placed with (x, y, s, facing).
// Motion is a phase: walk cycles, wing beats and swims are periodic in it, so nothing slides.
import { rng, type Ctx, type P } from "./core";
import { TAU, clamp, darken, gouache, lighten, limb, lp, mix, pencil, rgba, stroke, trace, type Gouache } from "./criacaoKit";

const place = (c: Ctx, x: number, y: number, s: number, facing: number, rot = 0) => { c.save(); c.translate(x, y); if (rot) c.rotate(rot); c.scale(s * facing, s); };
const G = (c: Ctx, pts: P[], col: string, o: Partial<Gouache> = {}) => gouache(c, pts, col, { seed: 5, ...o });
const outline = (c: Ctx, pts: P[], seed: number, a = 0.45, closed = true) => pencil(c, { pts, seed, w: 1, a, closed, per: 3, retrace: false }, 1);
const blobPts = (cx: number, cy: number, rx: number, ry: number, seed: number, n = 10): P[] => {
  const r = rng(seed), pts: P[] = [];
  for (let i = 0; i < n; i++) { const a0 = (i / n) * TAU, a1 = ((i + 1) / n) * TAU, rr = 0.85 + r() * 0.25; for (let k = 0; k < 4; k++) { const a = a0 + ((a1 - a0) * k) / 4, b = 1 + 0.1 * Math.sin((k / 4) * Math.PI); pts.push([cx + Math.cos(a) * rx * rr * b, cy + Math.sin(a) * ry * rr * b]); } }
  return pts;
};
// a two-segment leg or arm from a joint, by angle from straight down; returns the end point
const seg2 = (j: P, a1: number, l1: number, a2: number, l2: number): [P, P] => { const k: P = [j[0] + Math.sin(a1) * l1, j[1] + Math.cos(a1) * l1]; return [k, [k[0] + Math.sin(a1 + a2) * l2, k[1] + Math.cos(a1 + a2) * l2]]; };

// ================================================================ PEOPLE
export type Outfit = "none" | "leaves" | "tunic";
export type Person = {
  who: "adam" | "eve"; x: number; y: number; s: number; facing?: number;
  walk?: number;              // walk phase in radians; undefined = standing
  arms?: [number, number];    // extra shoulder angles (near, far): + lifts forward
  elbows?: [number, number];
  reach?: number;             // near arm raised toward something (0..1)
  outfit?: Outfit; mood?: "smile" | "sad" | "worried" | "calm" | "awe"; eyes?: "open" | "closed" | "down";
  breathe?: number;           // time, for the idle breath
  rot?: number;               // whole-figure rotation (lying down)
  look?: number;              // head tilt
  holding?: string;           // a fruit in the near hand (its colour)
  clay?: number;              // 0..1: still the dust of the ground, before the breath of life
};
const SKIN = { adam: ["#c98a5e", "#a66a42", "#8a5232"], eve: ["#dba27a", "#bd8058", "#9a6040"] };
const HAIR = { adam: "#3a2416", eve: "#5e2f18" };
export const person = (c: Ctx, F: Person) => {
  const f = F.facing ?? 1, eve = F.who === "eve", cl = F.clay ?? 0, [sk, sk2, sk3] = SKIN[F.who].map((k, i) => mix(k, ["#a98257", "#86623e", "#5e4428"][i], cl)), hair = HAIR[F.who], out = F.outfit ?? "none";
  const ph = F.walk, walking = ph !== undefined, bob = walking ? -Math.abs(Math.sin(ph!)) * 4 : Math.sin((F.breathe ?? 0) * 1.6) * 3;
  place(c, F.x, F.y, F.s * (eve ? 0.94 : 1), f, F.rot ?? 0); c.translate(0, bob);
  const sh = eve ? 21 : 25, hipW = eve ? 13 : 11;
  // legs: thigh and shin from each hip, the near one swinging opposite the far one
  const legA = walking ? Math.sin(ph!) * 0.42 : 0.04, kneeA = (q: number) => (walking ? Math.max(0, Math.sin(q + 1.2)) * -0.7 : 0);
  const leg = (near: boolean) => {
    const hip: P = [near ? hipW * 0.3 : -hipW * 0.6, -142], a = near ? legA : -legA, [k, ft] = seg2(hip, -a, 72, kneeA(near ? ph ?? 0 : (ph ?? 0) + Math.PI) * -1, 68), col = near ? sk : sk2;
    limb(c, [hip, lp(hip, k, 0.5), k], 23, 16, col, near ? 31 : 32, 0, 1, 0.25, 0); limb(c, [k, lp(k, ft, 0.5), ft], 16, 11, col, near ? 33 : 34, 0, 1, 0.25, 0);
    G(c, [[ft[0] - 6, ft[1] - 8], [ft[0] + 14, ft[1] - 7], [ft[0] + 20, ft[1] - 1], [ft[0] + 16, ft[1] + 2], [ft[0] - 8, ft[1] + 2]], darken(col, 0.05), { rim: sk3, rimA: 0.5, rimW: 1 });
  };
  const armA = walking ? Math.sin(ph!) * 0.38 : 0.06, [aN, aF] = F.arms ?? [0, 0], [eN, eF] = F.elbows ?? [0.15, 0.15];
  const arm = (near: boolean) => {
    const S: P = [near ? sh * 0.78 : -sh * 0.82, -216], swing = near ? -armA - aN - (F.reach ?? 0) * 2.2 : armA - aF, [e, hnd] = seg2(S, -swing, 54, (near ? eN + (F.reach ?? 0) * 0.3 : eF), 48), col = near ? sk : sk2;
    G(c, blobPts(S[0], S[1] + 4, 10, 13, near ? 47 : 48, 6), col, { rim: sk3, rimA: 0.35, rimW: 1 });
    limb(c, [S, lp(S, e, 0.5), e], 16, 12, col, near ? 41 : 42, 0, 1, 0.25, 0); limb(c, [e, lp(e, hnd, 0.5), hnd], 12, 9, col, near ? 43 : 44, 0, 1, 0.25, 0);
    G(c, blobPts(hnd[0], hnd[1] + 3, 7, 9, near ? 45 : 46, 6), col, { rim: sk3, rimA: 0.5, rimW: 1 });
    return hnd;
  };
  if (out === "none") { c.save(); c.beginPath(); c.rect(-200, -400, 400, 400 - 150); c.clip(); }
  // hair falling behind the back (eve)
  if (eve) G(c, [[-14, -292], [10, -296], [26, -280], [30, -250], [26, -205], [20, -170], [6, -160], [-16, -162], [-30, -180], [-34, -220], [-30, -262]], hair, { tex: { cols: [lighten(hair, 0.25), darken(hair, 0.3)], n: 60, len: 30, w: 2.4, ang: 1.6, jit: 0.3, a: 0.5 }, rim: darken(hair, 0.4), rimA: 0.5 });
  arm(false); if (out !== "none" || true) { if (out !== "none") leg(false); }
  // torso
  const torso: P[] = eve ? [[-17, -230], [-4, -234], [8, -233], [18, -228], [23, -218], [22, -200], [17, -182], [14, -166], [18, -150], [20, -142], [-20, -142], [-17, -152], [-15, -168], [-20, -190], [-24, -212], [-22, -224]] : [[-20, -230], [-6, -234], [10, -233], [22, -228], [29, -218], [30, -204], [27, -186], [23, -168], [22, -152], [22, -142], [-22, -142], [-22, -154], [-24, -170], [-28, -190], [-30, -210], [-28, -224]];
  G(c, [[-7, -244], [7, -244], [8, -222], [-8, -222]], sk2);
  G(c, torso, sk, { tex: { cols: [lighten(sk, 0.15), sk2], n: 30, len: 16, w: 3, ang: 1.4, a: 0.25 }, rim: sk3, rimA: 0.45, rimW: 1.2 });
  c.save(); trace(c, torso); c.clip(); c.globalAlpha = 0.3; c.fillStyle = sk2; trace(c, [[14, -232], [34, -222], [34, -140], [12, -140], [17, -170], [19, -200]]); c.fill(); c.globalAlpha = 0.25; c.fillStyle = lighten(sk, 0.3); c.beginPath(); c.ellipse(-12, -206, 9, 16, 0.2, 0, TAU); c.fill(); c.restore(); c.globalAlpha = 1;
  outline(c, torso, 62, 0.3);
  if (out !== "none") leg(true);
  if (out === "leaves") {
    const r = rng(eve ? 71 : 72);
    for (let i = 0; i < 9; i++) { const x = -26 + i * 6.5, y = -150 + (i % 2) * 4, l = 44 + r() * 10, a = 0.15 * (i - 4) / 4; const pts: P[] = [[x, y], [x - 9, y + l * 0.35], [x - 7 + Math.sin(a) * l, y + l * 0.75], [x + Math.sin(a) * l, y + l], [x + 7 + Math.sin(a) * l, y + l * 0.75], [x + 9, y + l * 0.35]]; G(c, pts, i % 2 ? "#5f8f32" : "#4c7a2a", { rim: "#2e4e18", rimA: 0.5, rimW: 1 }); stroke(c, [[x, y + 2], [x + Math.sin(a) * l * 0.5, y + l * 0.5], [x + Math.sin(a) * l * 0.9, y + l * 0.9]], 1.4, 0.4, "#9cc46a", 0.7); }
    G(c, [[-24, -152], [24, -152], [24, -144], [-24, -144]], "#7a5a2a", { rim: "#4a3416", rimA: 0.5 });
    if (eve) for (let i = 0; i < 6; i++) { const x = -20 + i * 8, y = -206 + (i % 2) * 3; G(c, [[x - 8, y], [x, y - 8], [x + 9, y - 1], [x + 7, y + 20], [x, y + 26], [x - 7, y + 20]], i % 2 ? "#5f8f32" : "#4c7a2a", { rim: "#2e4e18", rimA: 0.5, rimW: 1 }); }
  }
  if (out === "tunic") {
    const hem = eve ? -48 : -78, tunic: P[] = [[-26, -228], [-8, -230], [14, -222], [28, -212], [30, -180], [27, -150], [32, (hem - 140) / 2 - 40], [36, hem + 4], [16, hem], [0, hem + 6], [-18, hem], [-36, hem + 4], [-31, -150], [-28, -180], [-30, -214]];
    G(c, tunic, "#9a6a3c", { tex: { cols: ["#c08a52", "#6a4424", "#b07a44"], n: 220, len: 9, w: 2.2, ang: 1.6, jit: 0.8, a: 0.55 }, rim: "#4e3018", rimA: 0.6, rimW: 1.4 });
    c.save(); trace(c, tunic); c.clip(); c.globalAlpha = 0.35; c.fillStyle = "#5a3a1e"; trace(c, [[8, -230], [40, -230], [40, hem + 10], [14, hem + 10], [18, -160]]); c.fill(); c.restore(); c.globalAlpha = 1;
    stroke(c, [[-24, -150], [0, -146], [26, -150]], 6, 6, "#5a3a1e", 0.9);
    // a ragged fur hem
    for (let x = -34; x <= 34; x += 5) stroke(c, [[x, hem], [x + 1, hem + 6 + (Math.abs(x) % 3) * 2]], 3, 0.5, "#7a5230", 0.8);
  }
  // head
  const head: P[] = [[-2, -292], [12, -289], [22, -278], [25, -263], [24, -251], [19, -241], [9, -235], [-3, -236], [-14, -242], [-21, -253], [-23, -267], [-18, -281], [-10, -289]];
  G(c, head, sk, { tex: { cols: [lighten(sk, 0.18), sk2], n: 20, len: 9, w: 2.6, ang: 1.2, a: 0.28 }, rim: sk3, rimA: 0.45, rimW: 1.2 });
  c.save(); trace(c, head); c.clip(); c.globalAlpha = 0.35; c.fillStyle = sk2; c.beginPath(); c.ellipse(-16, -260, 10, 26, 0, 0, TAU); c.fill(); c.restore(); c.globalAlpha = 1;
  G(c, [[-14, -268], [-8, -266], [-8, -254], [-14, -252]], sk2, { rim: sk3, rimA: 0.5, rimW: 1 }); // the ear
  // hair over the head
  if (eve) {
    G(c, [[-24, -262], [-24, -280], [-14, -294], [2, -298], [16, -294], [26, -282], [27, -270], [18, -277], [8, -282], [-4, -280], [-12, -272], [-14, -262]], hair, { tex: { cols: [lighten(hair, 0.3), darken(hair, 0.3)], n: 40, len: 14, w: 2, ang: 0.4, jit: 0.8, a: 0.5 }, rim: darken(hair, 0.4), rimA: 0.5 });
    // front locks falling over the near shoulder and the breast
    G(c, [[-2, -248], [8, -242], [13, -228], [15, -208], [19, -188], [16, -168], [6, -165], [2, -188], [-2, -212], [-6, -236]], hair, { tex: { cols: [lighten(hair, 0.3), darken(hair, 0.3)], n: 30, len: 20, w: 2, ang: 1.6, jit: 0.3, a: 0.5 }, rim: darken(hair, 0.4), rimA: 0.5 });
    G(c, [[-12, -240], [-4, -232], [-4, -208], [0, -184], [-6, -168], [-16, -172], [-14, -200], [-18, -224]], darken(hair, 0.08), { tex: { cols: [lighten(hair, 0.3)], n: 20, len: 20, w: 2, ang: 1.6, a: 0.45 }, rim: darken(hair, 0.4), rimA: 0.5 });
  } else {
    G(c, [[-23, -258], [-25, -276], [-16, -292], [0, -298], [16, -294], [26, -284], [27, -272], [20, -280], [12, -280], [4, -284], [-6, -278], [-14, -266], [-16, -256]], hair, { tex: { cols: [lighten(hair, 0.25), darken(hair, 0.4)], n: 40, len: 8, w: 2, ang: 0.3, jit: 2, a: 0.5 }, rim: darken(hair, 0.4), rimA: 0.5 });
    // a short beard along the jaw
    G(c, [[-12, -252], [-6, -244], [4, -238], [14, -240], [21, -248], [23, -244], [18, -234], [6, -228], [-6, -232], [-14, -242]], hair, { tex: { cols: [lighten(hair, 0.25)], n: 16, len: 5, w: 1.6, ang: 1.5, jit: 1.5, a: 0.5 }, rim: darken(hair, 0.4), rimA: 0.45 });
  }
  // face, last
  const mood = F.mood ?? "calm", eyes = F.eyes ?? "open";
  for (const [x, cy] of [[-12 + 18, -247], [-12 + 32, -248]] as P[]) { const g = c.createRadialGradient(x, cy, 0, x, cy, 7); g.addColorStop(0, rgba("#e2645a", 0.45)); g.addColorStop(1, rgba("#e2645a", 0)); c.fillStyle = g; c.fillRect(x - 8, cy - 8, 16, 16); }
  c.fillStyle = "#2a1a10"; c.strokeStyle = "#2a1a10"; c.lineCap = "round";
  for (const [x, w] of [[8, 1], [19, 0.85]] as P[]) {
    if (eyes === "closed") { c.lineWidth = 1.4; c.beginPath(); c.moveTo(x - 3 * w, -262); c.quadraticCurveTo(x, -259, x + 3 * w, -262); c.stroke(); }
    else { const dy = eyes === "down" ? 2 : 0; c.beginPath(); c.ellipse(x, -263 + dy, 2.3 * w, 2.8, 0, 0, TAU); c.fill(); c.fillStyle = "#fff6e6"; c.beginPath(); c.arc(x + 0.6, -264.2 + dy, 0.8, 0, TAU); c.fill(); c.fillStyle = "#2a1a10"; }
    // brows: the mood is mostly here
    const tilt = mood === "sad" || mood === "worried" ? (x < 12 ? 2.5 : -2.5) * -1 : mood === "awe" ? -1.5 : 0; c.lineWidth = 1.5; c.strokeStyle = darken(hair, 0.1); c.beginPath(); c.moveTo(x - 4 * w, -269 - (mood === "awe" ? 2 : 0) + tilt * (x < 12 ? 1 : -1) * 0.5); c.lineTo(x + 4 * w, -270 - (mood === "awe" ? 2 : 0) - tilt * 0.5); c.stroke(); c.strokeStyle = "#2a1a10";
  }
  stroke(c, [[23, -262], [27, -255], [22, -252]], 2.4, 1.6, sk2, 0.9); // the nose on the near profile
  c.lineWidth = 1.5; c.strokeStyle = "#8a3a2a"; c.beginPath();
  if (mood === "smile" || mood === "calm") { c.moveTo(9, -246); c.quadraticCurveTo(15, mood === "smile" ? -241 : -243.5, 20, -246); }
  else if (mood === "awe") { c.ellipse(15, -245, 2.4, 3, 0, 0, TAU); }
  else { c.moveTo(9, -243); c.quadraticCurveTo(15, -246.5, 20, -243); }
  c.stroke();
  outline(c, head, 61, 0.35);
  const hand = arm(true);
  if (F.holding) { const R = 9; c.fillStyle = F.holding; c.beginPath(); c.arc(hand[0] + 4, hand[1] - 4, R, 0, TAU); c.fill(); c.fillStyle = darken(F.holding, 0.3); c.beginPath(); c.arc(hand[0] + 6, hand[1] - 2, R * 0.7, 0.2, 1.9); c.fill(); c.fillStyle = "#fff6e0"; c.beginPath(); c.arc(hand[0] + 1, hand[1] - 7, 2.5, 0, TAU); c.fill(); stroke(c, [[hand[0] + 4, hand[1] - 13], [hand[0] + 6, hand[1] - 19]], 2, 1, "#5a3a1a", 1); }
  if (out === "none") c.restore();
  c.restore();
  return hand;
};

// ================================================================ ANIMALS
export type Beast = "lion" | "deer" | "sheep" | "rabbit" | "elephant" | "horse";
type Spec = { body: P[]; col: string; shade: string; hips: [P, P]; legL: number; legW: [number, number]; legCol?: string; head: (c: Ctx, t: number) => void; tail?: (c: Ctx, t: number) => void; belly?: string };
const SPECS: Record<Beast, Spec> = {
  lion: {
    body: [[-88, -116], [-40, -128], [20, -126], [60, -120], [80, -100], [76, -74], [50, -62], [-10, -64], [-70, -66], [-92, -80], [-98, -100]], col: "#dba24a", shade: "#a8742c", hips: [[-62, -80], [52, -80]], legL: 72, legW: [20, 13], belly: "#f0cf8a",
    head: (c, t) => {
      const mane = blobPts(88, -122, 50, 50, 811, 12); G(c, mane, "#9a5a20", { tex: { cols: ["#c47a2c", "#6a3a12"], n: 70, len: 18, w: 3, ang: 0.8, jit: 3, a: 0.5 }, rim: "#5a2e0e", rimA: 0.5 });
      const face: P[] = [[80, -150], [100, -152], [118, -140], [126, -122], [120, -104], [102, -96], [86, -104], [78, -122]]; G(c, face, "#e6b45e", { tex: { cols: ["#f4d08a", "#b8822e"], n: 20, len: 8, w: 2, ang: 1, a: 0.35 }, rim: "#8a5a1e", rimA: 0.5 });
      G(c, [[110, -118], [128, -118], [128, -104], [114, -102]], "#f2dcaa"); c.fillStyle = "#3a2010"; c.beginPath(); c.moveTo(118, -126); c.lineTo(128, -126); c.lineTo(123, -119); c.fill();
      c.beginPath(); c.ellipse(106, -134, 2.6, 3, 0, 0, TAU); c.fill(); stroke(c, [[100, -140], [106, -141], [112, -139]], 1.6, 1, "#5a2e0e", 0.8);
      c.strokeStyle = "#5a2e0e"; c.lineWidth = 1.4; c.beginPath(); c.moveTo(114, -106); c.quadraticCurveTo(120, -103, 124, -107); c.stroke(); void t;
    },
    tail: (c, t) => { const w = Math.sin(t * 2) * 8; stroke(c, [[-94, -100], [-118, -84], [-126, -62 + w * 0.3], [-132 + w, -48]], 6, 3, "#c48c3a", 1); G(c, blobPts(-133 + w, -44, 9, 11, 812, 7), "#7a4416"); },
  },
  horse: {
    body: [[-90, -170], [-40, -180], [30, -178], [70, -168], [84, -146], [74, -122], [40, -112], [-30, -112], [-80, -118], [-98, -140]], col: "#8a5634", shade: "#5e3820", hips: [[-66, -120], [56, -120]], legL: 116, legW: [18, 10], legCol: "#7a4a2c",
    head: (c, t) => {
      const nod = Math.sin(t * 1.5) * 3; G(c, [[58, -170], [82, -224 + nod], [100, -236 + nod], [108, -222 + nod], [86, -176], [76, -146]], "#8a5634", { tex: { cols: ["#a8704a", "#5e3820"], n: 20, len: 14, w: 3, ang: -1, a: 0.35 }, rim: "#3e2412", rimA: 0.5 });
      G(c, [[92, -240 + nod], [108, -246 + nod], [140, -214 + nod], [142, -200 + nod], [128, -196 + nod], [104, -214 + nod]], "#8a5634", { rim: "#3e2412", rimA: 0.5 });
      G(c, [[96, -244 + nod], [100, -262 + nod], [106, -244 + nod]], "#6e4228");
      G(c, [[56, -176], [74, -222 + nod], [90, -244 + nod], [84, -226 + nod], [68, -180]], "#2e1c10", { tex: { cols: ["#4a3020"], n: 14, len: 14, w: 2, ang: -1.1, a: 0.5 } });
      c.fillStyle = "#1a0e06"; c.beginPath(); c.ellipse(112, -228 + nod, 2.6, 3, 0, 0, TAU); c.fill(); c.beginPath(); c.ellipse(136, -206 + nod, 2, 1.5, 0.5, 0, TAU); c.fill();
    },
    tail: (c, t) => { const w = Math.sin(t * 1.8) * 6; stroke(c, [[-96, -160], [-114, -140], [-118 + w, -100], [-112 + w, -78]], 14, 4, "#2e1c10", 1); },
  },
  deer: {
    body: [[-72, -150], [-20, -158], [40, -156], [66, -146], [70, -126], [50, -114], [-20, -112], [-62, -116], [-80, -132]], col: "#b5733f", shade: "#8a5228", hips: [[-56, -118], [50, -118]], legL: 118, legW: [12, 6], belly: "#f2e2c8",
    head: (c, t) => {
      const look = Math.sin(t * 0.7) * 4;
      G(c, [[44, -150], [64, -200], [82, -216 + look], [94, -202 + look], [72, -140]], "#b5733f", { tex: { cols: ["#d08e54", "#8a5228"], n: 16, len: 12, w: 2.5, ang: -1.1, a: 0.35 }, rim: "#5a3416", rimA: 0.5 });
      G(c, [[80, -222 + look], [96, -228 + look], [122, -214 + look], [128, -206 + look], [118, -200 + look], [96, -200 + look], [84, -206 + look]], "#b5733f", { rim: "#5a3416", rimA: 0.5 });
      G(c, [[82, -224 + look], [70, -238 + look], [76, -240 + look], [90, -226 + look]], "#9a5e30");
      for (const [dx, sgn] of [[0, 1], [8, -1]] as P[]) { stroke(c, [[88 + dx, -226 + look], [84 + dx, -252 + look], [76 + dx + sgn * 2, -274 + look]], 4, 2, "#e8d4b0", 1); stroke(c, [[85 + dx, -246 + look], [96 + dx, -262 + look]], 3, 1.5, "#e8d4b0", 1); stroke(c, [[82 + dx, -262 + look], [70 + dx, -276 + look]], 2.6, 1.2, "#e8d4b0", 1); }
      c.fillStyle = "#1a0e06"; c.beginPath(); c.ellipse(104, -214 + look, 2.6, 3, 0, 0, TAU); c.fill(); c.beginPath(); c.arc(127, -206 + look, 2.6, 0, TAU); c.fill();
      const r = rng(813); c.fillStyle = "#f4e6cc"; for (let i = 0; i < 12; i++) { c.globalAlpha = 0.8; c.beginPath(); c.arc(-60 + r() * 100, -150 + r() * 22, 2.4, 0, TAU); c.fill(); } c.globalAlpha = 1;
    },
    tail: (c) => { G(c, [[-78, -146], [-92, -150], [-90, -136], [-80, -134]], "#f4e6cc", { rim: "#8a5228", rimA: 0.5 }); },
  },
  sheep: {
    body: blobPts(0, -74, 66, 40, 821, 12), col: "#f3ede0", shade: "#cfc6b4", hips: [[-40, -48], [38, -48]], legL: 46, legW: [8, 6], legCol: "#3a3030",
    head: (c, t) => { const nod = Math.sin(t * 1.1) * 3; G(c, [[54, -96 + nod], [74, -104 + nod], [92, -92 + nod], [94, -74 + nod], [82, -64 + nod], [64, -70 + nod]], "#3a3030", { rim: "#1a1414", rimA: 0.5 }); G(c, [[58, -98 + nod], [44, -92 + nod], [50, -86 + nod]], "#3a3030"); c.fillStyle = "#fff6e6"; c.beginPath(); c.arc(80, -88 + nod, 2.2, 0, TAU); c.fill(); G(c, blobPts(60, -106 + nod, 16, 10, 822, 8), "#f8f4ea"); },
    tail: (c) => G(c, blobPts(-66, -84, 10, 9, 823, 7), "#f3ede0"),
  },
  rabbit: {
    body: blobPts(0, -34, 34, 26, 831, 9), col: "#a99582", shade: "#7e6c5a", hips: [[-18, -16], [18, -14]], legL: 16, legW: [9, 6],
    head: (c, t) => { const tw = Math.sin(t * 6) * 0.08; G(c, [[22, -66], [34, -70], [48, -60], [50, -48], [40, -40], [26, -44], [20, -54]], "#a99582", { rim: "#5a4a3a", rimA: 0.5 }); for (const [dx, a] of [[0, -0.15 + tw], [8, 0.1 - tw]] as P[]) { c.save(); c.translate(30 + dx, -66); c.rotate(a); G(c, [[-5, 0], [-6, -26], [-2, -42], [3, -40], [5, -24], [4, 0]], "#a99582", { rim: "#5a4a3a", rimA: 0.5 }); G(c, [[-2, -4], [-3, -24], [0, -34], [2, -24], [1, -4]], "#e8b0a8"); c.restore(); } c.fillStyle = "#1a0e06"; c.beginPath(); c.arc(40, -56, 2.4, 0, TAU); c.fill(); c.fillStyle = "#c86a6a"; c.beginPath(); c.arc(50, -50, 2, 0, TAU); c.fill(); },
    tail: (c) => G(c, blobPts(-34, -38, 8, 8, 832, 7), "#f8f4ea"),
  },
  elephant: {
    body: [[-102, -204], [-30, -222], [50, -216], [96, -194], [106, -154], [96, -112], [-92, -112], [-114, -152]], col: "#8f8c96", shade: "#6a6872", hips: [[-70, -116], [62, -116]], legL: 112, legW: [36, 30],
    head: (c, t) => {
      const sw = Math.sin(t * 1.2) * 10;
      G(c, [[78, -220], [122, -214], [142, -184], [140, -150], [122, -130], [94, -140]], "#8f8c96", { tex: { cols: ["#a8a6ae", "#6a6872"], n: 30, len: 16, w: 3, ang: 0.3, a: 0.3 }, rim: "#44424a", rimA: 0.5 });
      stroke(c, [[134, -152], [146, -110], [150 + sw * 0.4, -70], [140 + sw, -46], [128 + sw, -50]], 24, 9, "#8a8790", 1);
      for (let k = 0; k < 6; k++) stroke(c, [[136 + k * 0.5, -134 + k * 12], [148 + k * 0.4, -134 + k * 12]], 1.2, 0.6, "#5a5862", 0.6);
      G(c, [[92, -206], [60, -196], [52, -150], [74, -122], [100, -144]], "#7e7b86", { tex: { cols: ["#9a98a2", "#5a5862"], n: 20, len: 14, w: 3, ang: 1.2, a: 0.3 }, rim: "#44424a", rimA: 0.5 });
      stroke(c, [[128, -140], [140, -126], [150, -128]], 7, 3, "#f4eedc", 1);
      c.fillStyle = "#1a1416"; c.beginPath(); c.ellipse(118, -186, 2.6, 3, 0, 0, TAU); c.fill();
    },
    tail: (c, t) => { const w = Math.sin(t * 2.2) * 6; stroke(c, [[-110, -170], [-122, -140], [-122 + w, -112]], 5, 2, "#7e7b86", 1); },
  },
};
export type Animal = { kind: Beast; x: number; y: number; s: number; facing?: number; walk?: number; t: number };
export const animal = (c: Ctx, A: Animal) => {
  const S = SPECS[A.kind], f = A.facing ?? 1, ph = A.walk, walking = ph !== undefined, hop = A.kind === "rabbit" && walking ? -Math.abs(Math.sin(ph!)) * 22 : walking ? -Math.abs(Math.sin(ph! * 2)) * 2 : 0;
  c.save(); c.globalAlpha = 0.25; c.fillStyle = "#2f3d15"; c.beginPath(); c.ellipse(A.x, A.y + 2, 90 * A.s * (A.kind === "rabbit" ? 0.4 : A.kind === "elephant" ? 1.3 : 1), 9 * A.s, 0, 0, TAU); c.fill(); c.restore(); c.globalAlpha = 1;
  place(c, A.x, A.y + hop * A.s, A.s, f);
  const leg = (hip: P, phase: number, far: boolean) => {
    const sw = walking ? Math.sin(phase) * (A.kind === "rabbit" ? 0.6 : 0.38) : 0, knee = walking ? Math.max(0, Math.sin(phase + 1.3)) * 0.5 : 0, L = S.legL - (A.y === 0 ? 0 : 0) + (-hip[1] - S.legL) * 0 , [k, ft] = seg2(hip, sw, (-hip[1]) * 0.5, -knee, (-hip[1]) * 0.5), col = far ? darken(S.legCol ?? S.col, 0.18) : S.legCol ?? S.col;
    void L; limb(c, [hip, k, ft], S.legW[0], S.legW[1], col, 900 + Math.round(hip[0]), 0, 1, 0.3, 0);
    if (A.kind === "elephant") G(c, [[ft[0] - 16, ft[1] - 6], [ft[0] + 16, ft[1] - 6], [ft[0] + 18, ft[1] + 1], [ft[0] - 18, ft[1] + 1]], darken(col, 0.1));
    else if (A.kind === "deer" || A.kind === "horse" || A.kind === "sheep") G(c, [[ft[0] - 5, ft[1] - 7], [ft[0] + 6, ft[1] - 7], [ft[0] + 7, ft[1] + 1], [ft[0] - 6, ft[1] + 1]], "#2a1e16");
  };
  const p0 = ph ?? 0;
  leg([S.hips[0][0] + 8, S.hips[0][1]], p0 + Math.PI, true); leg([S.hips[1][0] + 8, S.hips[1][1]], p0, true);
  S.tail?.(c, A.t);
  G(c, S.body, S.col, { seed: 950, tex: { cols: [lighten(S.col, 0.18), S.shade], n: 60, len: 22, w: 3.5, ang: 0.15, jit: 0.4, a: 0.35 }, rim: darken(S.shade, 0.3), rimA: 0.5, rimW: 1.4 });
  c.save(); trace(c, S.body); c.clip(); c.globalAlpha = 0.45; c.fillStyle = S.shade; c.fillRect(-200, -60 - 44 + (S.hips[0][1] + 40) * 0.6, 400, 200); if (S.belly) { c.globalAlpha = 0.5; c.fillStyle = S.belly; c.fillRect(-200, S.hips[0][1] + 6, 400, 30); } c.restore(); c.globalAlpha = 1;
  outline(c, S.body, 951, 0.35);
  leg(S.hips[0], p0, false); leg(S.hips[1], p0 + Math.PI, false);
  S.head(c, A.t);
  c.restore();
};

// ================================================================ BIRDS AND FISH
export const bird = (c: Ctx, x: number, y: number, s: number, flap: number, col = "#f4f0e6", facing = 1) => {
  place(c, x, y, s, facing);
  const up = Math.sin(flap), wing = (far: boolean) => { const tipY = -up * 26 * (far ? 0.8 : 1), mid = -up * 10; G(c, [[-6, -2], [4, -3], [-2 + (far ? 4 : 0), mid - 4], [-16, tipY], [-22, tipY + 4], [-14, mid + 4]], far ? darken(col, 0.18) : col, { rim: darken(col, 0.5), rimA: 0.4, rimW: 1 }); };
  wing(true);
  G(c, [[-22, 0], [-8, -6], [10, -6], [20, -3], [26, -1], [20, 3], [4, 5], [-14, 3], [-28, 6], [-26, -2]], col, { rim: darken(col, 0.5), rimA: 0.45, rimW: 1 });
  c.fillStyle = "#e0a030"; c.beginPath(); c.moveTo(25, -3); c.lineTo(31, -1); c.lineTo(25, 1); c.fill(); c.fillStyle = "#1a1410"; c.beginPath(); c.arc(19, -3, 1.4, 0, TAU); c.fill();
  wing(false);
  c.restore();
};
export const fish = (c: Ctx, x: number, y: number, s: number, t: number, col: string, facing = 1, rot = 0) => {
  place(c, x, y, s, facing, rot); const w = Math.sin(t * 8) * 0.25;
  c.save(); c.translate(-26, 0); c.rotate(w); G(c, [[2, 0], [-18, -14], [-14, 0], [-18, 14]], darken(col, 0.15), { rim: darken(col, 0.5), rimA: 0.5, rimW: 1 }); c.restore();
  const body: P[] = [[-28, 0], [-14, -12], [6, -15], [22, -9], [30, 0], [22, 8], [4, 12], [-14, 9]];
  G(c, body, col, { tex: { cols: [lighten(col, 0.3), darken(col, 0.2)], n: 12, len: 10, w: 2, ang: 0, a: 0.4 }, rim: darken(col, 0.5), rimA: 0.5, rimW: 1 });
  G(c, [[-6, -13], [4, -22], [12, -14]], darken(col, 0.2)); c.fillStyle = "#fff8e8"; c.beginPath(); c.arc(20, -3, 3, 0, TAU); c.fill(); c.fillStyle = "#1a1410"; c.beginPath(); c.arc(21, -3, 1.6, 0, TAU); c.fill();
  c.strokeStyle = darken(col, 0.4); c.lineWidth = 1; c.globalAlpha = 0.5; c.beginPath(); c.moveTo(12, -10); c.quadraticCurveTo(8, 0, 12, 8); c.stroke(); c.globalAlpha = 1;
  c.restore();
};

// ================================================================ THE SERPENT
// A body laid along a path with a travelling wave, darker back, scales banded; the head at the
// path's end, an eye, and a tongue that flicks on its own rhythm.
export const serpent = (c: Ctx, path: P[], t: number, o: { w?: number; amp?: number; speed?: number; p?: number; col?: string; dust?: boolean } = {}) => {
  const w = o.w ?? 18, amp = o.amp ?? 6, col = o.col ?? "#4f8a2e", p = o.p ?? 1, n = 60, pts: P[] = [];
  const tot: number[] = [0]; for (let i = 1; i < path.length; i++) tot.push(tot[i - 1] + Math.hypot(path[i][0] - path[i - 1][0], path[i][1] - path[i - 1][1]));
  const at = (u: number): [P, P] => { const L = tot[tot.length - 1] * u; let i = 1; while (i < tot.length - 1 && tot[i] < L) i++; const f = (L - tot[i - 1]) / Math.max(1e-6, tot[i] - tot[i - 1]), a = lp(path[i - 1], path[i], clamp(f)), dx = path[i][0] - path[i - 1][0], dy = path[i][1] - path[i - 1][1], l = Math.hypot(dx, dy) || 1; return [a, [dx / l, dy / l]]; };
  for (let i = 0; i <= n; i++) { const u = (i / n) * p, [a, [dx, dy]] = at(u), wv = Math.sin(u * 18 - t * (o.speed ?? 3)) * amp * Math.sin(Math.PI * Math.min(1, u * 1.2)); pts.push([a[0] - dy * wv, a[1] + dx * wv]); }
  stroke(c, pts, w * 0.25, w, darken(col, 0.25), 1, 1, 2);
  stroke(c, pts.map(([x, y]) => [x - 1, y - w * 0.15] as P), w * 0.18, w * 0.7, col, 1, 1, 2);
  for (let i = 4; i < n - 2; i += 3) { const [x, y] = pts[i], k = i / n; c.globalAlpha = 0.85; c.fillStyle = i % 2 ? "#e6c94a" : darken(col, 0.4); c.beginPath(); c.ellipse(x, y - w * 0.12, w * 0.22 * (0.3 + k), w * 0.14 * (0.3 + k), 0, 0, TAU); c.fill(); }
  c.globalAlpha = 1;
  const hd = pts[n], prev = pts[n - 3], ang = Math.atan2(hd[1] - prev[1], hd[0] - prev[0]);
  c.save(); c.translate(hd[0], hd[1]); c.rotate(ang);
  const flick = Math.max(0, Math.sin(t * 5)) ** 3; if (flick > 0.1) { c.strokeStyle = "#c8322a"; c.lineWidth = 1.6; c.beginPath(); c.moveTo(w * 1.2, 0); c.lineTo(w * 1.2 + 14 * flick, 0); c.lineTo(w * 1.2 + 19 * flick, -4); c.moveTo(w * 1.2 + 14 * flick, 0); c.lineTo(w * 1.2 + 19 * flick, 4); c.stroke(); }
  G(c, [[-w * 0.4, -w * 0.5], [w * 0.5, -w * 0.62], [w * 1.2, -w * 0.25], [w * 1.25, w * 0.15], [w * 0.5, w * 0.5], [-w * 0.4, w * 0.45]], col, { rim: darken(col, 0.5), rimA: 0.6, rimW: 1 });
  c.fillStyle = "#f2d24a"; c.beginPath(); c.ellipse(w * 0.55, -w * 0.25, w * 0.2, w * 0.16, 0, 0, TAU); c.fill(); c.fillStyle = "#1a1008"; c.beginPath(); c.ellipse(w * 0.58, -w * 0.25, w * 0.06, w * 0.14, 0, 0, TAU); c.fill();
  c.restore();
};

// ================================================================ CHERUB AND THE FLAMING SWORD
export const cherub = (c: Ctx, x: number, y: number, s: number, t: number, facing = 1) => {
  const g = c.createRadialGradient(x, y - 200 * s, 0, x, y - 200 * s, 320 * s); g.addColorStop(0, rgba("#fff0b8", 0.55)); g.addColorStop(1, rgba("#fff0b8", 0)); c.fillStyle = g; c.fillRect(x - 330 * s, y - 530 * s, 660 * s, 660 * s);
  place(c, x, y + Math.sin(t * 1.2) * 4 * s, s, facing);
  const beat = Math.sin(t * 1.6) * 0.06;
  for (const side of [-1, 1]) { // two great wings raised behind, feather by feather
    c.save(); c.translate(side * 16, -230); c.rotate(side * (0.25 + beat)); c.scale(side, 1);
    for (let k = 0; k < 9; k++) { const a = -1.75 + k * 0.17, L = 230 - k * 12, pts: P[] = [[0, 0], [Math.cos(a - 0.08) * L * 0.5, Math.sin(a - 0.08) * L * 0.5], [Math.cos(a) * L, Math.sin(a) * L], [Math.cos(a + 0.1) * L * 0.55, Math.sin(a + 0.1) * L * 0.55]]; G(c, pts, mix("#f6dc84", "#fff6dc", k / 9), { rim: "#b88a2a", rimA: 0.5, rimW: 1 }); }
    c.restore();
  }
  const robe: P[] = [[-20, -232], [20, -232], [34, -200], [40, -120], [52, -10], [30, 0], [0, -6], [-30, 0], [-52, -10], [-40, -120], [-34, -200]];
  G(c, robe, "#fbf1d2", { tex: { cols: ["#ffffff", "#e8cf86"], n: 50, len: 60, w: 3, ang: 1.6, jit: 0.2, a: 0.4 }, rim: "#c8a048", rimA: 0.5 });
  for (const k of [-18, 0, 18]) stroke(c, [[k * 0.6, -200], [k * 0.9, -110], [k * 1.4, -8]], 3, 2, "#e2c472", 0.6);
  G(c, [[-34, -150], [34, -150], [34, -140], [-34, -140]], "#d8a838", { rim: "#8a6a1a", rimA: 0.5 });
  const head: P[] = [[0, -292], [14, -288], [22, -274], [21, -256], [12, -244], [0, -241], [-12, -244], [-21, -256], [-22, -274], [-14, -288]];
  G(c, head, "#f2d2a6", { rim: "#b88a5a", rimA: 0.5 });
  G(c, [[-22, -262], [-24, -282], [-12, -298], [6, -300], [20, -292], [26, -276], [22, -262], [16, -280], [0, -286], [-14, -278]], "#e8b84a", { tex: { cols: ["#f8dc7a", "#b88a2a"], n: 30, len: 8, w: 2, ang: 0.5, jit: 2, a: 0.5 }, rim: "#9a6e1a", rimA: 0.5 });
  c.fillStyle = "#2a1a10"; for (const ex of [-7, 8]) { c.beginPath(); c.ellipse(ex, -266, 2, 2.6, 0, 0, TAU); c.fill(); }
  c.strokeStyle = "#8a4a2a"; c.lineWidth = 1.4; c.beginPath(); c.moveTo(-5, -252); c.lineTo(5, -252); c.stroke();
  c.restore();
};
// the sword "que andava ao redor": a blade of fire turning about its hilt
export const flamingSword = (c: Ctx, x: number, y: number, s: number, t: number) => {
  const a = t * 1.6, g = c.createRadialGradient(x, y, 0, x, y, 200 * s); g.addColorStop(0, rgba("#ffcf5a", 0.5)); g.addColorStop(1, rgba("#ff8a2a", 0)); c.fillStyle = g; c.fillRect(x - 200 * s, y - 200 * s, 400 * s, 400 * s);
  c.save(); c.translate(x, y); c.rotate(a); c.scale(s, s);
  const flick = Math.floor(t * 12), r = rng(flick);
  for (let i = 0; i < 18; i++) { const u = i / 18, len = 150 * (1 - u * 0.2), off = (r() - 0.5) * 16, fl = 18 + r() * 26; c.globalAlpha = 0.8; c.fillStyle = i % 3 ? "#ff9a2a" : "#ffd24a"; c.beginPath(); c.moveTo(-6 + off * 0.3, -20 - u * len); c.quadraticCurveTo(-14 + off, -20 - u * len - fl * 0.6, off * 0.6, -20 - u * len - fl); c.quadraticCurveTo(14 + off, -20 - u * len - fl * 0.5, 6, -20 - u * len); c.fill(); }
  c.globalAlpha = 1; G(c, [[-5, -20], [5, -20], [3, -180], [0, -196], [-3, -180]], "#fff3c8", { rim: "#e8902a", rimA: 0.6 });
  G(c, [[-26, -22], [26, -22], [26, -14], [-26, -14]], "#c8962a", { rim: "#6a4a10", rimA: 0.6 }); G(c, [[-5, -14], [5, -14], [5, 22], [-5, 22]], "#6a4422"); G(c, blobPts(0, 26, 8, 8, 991, 6), "#c8962a");
  c.restore();
};
