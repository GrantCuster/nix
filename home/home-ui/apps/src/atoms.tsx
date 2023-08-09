import { atom } from "jotai";
import { BarItemMapType } from "./Types";

export const spaceInputAtom = atom("");
export const activeWorkspaceAtom = atom<string>("home");
export const barMenuIsOpenAtom = atom(false);

export const barItemMapAtom = atom<BarItemMapType>({
  timers: {},
});
