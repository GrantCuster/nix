import { useEffect, useRef, useState } from "react";
import {
  underscoresForKeys,
  useCreateOrSelectWorkspace,
  useGetCreatedAtTimestamps,
  useGetCreatedAtTimestams,
  useGetWorkspaceTree,
} from "./hooks";
import TimeAgo from "react-timeago";

function Collage() {
  const { workspaces, getWorkspaceTree } = useGetWorkspaceTree();
  const createOrSelectWorkspace = useCreateOrSelectWorkspace();
  const { timestamps, getCreatedAtTimestamps } = useGetCreatedAtTimestamps();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [input, setInput] = useState("");
  const [cacheBump, setCacheBump] = useState(1);

  useEffect(() => {
    getWorkspaceTree();
  }, []);

  useEffect(() => {
    const handleFocus = () => {
      getWorkspaceTree();
      getCreatedAtTimestamps();
      setCacheBump((prev) => prev + 1);
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

  entries = entries.filter((w) => w.name !== "email" && w.name !== "music");

  return (
    <div className="bg-gruvbox-background text-gruvbox-foreground h-screen relative w-full overflow-hidden">
      {entries
        .slice()
        .reverse()
        .map((workspace) => {
          return (
            <div
              className="absolute top-0 left-0 w-full h-full mix-blend-lighten"
              key={workspace.name}
              style={{
                backgroundSize: "contain",
                backgroundPosition: "center center",
                backgroundRepeat: "no-repeat",
                backgroundImage: `url(http://localhost:6049/home/grant/screenshots/workspaces/${encodeURI(
                  workspace.name
                )}.png?cacheBump=${cacheBump})`,
              }}
            ></div>
          );
        })}
    </div>
  );
}

export default Collage;

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
