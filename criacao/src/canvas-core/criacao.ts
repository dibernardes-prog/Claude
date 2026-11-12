// A CRIAÇÃO — Gênesis 1, 2 e 3. A storybook film (folk-tale gouache over pencil), 16:9, 24 fps.
// Text: Almeida Revista e Corrigida. God is light and voice, never a figure.
//
// Story in three sentences: In the dark over the waters God says "Haja luz", and the page draws
// itself day by day into a world that is very good. In the garden the serpent, the fruit, the
// opened eyes and the hiding. Outside Eden, clothed by God and guarded from the tree of life by the
// cherubim and the turning sword, the couple walk on with the light of the promise (Gn 3:15).
// Token: the light of day one (the opening, the tree of life, the sword's fire, the closing star).
import type { Ctx, Env, P } from "./core";
import type { Film } from "./film";
import { H, TAU, W, baked, bush, butterflies, limb, caption, clamp, cloud, darken, ease, eio, flower, glory, gouache, hill, label, lerp, lighten, made, mix, moon, paper, pencil, reveal, rgba, river, sea, skyWash, stars, stroke, sunDisc, tint, tree, tuft, wipeCover, win, type Tree } from "./criacaoKit";
import { animal, bird, cherub, fish, flamingSword, person, serpent, type Beast } from "./criacaoBeings";
import { criacaoAudio } from "./criacaoScore";

const FPS = 24, BPM = 72, BEAT = (60 / BPM) * FPS; // 20 frames
// ---------------------------------------------------------------- the cut, in beats (one cue table)
const CUT: [id: string, beats: number][] = [
  ["titulo", 10], ["criacao", 86], ["adao", 18], ["descanso", 12], ["eden", 19], ["eva", 17], ["serpente", 19], ["queda", 15], ["promessa", 15], ["expulsao", 20],
];
const START: Record<string, number> = {}; let acc = 0; for (const [id, b] of CUT) { START[id] = acc; acc += b * BEAT; }
const DURATION = acc;
const len = (id: string) => (CUT.find((c) => c[0] === id)![1] * BEAT) / FPS; // seconds

// ---------------------------------------------------------------- the verses (ARC)
const V = {
  g1_1: ["No princípio, criou Deus os céus e a terra.", "Gênesis 1:1"],
  g1_2: ["E a terra era sem forma e vazia; e havia trevas sobre a face do abismo; e o Espírito de Deus se movia sobre a face das águas.", "Gênesis 1:2"],
  g1_3: ["E disse Deus: Haja luz. E houve luz.", "Gênesis 1:3"],
  g1_6: ["E disse Deus: Haja uma expansão no meio das águas, e haja separação entre águas e águas.", "Gênesis 1:6"],
  g1_9: ["E disse Deus: Ajuntem-se as águas debaixo dos céus num lugar; e apareça a porção seca. E assim foi.", "Gênesis 1:9"],
  g1_11: ["E disse Deus: Produza a terra erva verde, erva que dê semente, árvore frutífera que dê fruto segundo a sua espécie.", "Gênesis 1:11"],
  g1_16: ["E fez Deus os dois grandes luminares: o luminar maior para governar o dia, e o luminar menor para governar a noite; e fez as estrelas.", "Gênesis 1:16"],
  g1_20: ["E disse Deus: Produzam as águas abundantemente répteis de alma vivente; e voem as aves sobre a face da expansão dos céus.", "Gênesis 1:20"],
  g1_24: ["E disse Deus: Produza a terra alma vivente conforme a sua espécie; gado, e répteis, e bestas-feras da terra. E assim foi.", "Gênesis 1:24"],
  g2_7: ["E formou o Senhor Deus o homem do pó da terra e soprou em seus narizes o fôlego da vida; e o homem foi feito alma vivente.", "Gênesis 2:7"],
  g1_27: ["E criou Deus o homem à sua imagem; à imagem de Deus o criou; macho e fêmea os criou.", "Gênesis 1:27"],
  g1_31: ["E viu Deus tudo quanto tinha feito, e eis que era muito bom.", "Gênesis 1:31"],
  g2_2: ["E, havendo Deus acabado no dia sétimo a sua obra, que tinha feito, descansou no sétimo dia de toda a sua obra.", "Gênesis 2:2"],
  g2_8: ["E plantou o Senhor Deus um jardim no Éden, da banda do oriente, e pôs ali o homem que tinha formado.", "Gênesis 2:8"],
  g2_9: ["...e a árvore da vida no meio do jardim, e a árvore da ciência do bem e do mal.", "Gênesis 2:9"],
  g2_17: ["Mas da árvore da ciência do bem e do mal, dela não comerás; porque, no dia em que dela comeres, certamente morrerás.", "Gênesis 2:17"],
  g2_18: ["E disse o Senhor Deus: Não é bom que o homem esteja só; far-lhe-ei uma adjutora que esteja como diante dele.", "Gênesis 2:18"],
  g2_20: ["E Adão pôs os nomes a todo o gado, e às aves dos céus, e a todo animal do campo.", "Gênesis 2:20"],
  g2_22: ["E da costela que o Senhor Deus tomou do homem formou uma mulher; e trouxe-a a Adão.", "Gênesis 2:22"],
  g3_1: ["Ora, a serpente era mais astuta que todas as alimárias do campo que o Senhor Deus tinha feito.", "Gênesis 3:1"],
  g3_4: ["Então, a serpente disse à mulher: Certamente não morrereis... sereis como Deus, sabendo o bem e o mal.", "Gênesis 3:4-5"],
  g3_6: ["...tomou do seu fruto, e comeu, e deu também a seu marido, e ele comeu com ela.", "Gênesis 3:6"],
  g3_7: ["Então, foram abertos os olhos de ambos, e conheceram que estavam nus; e coseram folhas de figueira, e fizeram para si aventais.", "Gênesis 3:7"],
  g3_9: ["E chamou o Senhor Deus a Adão e disse-lhe: Onde estás?", "Gênesis 3:9"],
  g3_15: ["E porei inimizade entre ti e a mulher e entre a tua semente e a sua semente; esta te ferirá a cabeça, e tu lhe ferirás o calcanhar.", "Gênesis 3:15"],
  g3_21: ["E fez o Senhor Deus a Adão e à sua mulher túnicas de peles e os vestiu.", "Gênesis 3:21"],
  g3_24: ["E, havendo lançado fora o homem, pôs querubins ao oriente do jardim do Éden e uma espada inflamada que andava ao redor, para guardar o caminho da árvore da vida.", "Gênesis 3:24"],
} as const;
type VK = keyof typeof V;
// every caption: [shot, from s, to s, verse]
const CAPS: [string, number, number, VK][] = [
  ["titulo", 3.6, 8.2, "g1_1"],
  ["criacao", 0.6, 6.4, "g1_2"], ["criacao", 6.8, 11.6, "g1_3"], ["criacao", 12.4, 21.4, "g1_6"], ["criacao", 22.4, 29.2, "g1_9"], ["criacao", 29.6, 37.4, "g1_11"],
  ["criacao", 38.4, 49.4, "g1_16"], ["criacao", 50.4, 60.4, "g1_20"], ["criacao", 61.4, 71.0, "g1_24"],
  ["adao", 1.4, 8.2, "g2_7"], ["adao", 8.6, 14.4, "g1_27"],
  ["descanso", 1.2, 5.0, "g1_31"], ["descanso", 5.2, 9.4, "g2_2"],
  ["eden", 1.4, 6.0, "g2_8"], ["eden", 6.2, 10.4, "g2_9"], ["eden", 10.6, 15.2, "g2_17"],
  ["eva", 0.8, 4.8, "g2_18"], ["eva", 5.0, 8.8, "g2_20"], ["eva", 9.2, 13.6, "g2_22"],
  ["serpente", 1.0, 5.2, "g3_1"], ["serpente", 5.4, 10.2, "g3_4"], ["serpente", 10.4, 15.2, "g3_6"],
  ["queda", 0.8, 6.6, "g3_7"], ["queda", 6.8, 12.0, "g3_9"],
  ["promessa", 0.8, 6.8, "g3_15"], ["promessa", 7.0, 12.0, "g3_21"],
  ["expulsao", 1.0, 8.2, "g3_24"],
];
const captionsFor = (c: Ctx, shot: string, t: number) => { for (const [s, a, b, k] of CAPS) if (s === shot) caption(c, t, a, b, V[k][0], V[k][1]); };

// ---------------------------------------------------------------- scene changes
// The last 0.7 s of a shot is covered by a wash of paper; the next one is painted in over 1.2 s.
const COVER = 0.7, PAINT = 1.2;
const painted = (c: Ctx, t: number, seed: number, draw: () => void) => { if (t >= PAINT) { draw(); return; } reveal(c, [-60, -60, W + 60, H + 60], 0.1, eio(t, 0, PAINT), seed, draw); };
const shot = (id: string, body: (c: Ctx, t: number, env: Env, gt: number) => void, cover = true) => ({
  id, start: START[id], end: START[id] + CUT.find((x) => x[0] === id)![1] * BEAT,
  draw: (c: Ctx, local: number, env: Env) => {
    const t = local / FPS, gt = (START[id] + local) / FPS, L = len(id);
    c.setTransform(env.scale, 0, 0, env.scale, 0, 0); paper(c, env); c.setTransform(env.scale, 0, 0, env.scale, 0, 0);
    body(c, t, env, gt);
    c.setTransform(env.scale, 0, 0, env.scale, 0, 0);
    if (cover) wipeCover(c, env, win(t, L - COVER, COVER - 0.05), START[id] + 7);
  },
});

// ================================================================ THE WORLD OF THE SIX DAYS
// One world, drawn by its own creation. T = seconds into the creation shot, gt = film seconds (ambient motion).
const FAR: P[] = [[620, 612], [700, 590], [820, 562], [960, 550], [1100, 566], [1240, 540], [1400, 522], [1560, 536], [1720, 516], [1920, 530]];
const MID: P[] = [[250, 1010], [370, 890], [460, 772], [560, 700], [720, 656], [880, 646], [1040, 656], [1200, 636], [1380, 626], [1560, 638], [1740, 622], [1920, 628]];
const FRONT: P[] = [[0, 982], [200, 970], [420, 976], [640, 962], [860, 972], [1100, 958], [1360, 966], [1600, 954], [1920, 962]];
const TREES: (Tree & { at: number })[] = [
  { x: 760, y: 606, s: 0.2, seed: 21, d: 0.6, at: 30.0 }, { x: 905, y: 588, s: 0.22, seed: 22, d: 0.6, at: 30.4 }, { x: 1150, y: 584, s: 0.2, seed: 23, d: 0.6, at: 30.8 }, { x: 1480, y: 562, s: 0.24, seed: 24, d: 0.6, at: 31.1 }, { x: 1660, y: 560, s: 0.2, seed: 25, d: 0.6, at: 31.4 },
  { x: 1010, y: 700, s: 0.62, seed: 31, d: 0.2, at: 30.2, fruit: "#e2762a", fruitN: 10 }, { x: 1270, y: 680, s: 0.46, seed: 32, d: 0.2, at: 31.0, shape: "tall" }, { x: 1590, y: 676, s: 0.7, seed: 33, d: 0.2, at: 31.8, fruit: "#d23a2a", fruitN: 12 }, { x: 1850, y: 668, s: 0.52, seed: 34, d: 0.2, at: 32.4, shape: "wide" },
  { x: 1790, y: 1010, s: 1.3, seed: 41, d: 0, at: 33.0, fruit: "#f0a02a", fruitN: 14 },
];
const BEASTS: { kind: Beast; x: number; y: number; s: number; at: number; f?: number }[] = [
  { kind: "elephant", x: 1690, y: 770, s: 0.5, at: 62.0 }, { kind: "horse", x: 1430, y: 810, s: 0.56, at: 62.8, f: -1 }, { kind: "lion", x: 1160, y: 850, s: 0.66, at: 63.6, f: -1 },
  { kind: "deer", x: 880, y: 870, s: 0.62, at: 64.6, f: -1 }, { kind: "sheep", x: 1290, y: 912, s: 0.56, at: 65.4, f: -1 }, { kind: "sheep", x: 1380, y: 930, s: 0.5, at: 65.9, f: -1 }, { kind: "rabbit", x: 700, y: 920, s: 0.8, at: 66.6, f: -1 }, { kind: "rabbit", x: 610, y: 940, s: 0.66, at: 67.2, f: -1 },
];
const FLOWERS: [number, number, string][] = Array.from({ length: 26 }, (_, i) => [40 + ((i * 733) % 1840), 1000 + ((i * 37) % 60), ["#e86a8a", "#f2c53a", "#ffffff", "#8a72d0", "#f08a3a"][i % 5]]);
const dark = (T: number) => (T < 6.6 ? 1 : 1 - eio(T, 6.6, 3.2)); // the darkness of day one
const seaLight = (T: number) => (T < 6.6 ? 0 : T < 12 ? 0.45 * eio(T, 6.6, 3) : 0.45 + 0.55 * eio(T, 12, 4));
// the evening-and-morning of each day, and the full night of day four
const night = (T: number) => Math.max(T > 9.6 && T < 12 ? Math.sin(Math.PI * win(T, 9.6, 2.4)) * 0.45 : 0, T > 46 && T < 50.4 ? Math.sin(Math.PI * win(T, 46, 4.4)) ** 0.6 * 0.72 : 0, T > 20.4 && T < 22.4 ? Math.sin(Math.PI * win(T, 20.4, 2)) * 0.3 : 0, T > 36.4 && T < 38.4 ? Math.sin(Math.PI * win(T, 36.4, 2)) * 0.3 : 0, T > 59.6 && T < 61.4 ? Math.sin(Math.PI * win(T, 59.6, 1.8)) * 0.3 : 0);
const sunAt = (T: number): [number, number, number] => { // x, y, visible (0..1)
  if (T < 38.6) return [330, 170, 0];
  if (T < 40.2) return [330, 170, win(T, 38.6, 1.6)];
  if (T < 46.4) { const u = eio(T, 40.2, 6.2), a = Math.PI * (0.18 + 0.8 * u); return [960 - Math.cos(a) * 760, 600 - Math.sin(a) * 470, 1]; }
  if (T < 49.6) return [-200, 700, 0];
  const u = eio(T, 49.6, 1.6); return [lerp(140, 330, u), lerp(600, 170, u), 1];
};
const world = (c: Ctx, T: number, gt: number, o: { sunset?: number; skipBeasts?: boolean } = {}) => {
  // sky: the firmament of day two
  skyWash(c, 640, "#86b6d8", "#e8eedf", eio(T, 12.8, 2.6), 11);
  const [sx, sy, sv] = sunAt(T); if (o.sunset) { sunDisc(c, 1560, 470, 54, gt, 1); } else if (sv > 0) sunDisc(c, sx, sy, 56, gt, sv);
  for (const [x, y, w, h, sd, at] of [[520, 210, 300, 90, 51, 14.6], [1180, 140, 380, 110, 52, 15.6], [1640, 300, 260, 80, 53, 16.6], [260, 420, 200, 60, 54, 17.4]] as number[][]) cloud(c, ((x + gt * 16) % (W + 400)) - 100, y, w, h, sd, win(T, at, 2.2));
  // the waters
  sea(c, 600, gt, seaLight(T), 1);
  // fish under the surface and leaping (day five)
  if (T > 50.6) {
    for (let i = 0; i < 7; i++) { const per = 3.4 + (i % 3) * 0.7, ph = (gt + i * 1.3) % per, jx = 80 + i * 66, jy = 760 + (i % 3) * 50; if (ph < 1.1 && T > 51 + i * 0.6) { const u = ph / 1.1, x = jx + u * 90, y = jy - Math.sin(Math.PI * u) * 150; fish(c, x, y, 0.9 - (i % 3) * 0.12, gt + i, ["#e8a23a", "#5aa0c8", "#d8603a", "#f2d24a"][i % 4], 1, -0.9 + u * 1.8); if (u > 0.85) { c.globalAlpha = 0.6; c.strokeStyle = "#ffffff"; c.lineWidth = 2; c.beginPath(); c.ellipse(jx + 90, jy, 16 * (u - 0.8) * 8, 4, 0, 0, TAU); c.stroke(); c.globalAlpha = 1; } } }
    c.save(); c.globalAlpha = 0.45 * win(T, 50.6, 1.5); for (let i = 0; i < 6; i++) { const x = ((i * 140 + gt * (20 + i * 6)) % 700) - 60, y = 680 + i * 45; fish(c, x, y, 0.7, gt + i * 2, "#3d6e8a", 1); } c.restore(); c.globalAlpha = 1;
  }
  // day three: the dry land appears, then everything green grows on it
  const land = win(T, 22.6, 4.2), lift = (1 - ease(land)) * 70;
  if (land > 0) {
    c.save(); c.translate(0, lift);
    hill(c, FAR, 660, "#86a464", 61, clamp(land * 1.4), 0.55);
    hill(c, MID, H, "#86ad4c", 62, clamp(land * 1.2 - 0.15), 0.18);
    hill(c, FRONT, H, "#6a9a3a", 63, clamp(land * 1.2 - 0.3), 0);
    c.restore();
  }
  for (const tr of TREES.filter((x) => x.d! > 0.5)) tree(c, tr, win(T, tr.at, 2.2), gt);
  for (const tr of TREES.filter((x) => x.d! > 0.1 && x.d! < 0.5)) tree(c, tr, win(T, tr.at, 2.6), gt);
  // tufts on the middle ground
  for (let i = 0; i < 22; i++) { const x = 560 + ((i * 397) % 1340), y = 700 + ((i * 131) % 210); tuft(c, x, y, 0.6, 300 + i, gt, win(T, 28 + (i % 7) * 0.4, 1.2), "#5f8f32"); }
  // day six: the beasts walk in from the right
  if (!o.skipBeasts) for (const b of BEASTS) {
    if (T < b.at) continue; const u = win(T, b.at, 4.2), e = 1 - (1 - u) ** 2, x = lerp(W + 220, b.x, e), moving = u < 1, walk = moving ? (T - b.at) * (b.kind === "rabbit" ? 9 : 6) : undefined;
    animal(c, { kind: b.kind, x, y: b.y, s: b.s, facing: moving ? -1 : b.f ?? -1, walk, t: gt + b.x });
  }
  // the foreground
  for (const tr of TREES.filter((x) => x.d === 0)) tree(c, tr, win(T, tr.at, 3), gt);
  for (const [x, y, s, sd, at] of [[300, 1010, 0.9, 71, 32], [980, 1020, 0.8, 72, 33.2], [1420, 1012, 0.85, 73, 34]] as number[][]) bush(c, x, y, s, sd, win(T, at, 2), gt, ["#e88aa0", "#f2c53a", "#ffffff"][sd % 3]);
  FLOWERS.forEach(([x, y, col], i) => flower(c, x, y, 1, col, 500 + i, gt, win(T, 33 + (i % 9) * 0.35, 1)));
  for (let i = 0; i < 14; i++) tuft(c, 30 + i * 140, 1050 + (i % 3) * 10, 1, 400 + i, gt, win(T, 32.5 + (i % 5) * 0.4, 1));
  // day five: birds cross the sky (they keep flying after)
  if (T > 51.4) for (let i = 0; i < 9; i++) { const sp = 120 + (i % 4) * 30, x0 = -100 - (i % 3) * 140 - Math.floor(i / 3) * 60, x = x0 + ((T - 51.4) * sp) % (W + 500), y = 200 + (i % 3) * 70 + Math.floor(i / 3) * 40 + Math.sin(gt * 1.3 + i) * 10; bird(c, x, y, 0.8 - (i % 3) * 0.15, gt * 9 + i * 1.7, i % 4 === 0 ? "#f8f4ea" : i % 4 === 1 ? "#4a6a9a" : i % 4 === 2 ? "#d8603a" : "#f2d24a", 1); }
  // light and dark
  if (o.sunset) { tint(c, "#f2a25a", 0.32 * o.sunset); tint(c, "#ffd8a0", 0.18 * o.sunset, "soft-light"); }
  const n = night(T); if (n > 0) tint(c, "#26306a", n);
  if (T > 38.6 && T < 50.4) { const ma = clamp(Math.sin(Math.PI * win(T, 46, 4.4)) * 1.4); stars(c, ma, gt, 600, 110); if (ma > 0) moon(c, 1500, 190, 46, clamp(ma * 1.2)); }
};
const darkness = (c: Ctx, T: number, gt: number) => {
  const d = dark(T); if (d <= 0) return;
  const cx = 960, cy = 260, hole = (1 - d) * 2860 - 260;
  if (hole <= 0) c.fillStyle = "rgba(14,18,30,0.94)";
  else { const g = c.createRadialGradient(cx, cy, hole, cx, cy, hole + 260); g.addColorStop(0, "rgba(14,18,30,0)"); g.addColorStop(1, "rgba(14,18,30,0.94)"); c.fillStyle = g; }
  c.fillRect(0, 0, W, H);
  // the Spirit moving over the face of the waters: a breath of pale light travelling over the swell
  if (T < 7.4) { const u = (gt / 6) % 1, x = lerp(-200, 2100, u), a = 0.5 * (T < 6.6 ? 1 : 1 - win(T, 6.6, 0.8)); const gg = c.createRadialGradient(x, 650, 0, x, 650, 260); gg.addColorStop(0, rgba("#cfe0ff", 0.4 * a)); gg.addColorStop(1, rgba("#cfe0ff", 0)); c.fillStyle = gg; c.fillRect(x - 300, 380, 600, 560); for (let i = 0; i < 10; i++) { const xx = x - 200 + i * 44, yy = 640 + Math.sin(gt * 2 + i) * 14; c.globalAlpha = 0.35 * a; stroke(c, [[xx, yy], [xx + 30, yy - 10], [xx + 70, yy - 4]], 3, 0.5, "#dfe8ff", 0.7); } c.globalAlpha = 1; }
};

// ================================================================ THE GARDEN
const EDEN_BG = (c: Ctx) => {
  const g = c.createLinearGradient(0, 0, 0, 640); g.addColorStop(0, "#8cbad6"); g.addColorStop(0.7, "#f3e6c0"); g.addColorStop(1, "#f6e2b0"); c.globalAlpha = 0.95; c.fillStyle = g; c.fillRect(0, 0, W, 640); c.globalAlpha = 1;
  hill(c, [[0, 560], [180, 520], [420, 540], [640, 500], [900, 520], [1180, 486], [1440, 512], [1700, 480], [1920, 506]], 700, "#8aa86a", 84, 1, 0.6);
  hill(c, [[0, 640], [240, 610], [520, 628], [800, 600], [1100, 618], [1400, 596], [1700, 612], [1920, 600]], H, "#86ad4c", 85, 1, 0.25);
  const back: Tree[] = [[120, 640, 0.42, 86], [330, 630, 0.36, 87], [560, 622, 0.4, 88], [1060, 620, 0.38, 89], [1640, 612, 0.44, 90], [1840, 630, 0.38, 91]].map(([x, y, s, seed]) => ({ x, y, s, seed, d: 0.35 }));
  back.forEach((tr) => tree(c, tr, 1, 0));
};
const LIFE: Tree = { x: 760, y: 760, s: 0.95, seed: 101, d: 0.05, fruit: "#f6c63a", fruitN: 14, glow: 1, shape: "round", col: "#4f8a3a" };
const KNOW: Tree = { x: 1400, y: 770, s: 1.0, seed: 102, d: 0.05, fruit: "#c8322a", fruitN: 16, shape: "wide", col: "#5a7a32" };
const RIVER: P[] = [[960, 640], [900, 680], [1010, 730], [860, 800], [700, 860], [420, 930], [120, 1000], [-60, 1060]];
// a band of tall flowering foliage, its top edge at y0: in front of the people before the fall
const hedge = (c: Ctx, x0: number, x1: number, y0: number, t: number, seed: number) => {
  for (let i = 0, x = x0; x < x1; i++, x += 70) bush(c, x, y0 + 190, 1.25, seed + i, 1, t, ["#e88aa0", "#ffffff", "#f2c53a", "#c9a0e8"][i % 4], i % 2 ? "#4f7d34" : "#5c8a3a");
};
const garden = (c: Ctx, env: Env, t: number, o: { life?: number; dim?: number } = {}) => {
  baked(c, env, "eden-bg", EDEN_BG);
  for (const [x, y, w, h, sd] of [[380, 160, 320, 90, 81], [1300, 110, 360, 100, 82], [1720, 260, 220, 70, 83]] as number[][]) cloud(c, ((x + t * 18) % (W + 400)) - 200, y, w, h, sd, 1);
  river(c, RIVER, 18, 120, t);
  tree(c, LIFE, 1, t); tree(c, KNOW, 1, t);
  limb(c, [[1404, 660], [1330, 628], [1250, 612], [1180, 606]], 22, 8, "#7a5634", 103, 0, 1, 0.35, 0.7);
  if (o.life !== undefined) glory(c, LIFE.x, LIFE.y - 330, 260, o.life, t, "#fff0a0");
  for (let i = 0; i < 16; i++) flower(c, 60 + i * 118, 860 + (i % 3) * 18, 0.9, ["#e86a8a", "#f2c53a", "#ffffff", "#8a72d0"][i % 4], 700 + i, t, 1);
  if (o.dim === undefined) butterflies(c, t, 6, 520, 780);
};
const frontGround = (c: Ctx, t: number) => {
  gouache(c, [[0, 1000], [480, 984], [960, 996], [1440, 980], [1920, 992], [1920, H], [0, H]], "#6a9a3a", { seed: 120, tex: { cols: ["#86b24a", "#4a7a2a"], n: 120, len: 40, w: 4, ang: 0.05, a: 0.35 } });
  for (let i = 0; i < 16; i++) tuft(c, 40 + i * 122, 1060, 1.1, 130 + i, t, 1);
};

// ================================================================ SHOTS
const titulo = shot("titulo", (c, t, env, gt) => {
  const d = eio(t, 0, 2.0);
  reveal(c, [0, 0, W, H], Math.PI / 2, d, 3, () => { sea(c, 600, gt, 0, 1); darkness(c, 0, gt); });
  // the title, lettered in pale gold on the dark
  const tp = win(t, 2.2, 1.0), tout = win(t, 7.2, 0.9);
  if (tp > 0 && tout < 1) reveal(c, [300, 240, 1620, 560], tout > 0 ? Math.PI : 0, tout > 0 ? 1 - tout : tp, 4, () => {
    c.save(); c.textAlign = "center"; c.textBaseline = "alphabetic"; c.fillStyle = "#f2dc9a"; c.font = "120px Lora, serif"; c.fillText("A Criação", W / 2, 400);
    c.font = "44px Lora, serif"; c.fillStyle = "#d8c290"; c.fillText("Gênesis 1, 2 e 3", W / 2, 478); c.restore();
    stroke(c, [[760, 512], [960, 506], [1160, 512]], 3, 1, "#c8a85a", 0.8);
  });
  if (t > 0.5) glory(c, 960, 260, 120, 0.12 * win(t, 3, 2) * (1 - win(t, 7.4, 0.8)), gt); // a first spark in the deep, the token's seed
  captionsFor(c, "titulo", t);
}, false);

const criacaoShot = shot("criacao", (c, T, _env, gt) => {
  world(c, T, gt);
  darkness(c, T, gt);
  if (T > 6.2 && T < 13) glory(c, 960, 260, lerp(200, 1300, eio(T, 6.4, 3)), 1 - win(T, 9.4, 3.4), gt); // "Haja luz"
  for (const [a, b, s] of [[1, 11.8, "Primeiro dia"], [12.4, 21.8, "Segundo dia"], [22.4, 37.8, "Terceiro dia"], [38.4, 49.8, "Quarto dia"], [50.4, 60.8, "Quinto dia"], [61.4, 71.4, "Sexto dia"]] as [number, number, string][]) label(c, T, a, b, s);
  captionsFor(c, "criacao", T);
});

const adao = shot("adao", (c, t, _env, gt) => {
  painted(c, t, 201, () => {
    skyWash(c, 560, "#9cc4dc", "#f3e8c8", 1, 202);
    hill(c, [[0, 520], [400, 490], [800, 510], [1200, 470], [1600, 500], [1920, 480]], 640, "#8aa86a", 203, 1, 0.55);
    gouache(c, [[0, 600], [600, 580], [1200, 596], [1920, 570], [1920, H], [0, H]], "#9a7a4a", { seed: 204, tex: { cols: ["#b8945a", "#7a5a32", "#c8a46a"], n: 300, len: 30, w: 4, ang: 0.05, a: 0.35 }, mottle: { cols: ["#6a4a26", "#d8b47a"], n: 160, r: 10, a: 0.3 } });
    for (let i = 0; i < 18; i++) tuft(c, 40 + i * 110, 640 + (i % 4) * 80, 0.8, 210 + i, gt, 1);
  });
  // the dust of the ground rises, swirling, and gathers into a man: pencil first, then clay, then life
  const gather = win(t, 0.6, 3.6), form = win(t, 2.2, 3.0), cx = 960, cy = 760;
  if (t > 0.6) { const n = 180; for (let i = 0; i < n; i++) { const a = i * 2.39 + gt * (1.4 + (i % 5) * 0.25), rr = lerp(560 - (i % 7) * 30, 40 + (i % 11) * 14, ease(gather)) * (1 - form * 0.7), x = cx + Math.cos(a) * rr * 0.9, y = cy + Math.sin(a) * rr * 0.35 - (i % 13) * 22 * ease(gather) + 120 * (1 - ease(gather)); c.globalAlpha = 0.6 * (1 - win(t, 5.2, 1.4)); c.fillStyle = i % 3 ? "#b8945a" : "#7a5a32"; c.beginPath(); c.arc(x, y, 2 + (i % 4), 0, TAU); c.fill(); } c.globalAlpha = 1; }
  const breath = win(t, 5.4, 2.0), life = win(t, 6.6, 1.6), alive = t > 7.0;
  const adam = () => person(c, { who: "adam", x: 960, y: 1110, s: 2.2, facing: 1, clay: 1 - life, eyes: alive ? "open" : "closed", mood: alive ? (t > 9.4 ? "smile" : "awe") : "calm", breathe: alive ? gt : 0, reach: alive ? eio(t, 9.2, 1.6) * 0.5 : 0, outfit: "none" });
  if (form > 0) {
    reveal(c, [700, 400, 1220, 900], -Math.PI / 2, clamp(form * 1.25 - 0.15), 205, adam);
    if (form < 1) pencil(c, { pts: [[920, 790], [895, 640], [920, 570], [935, 520], [915, 480], [935, 430], [985, 418], [1020, 460], [1005, 520], [1015, 570], [1040, 640], [1005, 790]], seed: 206, w: 1.2, a: 0.6, closed: true, per: 4 }, clamp(form * 2));
  }
  // tall grass and flowers stand in front of him from the waist down
  for (let i = 0; i < 24; i++) tuft(c, 740 + i * 20, 900, 2.4, 230 + i, gt, 1, i % 2 ? "#6e9a3c" : "#5a8a32");
  bush(c, 860, 1000, 1.7, 240, 1, gt, "#f2c53a"); bush(c, 1080, 1010, 1.6, 241, 1, gt, "#e88aa0");
  // the breath of life: light comes down to his face
  const fx = 960 + 18 * 2.2, fy = 1110 - 255 * 2.2;
  if (breath > 0) { glory(c, lerp(fx - 60, fx, breath), lerp(120, fy, ease(breath)), lerp(140, 240, breath), (1 - win(t, 8.2, 2.2)) * 0.9, gt); for (let i = 0; i < 6; i++) { const u = clamp(breath * 1.4 - i * 0.08); if (u <= 0 || u >= 1) continue; const x = lerp(fx - 60, fx + 30, u) + Math.sin(i * 2 + gt * 3) * 18, y = lerp(100, fy, u); c.globalAlpha = 0.6 * (1 - u); stroke(c, [[x - 20, y - 30], [x, y - 10], [x + 6, y + 14]], 5, 1, "#fff6d0", 0.8); } c.globalAlpha = 1; }
  captionsFor(c, "adao", t);
});

const descanso = shot("descanso", (c, t, _env, gt) => {
  painted(c, t, 301, () => world(c, 80, gt, { sunset: eio(t, 0, 4) }));
  label(c, t, 1.2, 9.6, "Sétimo dia");
  captionsFor(c, "descanso", t);
});

const eden = shot("eden", (c, t, env, gt) => {
  painted(c, t, 401, () => { garden(c, env, gt, { life: 0.5 + 0.2 * Math.sin(gt * 1.4) }); frontGround(c, gt); });
  // Adam walks into the garden behind the flowering hedge, looks up at the two trees
  const u = win(t, 1.4, 7.0), x = lerp(160, 1020, ease(u)), walking = u > 0 && u < 1;
  if (t > 1.4) person(c, { who: "adam", x, y: 1000, s: 1.45, facing: 1, walk: walking ? gt * 5 : undefined, breathe: gt, mood: t > 9 ? "awe" : "smile", look: 0 });
  hedge(c, -40, 1980, 770, gt, 410);
  // the voice: light from above, over the tree of knowledge, at the command
  glory(c, 1400, 120, 380, eio(t, 10.4, 1) * (1 - win(t, 15, 0.6)) * 0.85, gt);
  label(c, t, 1.4, 9.8, "O jardim do Éden");
  captionsFor(c, "eden", t);
});

const PARADE: { kind: Beast; s: number; d: number }[] = [{ kind: "sheep", s: 0.5, d: 0 }, { kind: "deer", s: 0.5, d: 1.1 }, { kind: "lion", s: 0.52, d: 2.3 }, { kind: "rabbit", s: 0.7, d: 3.1 }, { kind: "horse", s: 0.48, d: 3.8 }];
const eva = shot("eva", (c, t, env, gt) => {
  painted(c, t, 501, () => { garden(c, env, gt, { life: 0.5 + 0.2 * Math.sin(gt * 1.4) }); frontGround(c, gt); });
  // the animals pass before Adam, and he names them
  for (const a of PARADE) { const u = win(t, 0.6 + a.d, 6.5); if (u <= 0 || u >= 1) continue; animal(c, { kind: a.kind, x: lerp(-200, 1400, u), y: 790, s: a.s, facing: 1, walk: gt * (a.kind === "rabbit" ? 9 : 6), t: gt }); }
  const naming = t > 2 && t < 8.6, woman = win(t, 9.2, 2.2);
  person(c, { who: "adam", x: 1580, y: 1000, s: 1.45, facing: -1, breathe: gt, reach: naming ? 0.35 + 0.15 * Math.sin(gt * 2.4) : 0, mood: woman > 0.6 ? "awe" : "calm", look: 0 });
  if (woman > 0) {
    glory(c, 1180, 600, 340, Math.sin(Math.PI * woman) * 0.8 + (woman >= 1 ? 0 : 0), gt);
    reveal(c, [1000, 480, 1360, 820], -Math.PI / 2, clamp(woman * 1.3 - 0.2), 502, () => person(c, { who: "eve", x: 1180, y: 1000, s: 1.45, facing: 1, breathe: gt, mood: "smile" }));
    if (woman < 1) pencil(c, { pts: [[1150, 800], [1146, 700], [1160, 610], [1186, 590], [1214, 610], [1222, 700], [1214, 800]], seed: 503, w: 1.1, a: 0.6, closed: true, per: 4 }, clamp(woman * 2));
  }
  hedge(c, -40, 1980, 770, gt, 510);
  captionsFor(c, "eva", t);
});

// the serpent's coil along the low bough of the tree of knowledge, its head toward the woman
const COIL: P[] = [[1420, 640], [1360, 606], [1300, 596], [1250, 590], [1210, 588], [1180, 598], [1166, 622], [1150, 640]];
const serpente = shot("serpente", (c, t, env, gt) => {
  painted(c, t, 601, () => { garden(c, env, gt, { life: 0.4 }); frontGround(c, gt); });
  const slide = eio(t, 0.6, 3);
  serpent(c, COIL.map(([x, y], i) => [x + (1 - slide) * 160, y - (1 - slide) * (i * 4)] as P), gt, { w: 22, amp: 5, p: clamp(slide * 1.1 + 0.05) });
  const take = eio(t, 10.6, 1.4), give = eio(t, 12.6, 1.2), ateEve = t > 12.2, ateAdam = t > 14.2;
  person(c, { who: "adam", x: 640, y: 1000, s: 1.45, facing: 1, breathe: gt, mood: give > 0.5 ? "worried" : "calm", reach: give * 0.45, holding: ateAdam ? undefined : give > 0.9 ? "#c8322a" : undefined });
  person(c, { who: "eve", x: 1000, y: 1000, s: 1.45, facing: give > 0.2 ? -1 : 1, breathe: gt, mood: t > 5.4 && t < 10.6 ? "awe" : t > 10.6 ? "calm" : "smile", reach: take > 0 && give < 0.2 ? take * 0.8 : give > 0.2 ? (1 - give) * 0.3 + 0.35 : 0, holding: take > 0.9 && (!ateEve || give < 0.9) ? "#c8322a" : undefined });
  hedge(c, -40, 1980, 770, gt, 610);
  if (t > 10.2) tint(c, "#6a5a7a", 0.18 * win(t, 10.2, 3));
  captionsFor(c, "serpente", t);
});

const queda = shot("queda", (c, t, env, gt) => {
  painted(c, t, 701, () => { garden(c, env, gt, { dim: 1 }); frontGround(c, gt); tint(c, "#5a5a80", 0.3); });
  // a cold wind: leaves blown across
  for (let i = 0; i < 16; i++) { const x = ((gt * (140 + i * 13) + i * 230) % (W + 200)) - 100, y = 200 + ((i * 97) % 600) + Math.sin(gt * 2 + i) * 30; c.save(); c.translate(x, y); c.rotate(gt * 3 + i); gouache(c, [[0, -8], [6, 0], [0, 10], [-6, 0]], i % 2 ? "#6a8a3a" : "#8a7a3a", { seed: 720 + i }); c.restore(); }
  // they hide among the trees, aprons of fig leaves, looking out
  const peek = Math.sin(gt * 1.3) * 6, call = win(t, 6.8, 1);
  person(c, { who: "adam", x: 700 + peek, y: 880, s: 1.25, facing: 1, breathe: gt, outfit: "leaves", mood: call > 0 ? "worried" : "sad", eyes: call > 0 ? "open" : "down" });
  person(c, { who: "eve", x: 570, y: 885, s: 1.25, facing: 1, breathe: gt + 1, outfit: "leaves", mood: "worried", eyes: call > 0 ? "open" : "down" });
  bush(c, 470, 960, 2.3, 730, 1, gt, "#c9a0e8", "#3e6a2a"); bush(c, 820, 985, 1.7, 731, 1, gt, "#e88aa0", "#46742e");
  glory(c, 1500, 160, 420, call * 0.9, gt);
  captionsFor(c, "queda", t);
});

const promessa = shot("promessa", (c, t, env, gt) => {
  painted(c, t, 801, () => { garden(c, env, gt, { dim: 1 }); frontGround(c, gt); tint(c, "#5a5a80", 0.22); });
  // the serpent, cursed, goes on its belly in the dust
  const u = win(t, 0.4, 7.4), sx = lerp(1900, 120, u), path: P[] = Array.from({ length: 8 }, (_, i) => [sx + (7 - i) * 46, 1012 + Math.sin(i * 0.9) * 6]);
  if (u < 1) serpent(c, path, gt, { w: 14, amp: 10, speed: 6, p: 1 });
  // clothed by God: the tunics are drawn and painted over the aprons, in the light
  const dress = win(t, 7.4, 2.4), lit = win(t, 6.8, 1.2) * (1 - win(t, 11.4, 1));
  glory(c, 1000, 380, 560, lit * 0.85, gt);
  const dressed = (who: "adam" | "eve", x: number, f: number) => {
    const base = { who, x, y: 880, s: 1.25, facing: f, breathe: gt + (who === "eve" ? 1 : 0), mood: (dress > 0.6 ? "calm" : "sad") as "calm" | "sad", eyes: (t < 3 ? "down" : "open") as "down" | "open" };
    if (dress < 1) person(c, { ...base, outfit: "leaves" });
    if (dress > 0) reveal(c, [x - 110, 480, x + 110, 900], Math.PI / 2, dress, who === "eve" ? 811 : 812, () => person(c, { ...base, outfit: "tunic" }));
  };
  dressed("adam", 900, 1); dressed("eve", 1080, -1);
  captionsFor(c, "promessa", t);
});

const EAST_BG = (c: Ctx) => {
  const g = c.createLinearGradient(0, 0, 0, 640); g.addColorStop(0, "#c89a7a"); g.addColorStop(0.6, "#f0c890"); g.addColorStop(1, "#f6dcaa"); c.globalAlpha = 0.95; c.fillStyle = g; c.fillRect(0, 0, W, 640); c.globalAlpha = 1;
  hill(c, [[0, 520], [300, 500], [640, 530], [980, 490], [1300, 520], [1600, 470], [1920, 500]], 700, "#b8946a", 901, 1, 0.55);
  // the land outside: dry, stony, thorny
  gouache(c, [[0, 640], [500, 620], [1000, 640], [1500, 610], [1920, 630], [1920, H], [0, H]], "#c4a06a", { seed: 902, tex: { cols: ["#d8b47a", "#9a7444", "#b88a52"], n: 300, len: 40, w: 4, ang: 0.04, a: 0.35 }, mottle: { cols: ["#8a6a3a", "#e6c890"], n: 160, r: 12, a: 0.3 } });
  for (let i = 0; i < 18; i++) { const x = 60 + ((i * 271) % 1000), y = 700 + ((i * 113) % 300); stroke(c, [[x, y], [x + 10, y - 26], [x + 2, y - 50]], 3, 0.6, "#6a4a2a", 0.8); stroke(c, [[x + 6, y - 20], [x + 24, y - 34]], 2, 0.4, "#6a4a2a", 0.8); stroke(c, [[x + 4, y - 36], [x - 14, y - 48]], 2, 0.4, "#6a4a2a", 0.8); }
  // the garden behind its gate, on the right, still green
  hill(c, [[1240, 700], [1400, 640], [1600, 620], [1800, 610], [1920, 616]], H, "#6a9a3a", 903, 1, 0);
  for (const [x, y, s, sd] of [[1330, 720, 0.8, 904], [1880, 700, 0.9, 905], [1620, 660, 0.55, 906]] as number[][]) tree(c, { x, y, s, seed: sd, d: 0.1, col: "#4f8a3a" }, 1, 0);
};
const expulsao = shot("expulsao", (c, t, env, gt) => {
  painted(c, t, 901, () => { baked(c, env, "east-bg", EAST_BG); for (const [x, y, w, h, sd] of [[300, 150, 300, 80, 961], [1100, 90, 380, 100, 962]] as number[][]) cloud(c, ((x + gt * 14) % (W + 400)) - 200, y, w, h, sd, 1, "#fbeedc", "#d8b8a8"); });
  // the cherubim at the east of the garden, and the sword of fire turning every way
  cherub(c, 1500, 900, 1.0, gt, -1); cherub(c, 1760, 880, 0.82, gt + 1.3, -1);
  flamingSword(c, 1610, 640, 1.0, gt);
  // the man and the woman go out, toward us and to the left; she looks back once
  const u = win(t, 1.0, 11.0), walking = u > 0 && u < 1, x = lerp(1150, 380, u), back = t > 5.4 && t < 7.4;
  person(c, { who: "eve", x: x + 120, y: 870, s: 1.15, facing: back ? 1 : -1, walk: walking ? gt * 5 + 1.5 : undefined, breathe: gt, outfit: "tunic", mood: "sad", eyes: back ? "open" : "down" });
  person(c, { who: "adam", x, y: 880, s: 1.2, facing: -1, walk: walking ? gt * 5 : undefined, breathe: gt, outfit: "tunic", mood: "sad", eyes: "down", arms: [0, 0.5] });
  // the token returns: the light of the first day, a star of promise rising over the road
  const star = win(t, 8.8, 2.4);
  if (star > 0) { glory(c, 420, 210, 260, star * (0.7 + 0.15 * Math.sin(gt * 2)), gt, "#fff2b0"); c.save(); c.translate(420, 210); c.rotate(gt * 0.3); c.fillStyle = "#fffbe6"; c.globalAlpha = star; c.beginPath(); for (let k = 0; k < 16; k++) { const a = (k / 16) * TAU, r = k % 2 ? 7 : k % 4 ? 22 : 36; c.lineTo(Math.cos(a) * r * star, Math.sin(a) * r * star); } c.closePath(); c.fill(); c.restore(); c.globalAlpha = 1; }
  if (t > 12.6) {
    const e = win(t, 12.6, 1.0);
    reveal(c, [560, 300, 1360, 520], 0, e, 950, () => {
      const pts: P[] = [[600, 330], [1320, 326], [1326, 500], [596, 506]];
      gouache(c, pts, "#f8f1de", { seed: 951, tex: { cols: ["#efe4c8", "#fffaf0"], n: 40, len: 60, w: 6, ang: 0.05, a: 0.25 }, rim: "#b9a983", rimA: 0.5 });
      pencil(c, { pts, seed: 952, w: 1, a: 0.5, closed: true, per: 3, retrace: false }, 1);
      c.save(); c.textAlign = "center"; c.fillStyle = "#3b2f24"; c.font = "72px Lora, serif"; c.fillText("Fim", 960, 420); c.font = "28px Lora, serif"; c.fillStyle = "#8a5a2a"; c.fillText("Gênesis 1 a 3 · Almeida Revista e Corrigida", 960, 470); c.restore();
    });
  }
  captionsFor(c, "expulsao", t);
}, false);

void darken; void lighten; void mix; void made; void sunDisc; void moon; void stars;

const SHOTS = [titulo, criacaoShot, adao, descanso, eden, eva, serpente, queda, promessa, expulsao];
export const criacaoFilm: Film = {
  meta: {
    title: "A Criação — Gênesis 1, 2 e 3", W, H, fps: FPS, bpm: BPM, durationFrames: DURATION, raster: "cpu", kind: "story",
    holds: [[DURATION - Math.round(2.2 * FPS), DURATION, "end card: 'Fim' read while the star burns"]],
    captions: CAPS.map(([s, a, b, k]) => ({ from: START[s] + Math.round(a * FPS), to: START[s] + Math.round(b * FPS), text: `${V[k][0]} (${V[k][1]})` })),
    poster: START["eden"] + 10 * FPS,
  },
  assets: { images: {} },
  shots: SHOTS,
  audio: criacaoAudio(FPS, DURATION),
};
export { criacaoFilm as criacao };
