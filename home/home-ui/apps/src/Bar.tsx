import { useEffect, useState } from "react";
import "./App.css";
import {
  getCurrentTime,
  useSubscribeToActiveWorkspace,
  useSubscribeToBattery,
} from "./hooks";
import { ArrowLeft, PlusIcon, XIcon } from "lucide-react";
import { useWebSocket } from "react-use-websocket/dist/lib/use-websocket";
import { socketUrl } from "./consts";
import Timer from "./Timer";
import { useAtom, useSetAtom } from "jotai";
import { activeWorkspaceAtom, barMenuIsOpenAtom } from "./atoms";

function Bar() {
  useSubscribeToActiveWorkspace();
  const { sendJsonMessage } = useWebSocket(socketUrl);
  const [activeWorkspace] = useAtom(activeWorkspaceAtom);
  const [menuIsOpen, setMenuIsOpen] = useAtom(barMenuIsOpenAtom);

  const splits = activeWorkspace.split(":");
  return (
    <div className="h-screen overflow-hidden bg-gruvbox-background text-gruvbox-foreground flex flex-col justify-center">
      <div className="flex justify-between items-center text-gruvbox-light2">
        <div className="flex">
          <button
            className="px-2 border-r border-gruvbox-dark0 flex items-center"
            onClick={() => {
              sendJsonMessage({
                action: "command",
                payload: "back_to_workspace",
              });
            }}
          >
            <ArrowLeft size={12} />
          </button>

          <button
            className="px-2 border-r border-gruvbox-dark0 flex items-center"
            onClick={() => {
              sendJsonMessage({ action: "command", payload: "go_home_space" });
            }}
          >
            {splits.length > 1 ? (
              <div className="flex gap-3">
                <div className="text-left text-gruvbox-light4">{splits[0]}</div>
                {splits[1]}
              </div>
            ) : (
              <div>{activeWorkspace}</div>
            )}
          </button>
        </div>

        <div className="grow flex">
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

  return (
    <div className="flex items-center">
      {menuOptions.map((option) => (
        <Button action={() => false}>{option}</Button>
      ))}
      <Button action={() => setMenuIsOpen(false)}>
        <XIcon size={14} />
      </Button>
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
      className="cursor-pointer hover:bg-gruvbox-background hover:bg-opacity-50 p-1"
    >
      {children}
    </button>
  );
}

function Battery() {
  const { battery, getBattery } = useSubscribeToBattery();

  // useEffect(() => {
  //   const intervalId = setInterval(() => {
  //     getBattery();
  //   }, 5000);
  //   return () => {
  //     clearInterval(intervalId);
  //   };
  // });

  console.log(battery);

  return <div>batery</div>;
}

function Clock() {
  const [, setBump] = useState("bump");

  useEffect(() => {
    setInterval(() => setBump("bump"), 1000);
  }, []);

  return <div className="px-3">{getCurrentTime()}</div>;
}

export default Bar;
