import { useEffect, useRef, useState } from "react";
import {
  underscoresForKeys,
  useCreateOrSelectWorkspace,
  useGetCreatedAtTimestamps,
  useGetWorkspaceTree,
} from "./hooks";
import TimeAgo from "react-timeago";
import { Todos } from "./Todos";

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

  return (
    <div className="bg-gruvbox-background text-gruvbox-foreground h-screen w-full overflow-auto flex">
      <div
        className="grow"
        onMouseEnter={() => {
          inputRef.current!.focus();
        }}
      >
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
            className="bg-gruvbox-dark0 placeholder:text-gruvbox-dark3 py-2 px-3 w-full focus:outline-none"
            placeholder="Workspace"
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
        <div className="border-l-2  border-gruvbox-dark0 h-full flex flex-col overflow-hidden">
          <Todos
            title="to do"
            location="~/obsidian/todo/Active\ todo.md"
            watchMessage="active_todos_updated"
          />
          <Todos
            title="could do"
            location="~/obsidian/todo/System\ ideas.md"
            watchMessage="system_ideas_updated"
          />
        </div>
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
