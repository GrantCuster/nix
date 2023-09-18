import { useEffect, useRef, useState } from "react";
import { useCreateOrSelectWorkspace, useGetWorkspaceTree } from "./hooks";

function List() {
  const { workspaces, getWorkspaceTree } = useGetWorkspaceTree();
  const createOrSelectWorkspace = useCreateOrSelectWorkspace();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [input, setInput] = useState("");

  useEffect(() => {
    getWorkspaceTree();
  }, []);

  useEffect(() => {
    const handleFocus = () => {
      inputRef.current!.focus();
      getWorkspaceTree();
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
    <div className="bg-gruvbox-background text-gruvbox-foreground h-screen w-full overflow-auto">
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
          className="bg-gruvbox-dark0 py-2 px-3 w-full"
          value={input}
          onChange={(e) => {
            setInput(e.currentTarget.value);
          }}
        />
      </form>
      <div className="flex flex-col gap-[2px] pb-[2px] bg-gruvbox-dark0">
        {entries.map((workspace) => (
          <button
            key={workspace.id}
            className="block w-full px-3 text-left py-2 bg-gruvbox-background hover:bg-gruvbox-dark1"
            onClick={() => {
              createOrSelectWorkspace(workspace.name);
            }}
          >
            {workspace.name}
          </button>
        ))}
      </div>
    </div>
  );
}

export default List;
