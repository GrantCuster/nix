import {
  Paintbrush,
  PauseIcon,
  PlayIcon,
  TimerResetIcon,
  XIcon,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "./Bar";
import { useAtom } from "jotai";
import { activeWorkspaceAtom, barItemMapAtom } from "./atoms";
import { TimerType } from "./Types";

export const formatTime = (seconds: number) => {
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const adjustedMinutes = minutes % 60;
  const adjustedSeconds = seconds % 60;
  let format = "";
  if (hours > 0) {
    format += hours + "h ";
  }
  if (adjustedMinutes > 0) {
    format += adjustedMinutes + "m ";
  }
  if (adjustedSeconds > 0) {
    format += adjustedSeconds + "s";
  }
  return format;
};

export const formatTimeColon = (seconds: number) => {
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const adjustedMinutes = minutes % 60;
  const adjustedSeconds = seconds % 60;
  let format = "";
  if (hours > 0) {
    format += hours + ":";
  }
  if (adjustedMinutes > 0) {
    format += adjustedMinutes + ":";
  } else {
    if (hours > 0) {
      format += "00:";
    } else {
      format += "0:";
    }
  }
  format += adjustedSeconds.toString().padStart(2, "0");
  return format;
};

export const parseTimeString = (timeString: string) => {
  const splits = timeString.split(" ");
  let seconds = 0;
  for (const split of splits) {
    if (split.includes("h")) {
      seconds += parseInt(split) * 60 * 60;
    }
    if (split.includes("m")) {
      seconds += parseInt(split) * 60;
    }
    if (!split.includes("h") && !split.includes("m")) {
      seconds += parseInt(split);
    }
  }
  return seconds;
};

export const timerColors = [
  "bg-gruvbox-aqua",
  "bg-gruvbox-red",
  "bg-gruvbox-green",
  "bg-gruvbox-yellow",
  "bg-gruvbox-blue",
  "bg-gruvbox-purple",
];

function Timer() {
  const [activeWorkspace] = useAtom(activeWorkspaceAtom);
  const [barItemMap, setBarItemMap] = useAtom(barItemMapAtom);
  const [editingLimit, setEditingLimit] = useState(false);
  const intervalRef = useRef(0);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [showTimer, setShowTimer] = useState(true);
  ("");
  const currentTimer = barItemMap.timers[activeWorkspace];
  const isActive = currentTimer.isActive;
  const time = currentTimer.currentSeconds;
  let limit = currentTimer.limitSeconds;

  const setTimerProp = (propKey: string, propValue: any) => {
    setBarItemMap((prev) => {
      return {
        ...prev,
        timers: {
          ...prev.timers,
          [activeWorkspace]: {
            ...prev.timers[activeWorkspace],
            [propKey]: propValue,
          },
        },
      };
    });
  };

  // increment is special because it uses prev
  const incrementTimer = () => {
    setBarItemMap((prev) => {
      return {
        ...prev,
        timers: {
          ...prev.timers,
          [activeWorkspace]: {
            ...prev.timers[activeWorkspace],
            currentSeconds: prev.timers[activeWorkspace].currentSeconds + 1,
          },
        },
      };
    });
  };

  const setIsActive = (value: boolean) => {
    setTimerProp("isActive", value);
  };

  const startTimer = () => {
    clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      incrementTimer();
    }, 1000);
  };

  useEffect(() => {
    if (isActive) {
      startTimer();
    }
    return () => {
      clearInterval(intervalRef.current);
    };
  }, []);

  return (
    <div className="text-gruvbox-foreground h-full flex items-center overflow-hidden w-full relative bg-gruvbox-dark0 select-none">
      <div
        className={`absolute h-full bg-gruvbox-dark2`}
        style={{
          width: (time / limit) * 100 + "%",
        }}
      ></div>
      <div className="flex w-full relative h-full items-center justify-between">
        <div className="flex h-full grow">
          <Button
            className="bg-transparent hover:bg-gruvbox-background hover:bg-opacity-50 px-0 flex justify-center items-center w-8"
            action={() => {
              if (isActive) {
                clearInterval(intervalRef.current);
                setIsActive(false);
              } else {
                startTimer();
                setIsActive(true);
              }
            }}
          >
            {isActive ? <PauseIcon size={13} /> : <PlayIcon size={14} />}
          </Button>
          <Button
            className="bg-transparent hover:bg-gruvbox-background hover:bg-opacity-50 px-0 flex justify-center items-center w-8"
            action={() => setTimerProp("currentSeconds", 0)}
          >
            <TimerResetIcon size={13} />
          </Button>
          <div
            className="cursor-default grow flex items-center justify-center text-center"
            onClick={() => {
              setShowTimer(!showTimer);
            }}
          >
            {showTimer ? (
              <div>{formatTimeColon(Math.min(time, limit))}</div>
            ) : null}
          </div>
          {editingLimit ? (
            <div className="flex h-full mix-blend-difference">
              <button className="px-2 hover:bg-gruvbox-background hidden hover:bg-opacity-50">
                log
              </button>
              <input
                ref={inputRef}
                className="w-20 bg-gruvbox-background border border-gruvbox-foreground focus:border focus:border-gruvbox-foreground px-1 focus:outline-none"
                autoFocus={true}
                defaultValue={formatTime(limit).trim()}
                spellCheck="false"
                onFocus={(e) => {
                  e.currentTarget.select();
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    const seconds = parseTimeString(e.currentTarget.value);
                    setTimerProp("limitSeconds", seconds);
                    setEditingLimit(false);
                  }
                }}
              />
              <Button
                className="bg-transparent hover:bg-gruvbox-background hover:bg-opacity-50 px-0 flex justify-center items-center w-8"
                action={() => setEditingLimit(false)}
              >
                <XIcon size={13} />
              </Button>
            </div>
          ) : (
            <Button
              className="bg-gransparent hover:bg-gruvbox-background hover:bg-opacity-50"
              action={() => {
                setEditingLimit(true);
              }}
            >
              {formatTime(limit)}
            </Button>
          )}
          <Button
            className="bg-transparent"
            action={() => {
              const newBarMap = {
                ...barItemMap,
              };
              delete newBarMap.timers[activeWorkspace];
              setBarItemMap(newBarMap);
            }}
          >
            <XIcon size={13} />
          </Button>
        </div>
      </div>
    </div>
  );
}

export function TimerBackground({ timer }: { timer: TimerType }) {
  return (
    <div
      className={`absolute left-0 top-0 bottom-0 bg-gruvbox-dark2`}
      style={{
        width: (timer.currentSeconds / timer.limitSeconds) * 100 + "%",
      }}
    ></div>
  );
}

export function TimerDisplay({ timer }: { timer: TimerType }) {
  return (
    <div className="relative flex w-full h-full items-center">
      <div className="grow"></div>
      <div className="text-gruvbox-dark4">{formatTime(timer.limitSeconds)}</div>
    </div>
  );
}

export default Timer;
