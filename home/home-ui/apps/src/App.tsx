import { useEffect, useId, useRef, useState } from "react";
import "./App.css";
import TimeAgo from "react-timeago";
import { barItemMapAtom, homeBarItemMap, spaceInputAtom } from "./atoms";
import { useAtom } from "jotai";
import {
  getCurrentDate,
  getCurrentTime,
  useCreateWorkspace,
  useGetWorkspaceTree,
  useSelectWorkspace,
  useSubscribeToScreenshots,
  useSubscribeToSystemIdeas,
  useSubscribeToTodos,
} from "./hooks";
import Bar, { Button, getLogLimit } from "./Bar";
import { TimerType } from "./Types";
import { formatTime } from "./Timer";
import Canvas from "./Canvas";

function Wrapper() {
  const [mode, setMode] = useState<"bar" | "homepage" | "canvas">("bar");

  useEffect(() => {
    const pathname = window.location.pathname;

    if (pathname === "/bar") {
      setMode("bar");
      document.title = "home_bar";
    } else if (pathname === "/canvas") {
      setMode("canvas");
      document.title = "canvas";
    } else {
      setMode("homepage");
      document.title = "Homepage";
    }

    if (import.meta.env.DEV) {
      document.title = "dev";
    }
  });

  return mode === "bar" ? <Bar /> : mode === "canvas" ? <Canvas /> : <App />;
}

function App() {
  const [spaceInput, setSpaceInput] = useAtom(spaceInputAtom);
  const spaceInputRef = useRef<HTMLInputElement | null>(null);
  const selectWorkspace = useSelectWorkspace();
  const createWorkspace = useCreateWorkspace();
  const { workspaces, getWorkspaceTree } = useGetWorkspaceTree();

  let activeSpaces = workspaces;
  if (spaceInput.length > 0) {
    activeSpaces = workspaces
      .filter((space) => space !== null)
      .filter((space) => space.name.includes(spaceInput));
  }

  useEffect(() => {
    function handleFocus() {
      spaceInputRef.current?.focus();
    }
    window.addEventListener("focus", handleFocus);
    return () => {
      window.removeEventListener("focus", handleFocus);
    };
  });

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        selectWorkspace(workspaces[0]);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  });

  return (
    <div className="h-screen overflow-hidden bg-gruvbox-background text-gruvbox-foreground flex flex-col">
      <div className="flex hidden justify-between px-4 pb-2 pt-2 text-gruvbox-light2">
        <div>{getCurrentDate()}</div>
        <div>{getCurrentTime()}</div>
      </div>
      <div className="flex h-full border-gruvbox-dark3 border-t">
        <div className="w-3/4 overflow-hidden flex flex-col">
          <div className="grow">
            <div className="">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (activeSpaces.length > 0 && !e.ctrlKey) {
                    selectWorkspace(activeSpaces[0]);
                  } else {
                    createWorkspace(spaceInput);
                  }
                  setSpaceInput("");
                }}
              >
                <input
                  ref={spaceInputRef}
                  className="w-full text-gruvbox-foreground text-lg px-4 placeholder:text-gruvbox-dark4 bg-gruvbox-dark0 py-3 focus:outline-none "
                  placeholder="What are you working on?"
                  spellCheck="false"
                  type="text"
                  value={spaceInput}
                  onChange={(e) => setSpaceInput(e.currentTarget.value)}
                />
              </form>
            </div>
            <ListSpaces />
          </div>
        </div>
        <div className="w-1/4 text-gruvbox-light3 overflow-hidden h-full border-l border-gruvbox-dark3 flex flex-col">
          <Todo />
          <SystemIdeas />
        </div>
      </div>
    </div>
  );
}

function RecentScreenshots() {
  const { screenshots } = useSubscribeToScreenshots();

  const lines = screenshots
    .split("\n")
    .filter((line) => line.length > 0)
    .reverse();

  return (
    <div className="h-full border-gruvbox-dark3 border-t flex flex-col overflow-hidden">
      <div className="pt-2 pb-4 px-4 text-sm uppercase text-gruvbox-light2">
        Recent Screenshots
      </div>
      <div className="grow w-full grid-cols-4 gap-6 px-4 grid h-full">
        {lines.slice(0, 4).map((location) => (
          <div className="flex justify-center items-start">
            <img
              className="w-auto h-auto border border-gruvbox-dark3 opacity-50 hover:opacity-100"
              src={`http://localhost:6049${location}`}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

function SystemIdeas() {
  const { systemIdeas } = useSubscribeToSystemIdeas();
  const createWorkspace = useCreateWorkspace();
  const selectWorkspace = useSelectWorkspace();
  const { workspaces } = useGetWorkspaceTree();

  const lines = systemIdeas.split("\n");

  return (
    <div className="overflow-auto h-full border-t border-gruvbox-dark3">
      <div className="px-4 py-2 text-sm uppercase">System ideas</div>
      <div className="bg-gruvbox-dark3 flex-col flex py-px gap-px">
        {lines
          .filter((line) => line.length > 0)
          .map((line, i) => {
            const splits = line.split("]");
            const hasX = splits[0].includes("x");
            return (
              <Button
                key={i}
                className={`flex px-4 py-2 bg-gruvbox-background hover:bg-gruvbox-dark1 text-left ${
                  hasX ? "hidden" : ""
                }`}
                action={() => {
                  const taskName = "task:" + splits[1];
                  const workspaceNames = workspaces.map((w) => w.name);
                  if (workspaceNames.includes(taskName)) {
                    const index = workspaceNames.indexOf(taskName);
                    selectWorkspace(workspaces[index]);
                  }
                  createWorkspace(taskName);
                }}
              >
                <div>{splits[1]}</div>
              </Button>
            );
          })}
      </div>
    </div>
  );
}

function Todo() {
  const { todos } = useSubscribeToTodos();
  const createWorkspace = useCreateWorkspace();
  const selectWorkspace = useSelectWorkspace();
  const { workspaces } = useGetWorkspaceTree();

  const lines = todos.split("\n");

  return (
    <div className="overflow-auto h-full">
      <div className="px-4 py-2 text-sm uppercase">Active todos</div>
      <div className="bg-gruvbox-dark3 flex-col flex py-px gap-px">
        {lines
          .filter((line) => line.length > 0)
          .map((line, i) => {
            const splits = line.split("]");
            const hasX = splits[0].includes("x");
            return (
              <Button
                key={i}
                className={`flex px-4 py-2 bg-gruvbox-background hover:bg-gruvbox-dark1 text-left ${
                  hasX ? "hidden" : ""
                }`}
                action={() => {
                  const taskName = "task:" + splits[1];
                  const workspaceNames = workspaces.map((w) => w.name);
                  if (workspaceNames.includes(taskName)) {
                    const index = workspaceNames.indexOf(taskName);
                    selectWorkspace(workspaces[index]);
                  }
                  createWorkspace(taskName);
                }}
              >
                <div>{splits[1]}</div>
              </Button>
            );
          })}
      </div>
    </div>
  );
}

function ListSpaces() {
  const [spaceInput] = useAtom(spaceInputAtom);
  const selectWorkspace = useSelectWorkspace();
  const [barItemMap, setBarItemMap] = useAtom(homeBarItemMap);

  const { workspaces, getWorkspaceTree } = useGetWorkspaceTree();

  const [cacheBump, setCacheBump] = useState(Date.now());

  useEffect(() => {
    getWorkspaceTree();
  }, []);

  useEffect(() => {
    const syncBarState = () => {
      const stored = localStorage.getItem("barItemMap") || `{ }`;
      const data = JSON.parse(stored);
      setBarItemMap(data);
      setCacheBump(Date.now());
    };
    window.addEventListener("focus", syncBarState);
    return () => {
      window.removeEventListener("focus", syncBarState);
    };
  }, []);

  let activeSpaces = workspaces.filter((space) => space !== null);
  if (spaceInput.length > 0) {
    activeSpaces = workspaces
      .filter((space) => space !== null)
      .filter((space) => space.name.includes(spaceInput));
  }

  return (
    <div className="flex flex-col grow overflow-auto ">
      <div className="flex flex-col">
        {activeSpaces.map((space) => {
          const splits = space.name.split(":");
          return (
            <div key={space.id} className="w-full border border-gruvbox-dark3">
              <button
                className="w-full gap-4 cursor-pointer items-center flex hover:bg-gruvbox-dark1 focus:bg-gruvbox-dark1 focus:outline-none focus:border-none"
                onClick={() => selectWorkspace(space)}
              >
                <div className="pl-4 w-2/3 overflow-hidden overflow-ellipsis h-6">
                  {splits.length > 1 ? (
                    <div className="flex relative">
                      <div className="text-left h-full text-gruvbox-light4 flex items-center">
                        <div className="">{splits[0]}:</div>
                      </div>

                      <div>{splits[1]}</div>
                    </div>
                  ) : (
                    <div>{space.name}</div>
                  )}
                </div>
                <div className="grow">
                  {barItemMap[space.name] !== undefined ? (
                    <AppSpaceTimers timers={barItemMap[space.name].timers} />
                  ) : null}
                </div>
                <div
                  className="h-12 w-24"
                  style={{
                    backgroundSize: "contain",
                    backgroundPosition: "right center",
                    backgroundRepeat: "no-repeat",
                    backgroundImage: `url(http://localhost:6049/home/grant/screenshots/workspaces/${encodeURI(
                      space.name
                    )}.png?cacheBump=${cacheBump})`,
                  }}
                ></div>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function AppSpaceTimers({ timers }: { timers: TimerType[] }) {
  return (
    <div className="flex grow">
      {timers.map((timer) => (
        <AppSpaceTimer timer={timer} />
      ))}
    </div>
  );
}

function AppSpaceTimer({ timer }: { timer: TimerType }) {
  const activeLimit =
    timer.limitSeconds === "log"
      ? getLogLimit(timer.currentSeconds)
      : timer.limitSeconds;

  return (
    <div className="flex grow text-gruvbox-light4 gap-3">
      <div className="grow text-center relative">
        <div
          className={`absolute left-0 top-0 bottom-0 ${
            timer.isActive ? "bg-gruvbox-dark2" : "bg-gruvbox-dark1"
          }`}
          style={{
            width: (timer.currentSeconds / activeLimit) * 100 + "%",
          }}
        ></div>
      </div>
      <div className="relative">{formatTime(activeLimit)}</div>
    </div>
  );
}

export default Wrapper;
