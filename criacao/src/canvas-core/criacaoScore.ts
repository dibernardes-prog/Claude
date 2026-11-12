import { filmScore } from "./score";
import type { FilmAudio } from "./film";
import { criacaoMusic } from "./criacaoMusic";
export const criacaoAudio = (fps: number, frames: number): FilmAudio => filmScore(criacaoMusic(), fps, frames) as FilmAudio;
