import { atom } from "jotai";
import { atomWithStorage } from "jotai/utils";
import {
  BarItemMapType,
  BlockIdsType,
  BlockMapType,
  Camera,
  Point,
  Size,
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
export const cursorBaseAtom = atom<Point>({ x: 0, y: 0 });
export const cursorRefAtom = atom<{ current: Point }>({
  current: { x: 0, y: 0 },
});
export const cursorAtom = atom(
  (get) => get(cursorBaseAtom),
  (get, set, newValue: any) => {
    const nextValue =
      typeof newValue === "function" ? newValue(get(cursorBaseAtom)) : newValue;
    set(cursorRefAtom, { current: nextValue });
    set(cursorBaseAtom, nextValue);
  }
);

const blockIdsBaseAtom = atomWithStorage<BlockIdsType>("block-ids", []);
export const blockIdsRefAtom = atom<{ current: BlockIdsType }>({ current: [] });
export const blockIdsAtom = atom(
  (get) => get(blockIdsBaseAtom),
  (get, set, newValue: any) => {
    const blockIdsRef = get(blockIdsRefAtom);
    const nextValue =
      typeof newValue === "function"
        ? newValue(get(blockIdsBaseAtom))
        : newValue;
    blockIdsRef.current = nextValue;
    set(blockIdsBaseAtom, nextValue);
  }
);

const blockMapBaseAtom = atomWithStorage<BlockMapType>("block-map", {});
export const blockMapRefAtom = atom<{ current: BlockMapType }>({
  current: {},
});
export const blockMapAtom = atom(
  (get) => get(blockMapBaseAtom),
  (get, set, newValue: any) => {
    const blockMapRef = get(blockMapRefAtom);
    const nextValue =
      typeof newValue === "function"
        ? newValue(get(blockMapBaseAtom))
        : newValue;
    blockMapRef.current = nextValue;
    set(blockMapBaseAtom, nextValue);
  }
);

export const contextMenuAtom = atom<{ origin: Point; size: Size } | null>(null);

export const activeBlockUuidRefAtom = atom<{ current: string | null }>({
  current: null,
});
