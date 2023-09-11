import { useEffect, useRef, useState } from "react";
import { useCreateOrSelectWorkspace, useGetWorkspaceTree } from "./hooks";

function matchArray(text: string) {
  // Define a function to wrap matched text in an object
  function wrapInObject(matchedText: string) {
    return { match: matchedText };
  }

  // Use a regular expression to find matches
  const regex = /\{[^{}]*[{}]/g;
  const matches = [];

  let lastIndex = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    // Push the preceding non-match as a string
    const beforeMatch = text.substring(lastIndex, match.index);
    if (beforeMatch) {
      matches.push(beforeMatch);
    }

    // Push the match as an object
    matches.push(wrapInObject(match[0].slice(1, -1)));

    lastIndex = regex.lastIndex;
  }

  // Push the remaining non-match as a string
  const remainingText = text.substring(lastIndex);
  if (remainingText) {
    matches.push(remainingText);
  }

  return matches;
}

function Text() {
  const textRef = useRef<HTMLTextAreaElement | null>(null);
  const createOrSelectWorkspace = useCreateOrSelectWorkspace();
  const [text, setText] = useState("");
  const { getWorkspaceTree } = useGetWorkspaceTree();

  useEffect(() => {
    function handleFocus() {
      textRef.current!.focus();
      getWorkspaceTree();
    }
    window.addEventListener("focus", handleFocus);
    handleFocus();
    return () => {
      window.removeEventListener("focus", handleFocus);
    };
  }, []);

  const matches = matchArray(text);

  return (
    <div className="h-screen w-screen bg-gruvbox-background text-gruvbox-foreground flex justify-center items-center overflow-auto">
      <div className="relative w-full max-w-[60ch]">
        <textarea
          ref={textRef}
          className="custom-selection relative focus:outline-none caret-gruvbox-foreground bg-transparent text-transparent w-full"
          spellCheck="false"
          style={{
            resize: "none",
          }}
          onChange={(e) => {
            e.target.style.height = "inherit";
            e.target.style.height = `${e.target.scrollHeight}px`;
            setText(e.currentTarget.value);
          }}
        >
          {text}
        </textarea>
        <div className="absolute left-0 top-0 w-full pointer-events-none whitespace-pre-wrap">
          {matches.map((el) => {
            return typeof el === "string" ? (
              <>{el}</>
            ) : (
              <span
                tabIndex={0}
                className="text-gruvbox-orange inline pointer-events-auto cursor-pointer focus:outline-none focus:bg-gruvbox-dark3"
                onClick={(e) => {
                  e.stopPropagation();
                  createOrSelectWorkspace(el.match);
                }}
              >
                <span className="text-gruvbox-dark4">{`{`}</span>
                {el.match}
                <span className="text-gruvbox-dark4">{`}`}</span>
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default Text;
