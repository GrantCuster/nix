import { useEffect, useRef, useState } from "react";
import {
  underscoresForKeys,
  useCreateOrSelectWorkspace,
  useGetActiveTodos,
  useGetCouldDo,
  useGetCreatedAtTimestamps,
  useGetCreatedAtTimestams,
  useGetWorkspaceTree,
} from "./hooks";
import TimeAgo from "react-timeago";
import { CheckSquare, SquareIcon } from "lucide-react";

function List() {
  const { workspaces, getWorkspaceTree } = useGetWorkspaceTree();
  const createOrSelectWorkspace = useCreateOrSelectWorkspace();
  const { timestamps, getCreatedAtTimestamps } = useGetCreatedAtTimestamps();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [input, setInput] = useState("");

  useEffect(() => {
    getWorkspaceTree();
  }, []);

  useEffect(() => {
    const handleFocus = () => {
      inputRef.current!.focus();
      getWorkspaceTree();
      getCreatedAtTimestamps();
    };
    window.addEventListener("focus", handleFocus);
    return () => {
      window.removeEventListener("focus", handleFocus);
    };
  });

  let entries = workspaces;
  if (input !== "") {
    entries = workspaces.filter((w) => w.name.includes(input));
  }

  // const tasks = entries.filter((w) => w.name.includes("task:"));
  // const nontasks = entries.filter((w) => !w.name.includes("task:"));
  //
  // entries = [...tasks, ...nontasks];

  return (
    <div className="bg-gruvbox-background text-gruvbox-foreground h-screen w-full overflow-auto flex">
      <div className="grow">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (entries.length === 0) {
              if (input !== "") {
                createOrSelectWorkspace(input);
              }
            } else {
              createOrSelectWorkspace(entries[0].name);
            }
            setInput("");
          }}
        >
          <input
            ref={inputRef}
            type="text"
            className="bg-gruvbox-dark0 py-2 px-3 w-full focus:outline-none"
            value={input}
            onChange={(e) => {
              setInput(e.currentTarget.value);
            }}
          />
        </form>
        <div className="flex flex-col gap-[2px] pb-[2px] bg-gruvbox-dark0">
          {entries.map((workspace) => {
            const underscored = underscoresForKeys(
              workspace.name.replace(":", "-")
            );
            return (
              <button
                key={workspace.id}
                className={`w-full flex px-3 text-left py-2 bg-gruvbox-background hover:bg-gruvbox-dark1`}
                onClick={() => {
                  createOrSelectWorkspace(workspace.name);
                }}
              >
                <div className="grow">
                  <FormatTask name={workspace.name} stacked={true} />
                </div>
                <div className="text-gruvbox-light4 hidden">
                  {timestamps[underscored] ? (
                    <TimeAgo date={timestamps[underscored]} />
                  ) : null}
                </div>
              </button>
            );
          })}
        </div>
      </div>
      <div className="w-[420px]">
        <Todos />
      </div>
    </div>
  );
}

export default List;

function FormatTask({
  name,
  stacked = false,
}: {
  name: string;
  stacked: boolean;
}) {
  const splits = name.split(":");

  return splits.length > 1 ? (
    <div className={`${stacked ? "" : "flex"}`}>
      <div
        className={`text-gruvbox-light3 ${stacked ? "text-xs uppercase" : ""}`}
      >
        {splits[0]}:
      </div>
      <div>{splits[1]}</div>
    </div>
  ) : (
    name
  );
}

function Todos() {
  const { activeTodos, getActiveTodos } = useGetActiveTodos();
  const { couldDo, getCouldDo } = useGetCouldDo();
  const createOrSelectWorkspace = useCreateOrSelectWorkspace();

  useEffect(() => {
    const handleFocus = () => {
      getActiveTodos();
      getCouldDo();
    };
    window.addEventListener("focus", handleFocus);
    return () => {
      window.removeEventListener("focus", handleFocus);
    };
  });

  return (
    <div className="border-l-2  border-gruvbox-dark0 h-full flex flex-col overflow-hidden">
      <div className="h-1/2 overflow-auto">
        <div className="px-3 py-2 border-b-2 border-t-2 border-gruvbox-dark0 text-gruvbox-light2 uppercase text-sm">
          To do
        </div>
        <div>
          {activeTodos.map((t) =>
            t.length > 0 ? (
              <div
                key={t}
                className="flex text-sm border-b-2 border-b-gruvbox-dark0 text-gruvbox-light2 hover:bg-gruvbox-dark1"
              >
                <button
                  className="grow text-left px-3 py-2"
                  onClick={() => {
                    createOrSelectWorkspace("task:" + t);
                  }}
                >
                  {t}
                </button>
                <button className="px-3 hover:bg-gruvbox-dark0 cursor-pointer">
                  <SquareIcon size={13} />
                </button>
              </div>
            ) : null
          )}
        </div>
      </div>
      <div className="h-1/2 overflow-auto">
        <div className="px-3 py-2 border-b-2 border-t-2 border-gruvbox-dark0 text-gruvbox-light2 uppercase text-sm">
          Could do
        </div>
        <div>
          {couldDo.map((t) =>
            t.length > 0 ? (
              <div
                key={t}
                className="flex border-b-2 text-sm border-b-gruvbox-dark0 text-gruvbox-light2 hover:bg-gruvbox-dark1"
              >
                <button
                  className="grow text-left px-3 py-2"
                  onClick={() => {
                    createOrSelectWorkspace("task:" + t);
                  }}
                >
                  {t}
                </button>
                <button className="px-3 hover:bg-gruvbox-dark0 cursor-pointer">
                  <SquareIcon size={13} />
                </button>
              </div>
            ) : null
          )}
        </div>
      </div>
    </div>
  );
}
