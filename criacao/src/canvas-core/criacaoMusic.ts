// The score of A CRIAÇÃO: cinematic strings, harp and bell; 72 bpm in 4/4, so one bar is 80 frames
// and every bar line sits on the film's beat grid (20 frames per beat).
//
// Tension curve (0..1) by chapter: dark 0.25 -> light 0.6 -> days 0.45..0.6 -> build 0.75 ->
// man made 0.9 (climax: the breath of life, bar 26) -> seventh day 0.25 -> garden 0.45 ->
// serpent 0.7 (D harmonic minor) -> the fall 0.3 -> the promise 0.5 -> outro 0.55, home on D.
// Motif: "D F# A" rising leap then steps down: stated in the days, augmented at the climax, minor
// and twisted for the serpent, in the harp for the promise, last word at the end.
import type { Material } from "./music/compose";

export const criacaoMusic = (): Material => ({
  style: "cinematic", title: "A Criação", seed: 1137, mood: "hopeful",
  bpm: 72, key: "D", mode: "major", meter: "4/4",
  moodControls: { energy: 0.45, warmth: 0.6, brightness: 0.5, tension: 0.4, space: 0.6 },
  dyn: [0.5, 0.62], tail: 3.4,
  levels: { lead: 2.6, chords: -1.2, counter: 3, snare: 3, hat: 9, bass: 1.5 },
  chords: {
    Dm: { voicing: "[D3 A3 F4]", bass: "D2:4" },
    Bb: { voicing: "[D3 Bb3 F4]", bass: "Bb1:4" },
    Asus: { voicing: "[D3 A3 E4]", bass: "A1:4" },
    D: { voicing: "[D3 A3 F#4]", bass: "D2:2 A1:2" },
    EoverD: { voicing: "[E3 B3 G#4]", bass: "D2:4" },
    G: { voicing: "[D3 B3 G4]", bass: "G1:2 D2:2" },
    Bm: { voicing: "[D3 B3 F#4]", bass: "B1:3 F#2:1" },
    A: { voicing: "[C#3 A3 E4]", bass: "A1:2 E2:2" },
    A7: { voicing: "[C#3 G3 E4]", bass: "A1:4" },
    F: { voicing: "[C3 A3 F4]", bass: "F1:4" },
    Em7: { voicing: "[E3 B3 G4]", bass: "E2:3 B1:1" },
    Gm: { voicing: "[D3 Bb3 G4]", bass: "G1:4" },
  },
  motifs: {
    dark: "A3:2 Bb3:1 A3:1 | D4:4 | C4:2 Bb3:1 A3:1 | A3:4",
    light: "D5:2 E5:2 | F#5:4",
    theme: "D4:1 F#4:.5 A4:2.5 | G4:1 F#4:1 E4:2 | F#4:1 A4:.5 D5:1.5 C#5:1 | B4:1 A4:1 F#4:1 E4:1",
    answer: "D4:1 F#4:.5 A4:2.5 | B4:1 C#5:1 D5:2 | E5:1.5 D5:.5 C#5:1 B4:1 | A4:2 E4:1 D4:1",
    themeHigh: "A4:1 D5:.5 F#5:2.5 | E5:1 D5:1 B4:2 | A4:1 B4:.5 D5:1.5 E5:1 | F#5:2 E5:2",
    rise: "C#5:1 D5:1 E5:1 F#5:1 | G5:2 A5:2",
    climax: "D5:2 F#5:1 A5:1 | A5:4 | G5:2 F#5:1 E5:1 | F#5:2 E5:1 C#5:1 | D5:4",
    rest: "A4:4 | B4:2 A4:2 | F#4:4",
    home: "D4:4",
    serpent: "A4:1 Bb4:1 A4:1 G#4:1 | A4:2 r:2 | F4:1 E4:1 F4:1 Eb4:1 | D4:2 E4:1 C#4:1 | D4:3 r:1",
    fall: "F4:2 E4:1 D4:1 | C#4:3 r:1 | D4:4",
    promise: "D4:1 F#4:.5 A4:2.5 | B4:2 A4:2 | G4:1 B4:.5 D5:2.5 | C#5:4",
    harpArp: "D4:.5 A4:.5 F#5:.5 A4:.5 D5:.5 A4:.5 F#4:.5 A4:.5",
    outro: "D5:1 F#5:.5 A5:2.5 | G5:2 F#5:2 | E5:2 C#5:2 | D5:4",
  },
  grooves: {
    main: { family: "pulse", density: 0.35, variation: 0.3 },
    rise: { family: "build", density: 0.6, variation: 0.3 },
    tense: { family: "tension", density: 0.45, variation: 0.3 },
  },
  sections: [
    { id: "trevas", kind: "intro", bars: 4, key: "D", mode: "aeolian", harmony: ["Dm", "~", "Bb", "Asus"], lead: ["dark"], chordVel: 0.5, energy: 0.3, groove: null },
    { id: "luz", kind: "swell", bars: 2, harmony: ["F", "D"], lead: ["light"], energy: 0.6, groove: null },
    { id: "dias", kind: "verse", bars: 8, harmony: ["D", "G", "Bm", "A", "D", "EoverD", "G", "A"], lead: ["theme", "answer"], energy: 0.45, groove: "main" },
    { id: "dias2", kind: "verse", bars: 8, harmony: ["D", "Bm", "G", "A", "F", "G", "A", "~"], lead: ["themeHigh", "answer"], counter: ["r:4", "r:4", "r:4", "r:4", "harpArp", "r:4", "r:4", "r:4"], energy: 0.48, groove: "main" },
    { id: "subida", kind: "build", bars: 2, harmony: ["G", "A7"], lead: ["rise"], energy: 0.72, groove: "rise" },
    { id: "homem", kind: "hook", bars: 5, harmony: ["D", "Bm", "G", "A", "D"], lead: ["climax"], energy: 0.95, groove: "main" },
    { id: "descanso", kind: "breath", bars: 3, harmony: ["G", "~", "D"], lead: ["rest"], energy: 0.3, groove: null },
    { id: "jardim", kind: "verse", bars: 9, harmony: ["D", "EoverD", "G", "D", "Bm", "G", "EoverD", "A", "D"], lead: ["theme", "answer", "home"], counter: ["harpArp", "r:4", "r:4", "r:4", "harpArp", "r:4", "r:4", "r:4", "r:4"], energy: 0.45, groove: null },
    { id: "serpente", kind: "build", bars: 5, key: "D", mode: "harmonicMinor", harmony: ["Dm", "Bb", "Gm", "A7", "Dm"], lead: ["serpent"], energy: 0.55, groove: "tense" },
    { id: "queda", kind: "breakdown", bars: 3, key: "D", mode: "harmonicMinor", harmony: ["Gm", "A7", "Dm"], lead: ["fall"], energy: 0.3, groove: null },
    { id: "promessa", kind: "bridge", bars: 4, harmony: ["G", "D", "Em7", "A"], lead: ["promise"], energy: 0.5, groove: null },
    { id: "fim", kind: "outro", bars: 4, harmony: ["D", "G", "A", "D"], lead: ["outro"], energy: 0.42, groove: null },
  ],
});
