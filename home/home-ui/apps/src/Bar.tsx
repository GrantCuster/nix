import { useEffect, useRef, useState } from "react";
import "./App.css";
import {
  getCurrentDate,
  getCurrentTime,
  socketOptions,
  useSubscribeToActiveWorkspace,
  useSubscribeToBattery,
  useSubscribeToVolume,
} from "./hooks";
import {
  ArrowLeftIcon,
  BatteryMedium,
  PauseIcon,
  PlayIcon,
  PlusIcon,
  TimerResetIcon,
  Volume1Icon,
  XIcon,
} from "lucide-react";
import { useWebSocket } from "react-use-websocket/dist/lib/use-websocket";
import { socketUrl } from "./consts";
import { useAtom, useSetAtom } from "jotai";
import {
  activeWorkspaceAtom,
  barItemMapAtom,
  barMenuIsOpenAtom,
} from "./atoms";
import Timer, { formatTime, formatTimeColon, parseTimeString } from "./Timer";
import { twMerge } from "tailwind-merge";
import { BarItemMapType, BarType, TimerType } from "./Types";

function NewBar() {
  return (
    <div className="h-screen w-screen bg-gruvbox-dark0">
      <div className="flex w-full items-center bg-gruvbox-background text-gruvbox-foreground max-h-7 h-full">
        <WorkspaceTitle />
        <WorkspaceContentContainer />
        <div className="flex gap-1 h-full">
          <Volume />
          <Battery />
        </div>
        <Clock />
      </div>
    </div>
  );
}

function WorkspaceTitle() {
  useSubscribeToActiveWorkspace();
  const [activeWorkspace] = useAtom(activeWorkspaceAtom);
  const { sendJsonMessage } = useWebSocket(socketUrl, socketOptions);

  const splits = activeWorkspace.split(":");

  return activeWorkspace === "home" ? (
    <div className="px-2">{getCurrentDate()}</div>
  ) : (
    <Button
      className="bg-gruvbox-background hover:bg-gruvbox-background px-0"
      action={() => {
        sendJsonMessage({ action: "command", payload: "go_home_space" });
      }}
    >
      {splits.length > 1 ? (
        <div className="flex ">
          <div className="px-2 bg-gruvbox-dark2">{splits[0]}</div>
          <div className="px-2">{splits[1]}</div>
        </div>
      ) : (
        <div className="px-2">{activeWorkspace}</div>
      )}
    </Button>
  );
}

function WorkspaceContentContainer() {
  const [activeWorkspace] = useAtom(activeWorkspaceAtom);
  const [barItemMap, setBarItemMap] = useAtom(barItemMapAtom);

  useEffect(() => {
    if (barItemMap[activeWorkspace] === undefined) {
      // initiate content
      setBarItemMap((prev: BarItemMapType) => {
        return {
          ...prev,
          [activeWorkspace]: {
            workspace: activeWorkspace,
            timers: [
              {
                isActive: true,
                currentSeconds: 0,
                limitSeconds: "log",
                showTime: true,
              },
            ],
          },
        };
      });
    }
  }, [activeWorkspace, barItemMap]);

  return (
    <div className="grow">
      {activeWorkspace !== "home" &&
      barItemMap[activeWorkspace] !== undefined ? (
        <WorkpaceContent content={barItemMap[activeWorkspace]} />
      ) : null}
    </div>
  );
}

function WorkpaceContent({ content }: { content: BarType }) {
  return (
    <div className="flex grow h-full">
      {content.timers.map((timer, i) => (
        <NewTimer
          key={"timer-" + i}
          timer={timer}
          timerIndex={i}
          workspace={content.workspace}
        />
      ))}
    </div>
  );
}

export function getLogLimit(currentSeconds: number) {
  if (currentSeconds < 5 * 60) {
    return 5 * 60;
  } else if (currentSeconds < 10 * 60) {
    return 10 * 60;
  } else {
    return Math.ceil(currentSeconds / (20 * 60)) * 20 * 60;
  }
}

function NewTimer({
  timer,
  workspace,
  timerIndex,
}: {
  timer: TimerType;
  workspace: string;
  timerIndex: number;
}) {
  const setBarItemMap = useSetAtom(barItemMapAtom);
  const timerRef = useRef<number>(-1);
  const workspaceRef = useRef<string>(workspace);
  const { sendJsonMessage } = useWebSocket(socketUrl, socketOptions);

  const setTimerProp = (keyString: string, value: any) => {
    setBarItemMap((prev: BarItemMapType) => {
      let newTimers = prev[workspace].timers.slice();
      newTimers[timerIndex][keyString] = value;
      return {
        ...prev,
        [workspace]: {
          ...prev[workspace],
          timers: newTimers,
        },
      };
    });
  };

  useEffect(() => {
    if (
      (timer.isActive && timerRef.current === -1) ||
      (timer.isActive && workspaceRef.current !== workspace)
    ) {
      timerRef.current = setInterval(() => {
        setBarItemMap((prev: BarItemMapType) => {
          let newTimers = prev[workspace].timers.slice();
          const newVal = newTimers[timerIndex].currentSeconds++;
          if (newVal === 5 * 60) {
            sendJsonMessage({
              action: "command",
              payload: 'notify-send -t 2000 "5 minutes"',
            });
          } else if (newVal === 10 * 60) {
            sendJsonMessage({
              action: "command",
              payload: 'notify-send -t 2000 "10 minutes"',
            });
          } else if (newVal === 20 * 60) {
            sendJsonMessage({
              action: "command",
              payload: 'notify-send -t 2000 "20 minutes"',
            });
          } else if (newVal === 30 * 60) {
            sendJsonMessage({
              action: "command",
              payload: 'notify-send -t 2000 "30 minutes"',
            });
          }
          return {
            ...prev,
            [workspace]: {
              ...prev[workspace],
              timers: newTimers,
            },
          };
        });
      }, 1000);
      workspaceRef.current = workspace;
    } else if (!timer.isActive && timerRef.current !== -1) {
      clearInterval(timerRef.current);
      timerRef.current = -1;
    }
    return () => {
      if (timerRef.current !== -1) {
        clearInterval(timerRef.current);
        timerRef.current = -1;
      }
    };
  }, [workspace, timer.isActive]);

  const activeLimit =
    timer.limitSeconds === "log"
      ? getLogLimit(timer.currentSeconds)
      : timer.limitSeconds;

  return (
    <div className="grow h-full flex">
      <div className="flex items-stretch">
        {timer.isActive ? (
          <Button
            className="w-7 px-0 flex justify-center items-center"
            action={() => {
              setTimerProp("isActive", false);
            }}
          >
            <PauseIcon size={13} />
          </Button>
        ) : (
          <Button
            className="w-7 px-0 flex justify-center items-center"
            action={() => {
              setTimerProp("isActive", true);
            }}
          >
            <PlayIcon size={13} />
          </Button>
        )}
        <Button
          className="w-7 px-0 flex justify-center items-center"
          action={() => {
            setTimerProp("currentSeconds", 0);
          }}
        >
          <TimerResetIcon size={13} />
        </Button>
      </div>
      <div className="grow text-center relative">
        <div
          className={`absolute left-0 top-0 bottom-0 ${
            timer.isActive ? "bg-gruvbox-dark2" : "bg-gruvbox-dark1"
          }`}
          style={{
            width: (timer.currentSeconds / activeLimit) * 100 + "%",
          }}
        ></div>
        <div className="relative">{formatTimeColon(timer.currentSeconds)}</div>
      </div>
      <div className="px-2 text-gruvbox-light3 ">
        {timer.limitSeconds === "log"
          ? `log:${formatTime(activeLimit)}`
          : formatTime(timer.limitSeconds)}
      </div>
    </div>
  );
}

function Bar() {
  useSubscribeToActiveWorkspace();
  const { sendJsonMessage } = useWebSocket(socketUrl, socketOptions);
  const [activeWorkspace] = useAtom(activeWorkspaceAtom);
  const [menuIsOpen, setMenuIsOpen] = useAtom(barMenuIsOpenAtom);
  const [barItemMap] = useAtom(barItemMapAtom);

  const splits = activeWorkspace.split(":");
  return (
    <div className="h-screen overflow-hidden bg-gruvbox-background text-gruvbox-foreground flex flex-col justify-center">
      <div className="flex justify-between items-center text-gruvbox-light2 max-h-[26px] h-full">
        <div className="flex h-full items-center">
          <Button
            className="hidden"
            action={() => {
              sendJsonMessage({
                action: "command",
                payload: "back_to_workspace",
              });
            }}
          >
            <ArrowLeftIcon size={14} />
          </Button>
          <Button
            className="bg-transparent hover:bg-transparent"
            action={() => {
              sendJsonMessage({ action: "command", payload: "go_home_space" });
            }}
          >
            {splits.length > 1 ? (
              <div className="flex h-full">
                <div className="text-left h-full text-gruvbox-dark4 flex items-center">
                  <div className="">{splits[0]}:</div>
                </div>
                <div className="h-full flex items-center text-gruvbox-foreground">
                  <div>{splits[1]}</div>
                </div>
              </div>
            ) : (
              <div className="px-2 h-full flex items-center text-gruvbox-foreground">
                {activeWorkspace}
              </div>
            )}
          </Button>
        </div>

        <div className="grow flex h-full">
          {barItemMap.timers[activeWorkspace] !== undefined ? <Timer /> : null}
          {menuIsOpen ? (
            <Menu />
          ) : (
            <Button action={() => setMenuIsOpen(true)}>
              <PlusIcon size={14} />
            </Button>
          )}
        </div>

        <Battery />
        <Clock />
      </div>
    </div>
  );
}

const menuOptions = ["timer"];

function Menu() {
  const setMenuIsOpen = useSetAtom(barMenuIsOpenAtom);
  const [submenu, setSubmenu] = useState<"timer" | null>(null);
  const [barItemMap, setBarItemMap] = useAtom(barItemMapAtom);
  const [activeWorkspace] = useAtom(activeWorkspaceAtom);

  function handleAction(action: string) {
    if (action === "timer") {
      setSubmenu("timer");
    }
  }

  return (
    <div className="flex items-center">
      <Button action={() => setMenuIsOpen(false)}>
        <XIcon size={14} />
      </Button>
      {submenu === null ? (
        <>
          {menuOptions.map((option) => (
            <Button action={() => handleAction(option)}>{option}</Button>
          ))}
        </>
      ) : submenu === "timer" ? (
        <TimerSubmenu />
      ) : null}
    </div>
  );
}

export function TimerSubmenu() {
  const setMenuIsOpen = useSetAtom(barMenuIsOpenAtom);
  const [barItemMap, setBarItemMap] = useAtom(barItemMapAtom);
  const [activeWorkspace] = useAtom(activeWorkspaceAtom);

  function setTimer(timeString: string) {
    setBarItemMap((prev: BarItemMapType) => {
      return {
        ...prev,
        timers: {
          ...prev.timers,
          [activeWorkspace]: {
            workspace: activeWorkspace,
            currentSeconds: 0,
            limitSeconds:
              timeString === "log" ? "log" : parseTimeString(timeString),
            isActive: true,
            colorIndex: 0,
            showTime: true,
          },
        },
      };
    });
    setMenuIsOpen(false);
  }

  return (
    <div className="flex w-full h-full">
      {["log", "5m", "10m", "15m", "20m", "25m", "30m", "1h"].map((time) => (
        <Button
          action={() => {
            setTimer(time);
          }}
        >
          {time}
        </Button>
      ))}
    </div>
  );
}

export function Button({
  action,
  children,
  className = "",
}: {
  action: any;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <button
      onClick={action}
      className={twMerge(
        "cursor-pointer h-full px-2 bg-gruvbox-dark1 hover:bg-gruvbox-dark2",
        className
      )}
    >
      {children}
    </button>
  );
}

function Battery() {
  const { battery, getBattery } = useSubscribeToBattery();
  const [short, setShort] = useState(true);

  useEffect(() => {
    const intervalId = setInterval(() => {
      getBattery();
    }, 5000);
    return () => {
      clearInterval(intervalId);
    };
  });

  return battery.payload ? (
    <div
      className="relative flex px-2"
      onClick={() => {
        setShort(!short);
      }}
    >
      <div
        className={`absolute left-0 bottom-0 right-0 ${
          battery.payload.status === "Charging"
            ? "bg-gruvbox-green"
            : battery.payload.percent < 15
            ? "bg-gruvbox-red"
            : "bg-gruvbox-dark2"
        }`}
        style={{
          height: battery.payload.percent + "%",
        }}
      ></div>
      <div className="relative flex items-center">
        <div className="relative">
          <BatteryMedium size={13} />
        </div>
        {short ? null : <div>:{battery.payload.percent}%</div>}
      </div>
    </div>
  ) : null;
}

function Volume() {
  const { volume, getVolume } = useSubscribeToVolume();

  useEffect(() => {
    const intervalId = setInterval(() => {
      getVolume();
    }, 5000);
    return () => {
      clearInterval(intervalId);
    };
  });

  return volume ? (
    <div className="relative flex px-2 justify-center items-stretch">
      <div
        className={`absolute left-0 bottom-0 right-0 bg-gruvbox-dark2`}
        style={{
          height: volume,
        }}
      ></div>
      <div className="relative flex items-center">
        <div className="relative">
          <Volume1Icon size={14} />
        </div>
      </div>
    </div>
  ) : null;
}

function Clock() {
  const [, setBump] = useState("bump");

  useEffect(() => {
    setInterval(() => setBump("bump"), 1000);
  }, []);

  return (
    <div className="px-2">
      <div>{getCurrentTime()}</div>
    </div>
  );
}

export default NewBar;
