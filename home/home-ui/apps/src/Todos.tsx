import { useEffect, useRef } from "react";
import { useCreateOrSelectWorkspace, useGetFileTodos } from "./hooks";
import { SquareIcon } from "lucide-react";

export function Todos({
  location,
  watchMessage,
  title,
}: {
  location: string;
  watchMessage: string;
  title: string;
}) {
  const { todos, getTodos, markTodoDone, addTodo } = useGetFileTodos(
    location,
    watchMessage
  );
  const createOrSelectWorkspace = useCreateOrSelectWorkspace();
  const todoInputRef = useRef<HTMLInputElement | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const todoRef = useRef<Array<string>>([]);

  useEffect(() => {
    const handleFocus = () => {
      getTodos();
    };
    window.addEventListener("focus", handleFocus);
    return () => {
      window.removeEventListener("focus", handleFocus);
    };
  });

  function scrollToBottom() {
    scrollRef.current!.scrollTo(0, 9999);
  }

  useEffect(() => {
    if (todos.length > todoRef.current.length) {
      scrollToBottom();
    }
  }, [todos, todoRef]);

  return (
    <div
      className="h-1/2 overflow-hidden flex flex-col"
      onMouseEnter={() => {
        todoInputRef.current!.focus();
      }}
    >
      <div className="border-b-2 border-t-2 border-gruvbox-dark0 text-gruvbox-light2 uppercase text-sm flex">
        <div className="px-3 py-2 grow">{title}</div>
        <button
          className="py-2 px-3 hover:bg-gruvbox-dark1"
          onClick={() => {
            const t = todos[Math.floor(Math.random() * todos.length)];
            createOrSelectWorkspace("task:" + t);
          }}
        >
          random
        </button>
      </div>
      <div className="flex flex-col grow overflow-hidden">
        <div ref={scrollRef} className="grow overflow-auto">
          {todos.map((t) =>
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
                <button
                  className="px-3 hover:bg-gruvbox-dark3 cursor-pointer"
                  onClick={(e) => {
                    e.preventDefault();
                    markTodoDone(t);
                  }}
                >
                  <SquareIcon size={13} />
                </button>
              </div>
            ) : null
          )}
        </div>
        <input
          className="text-sm border-b-2 px-3 py-2 border-b-gruvbox-dark0 text-gruvbox-light2 placeholder:text-gruvbox-dark3 focus:outline-none w-full bg-gruvbox-dark0"
          ref={todoInputRef}
          type="text"
          placeholder={`Add ${title}`}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              addTodo(e.currentTarget.value, e.shiftKey);
              e.currentTarget.value = "";
            }
          }}
        />
      </div>
    </div>
  );
}
