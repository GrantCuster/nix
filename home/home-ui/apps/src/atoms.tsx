import { atom } from "jotai";
import { atomWithStorage } from "jotai/utils";
import {
  BarItemMapType,
  BlockIdsType,
  BlockMapType,
  Camera,
  Point,
} from "./Types";
import { BlockMenuType, CreateWorkspaceMenuType } from "./Canvas";

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

export const blockMenuAtom = atom<BlockMenuType | null>(null);
export const createWorkspaceMenuAtom = atom<CreateWorkspaceMenuType | null>(
  null
);

export const workSpaceIdCounterAtom = atom(10);
export const cameraAtom = atom<Camera>({ x: 0, y: 0, z: 1 });
export const cursorAtom = atom<Point>({ x: 0, y: 0 });
export const blockIdsAtom = atomWithStorage<BlockIdsType>("block-ids", []);
export const blockMapAtom = atomWithStorage<BlockMapType>("block-map", {});
