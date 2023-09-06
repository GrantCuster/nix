export type TimerType = {
  isActive: boolean;
  currentSeconds: number;
  limitSeconds: number | "log";
  showTime: true;
};

export type BarType = {
  workspace: string;
  timers: TimerType[];
};

export type BarItemMapType = Record<string, BarType>;

export type WorkspaceBlockType = {
  uuid: string;
  type: "workspace";
  id: number | null;
  name: string;
  origin: Point;
  size: Size;
  zIndex: number;
};

export type BlockType = WorkspaceBlockType;

export type BlockMapType = Record<string, BlockType>;

export type BlockIdsType = string[];

export type Point = {
  x: number;
  y: number;
};

export type Size = {
  width: number;
  height: number;
};

export type Camera = {
  x: number;
  y: number;
  z: number;
};

export type BlockMenuType = { origin: Point };
export type CreateWorkspaceMenuType = { origin: Point };
