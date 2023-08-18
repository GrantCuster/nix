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
