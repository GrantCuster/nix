import { atom } from "jotai";
import { BarItemMapType } from "./Types";

export const spaceInputAtom = atom("");
export const activeWorkspaceAtom = atom<string>("home");
export const barMenuIsOpenAtom = atom(false);

const barItemMapBaseAtom = atom<BarItemMapType>({});
export const barItemMapAtom = atom(
  (get) => get(barItemMapBaseAtom),
  (get, set, newValue: any) => {
    const nextValue =
      typeof newValue === "function"
        ? newValue(get(barItemMapBaseAtom))
        : newValue;
    set(barItemMapBaseAtom, nextValue);
    localStorage.setItem("barItemMap", JSON.stringify(nextValue));
  }
);
export const homeBarItemMap = atom<BarItemMapType>({});
