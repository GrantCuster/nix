export type TimerType = {
  workspace: string;
  currentSeconds: number;
  limitSeconds: number | "log";
  isActive: boolean;
  colorIndex: 0;
  showTime: true;
};

export type BarItemMapType = {
  timers: Record<string, TimerType>;
};
