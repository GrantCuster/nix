import { useEffect, useState } from "react";
import "./App.css";
import {
  getCurrentTime,
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
import Timer from "./Timer";

function Bar() {
  useSubscribeToActiveWorkspace();
  const { sendJsonMessage } = useWebSocket(socketUrl);
  const [activeWorkspace] = useAtom(activeWorkspaceAtom);
  const [menuIsOpen, setMenuIsOpen] = useAtom(barMenuIsOpenAtom);
  const [barItemMap, setBarItemMap] = useAtom(barItemMapAtom);

  const splits = activeWorkspace.split(":");
  return (
    <div className="h-screen overflow-hidden bg-gruvbox-background text-gruvbox-foreground flex flex-col justify-center">
      <div className="flex justify-between items-center text-gruvbox-light2">
        <div className="flex">
          <button
            className="px-2 text-gruvbox-background bg-gruvbox-dark2 flex items-center"
            onClick={() => {
              sendJsonMessage({
                action: "command",
                payload: "back_to_workspace",
              });
            }}
          >
            <ArrowLeftIcon size={14} />
          </button>
          <button
            className="flex items-center"
            onClick={() => {
              sendJsonMessage({ action: "command", payload: "go_home_space" });
            }}
          >
            {splits.length > 1 ? (
              <div className="flex">
                <div className="text-left px-2 bg-gruvbox-dark4 text-gruvbox-background">
                  {splits[0]}
                </div>
                <div className="px-2 text-gruvbox-foreground">{splits[1]}</div>
              </div>
            ) : (
              <div>{activeWorkspace}</div>
            )}
          </button>
        </div>

        <div className="grow flex h-full">
          {barItemMap[activeWorkspace] !== null ? <Timer /> : null}
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
  const [barItemMap, setBarItemMap] = useAtom(barItemMapAtom);
  const [activeWorkspace] = useAtom(activeWorkspaceAtom);

  function handleAction(action: string) {
    if (action === "timer") {
      setBarItemMap((prev) => {
        return {
          ...prev,
          timers: {
            ...prev.timers,
            [activeWorkspace]: {
              workspace: activeWorkspace,
              currentSeconds: 0,
              limitSeconds: 20 * 60,
            },
          },
        };
      });
    }
  }

  return (
    <div className="flex items-center">
      <Button action={() => setMenuIsOpen(false)}>
        <XIcon size={14} />
      </Button>
      {menuOptions.map((option) => (
        <Button action={() => handleAction(option)}>{option}</Button>
      ))}
    </div>
  );
}

function Button({
  action,
  children,
}: {
  action: any;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={action}
      className="cursor-pointer h-full bg-gruvbox-dark1 hover:bg-gruvbox-dark2 px-2"
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

  return <div className="px-2">{getCurrentTime()}</div>;
}

export default Bar;
