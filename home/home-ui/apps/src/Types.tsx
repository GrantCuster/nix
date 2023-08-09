export type TimerType = {
  workspace: string;
  currentSeconds: number;
  limitSeconds: number;
};

export type BarItemMapType = {
  timers: Record<string, TimerType>;
};
