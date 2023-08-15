import { useEffect, useState } from "react";
import "./App.css";
import {
  getCurrentTime,
  socketOptions,
  useSubscribeToActiveWorkspace,
  useSubscribeToBattery,
} from "./hooks";
import { ArrowLeftIcon, PlusIcon, XIcon } from "lucide-react";
import { useWebSocket } from "react-use-websocket/dist/lib/use-websocket";
import { socketUrl } from "./consts";
import { useAtom, useSetAtom } from "jotai";
import {
  activeWorkspaceAtom,
  barItemMapAtom,
  barMenuIsOpenAtom,
} from "./atoms";
import Timer, { parseTimeString } from "./Timer";
import { twMerge } from "tailwind-merge";
import { BarItemMapType } from "./Types";

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
      className="relative flex px-2 h-full"
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
            : "bg-gruvbox-light2"
        }`}
        style={{
          height: battery.payload.percent + "%",
        }}
      ></div>
      <div className="relative flex items-center mix-blend-difference">
        <div className="relative">
          {battery.payload.status === "Discharging" ? "B" : "C"}
        </div>
        {short ? null : <div>:{battery.payload.percent}%</div>}
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
    <div className="px-2 h-full flex items-center">
      <div>{getCurrentTime()}</div>
    </div>
  );
}

export default Bar;
