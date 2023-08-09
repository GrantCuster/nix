import { PauseIcon, PlayIcon, TimerResetIcon, XIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const formatTime = (seconds: number) => {
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const adjustedMinutes = minutes % 60;
  const adjustedSeconds = seconds % 60;
  let format = "";
  if (hours > 0) {
    format += hours + "h ";
  }
  if (adjustedMinutes > 0) {
    format += adjustedMinutes + "m ";
  }
  if (adjustedSeconds > 0) {
    format += adjustedSeconds + "s";
  }
  return format;
};

function Timer() {
  const [time, setTime] = useState(0);
  const [limit, setLimit] = useState(60 * 20);
  const [isActive, setIsActive] = useState(false);
  const [editingLimit, setEditingLimit] = useState(false);
  const [mode, setMode] = useState<"timer" | "log">("timer");
  const intervalRef = useRef(0);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const startTimer = () => {
    function incrementTimer() {
      setTime((prev) => prev + 1);
    }
    clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      incrementTimer();
    }, 1000);
  };

  useEffect(() => {
    if (isActive) {
      startTimer();
    }
    return () => {
      clearInterval(intervalRef.current);
    };
  }, []);

  return (
    <div className="bg-gruvbox-background text-gruvbox-foreground h-screen flex items-center overflow-hidden w-full relative select-none max-h-[32px] px-4">
      <div
        className={`absolute h-full ${
          isActive ? "bg-gruvbox-green" : "bg-gruvbox-light2"
        }`}
        style={{
          width: (time / limit) * 100 + "%",
        }}
      ></div>
      <div className="flex w-full relative mix-blend-difference items-center font-bold justify-between">
        <div className="flex items-center">
          <button
            className="hover:bg-gruvbox-background hover:bg-opacity-50 p-1"
            onClick={() => {
              if (isActive) {
                clearInterval(intervalRef.current);
                setIsActive(false);
              } else {
                startTimer();
                setIsActive(true);
              }
            }}
          >
            {isActive ? <PauseIcon size={16} /> : <PlayIcon size={16} />}
          </button>
          <button className="hover:bg-gruvbox-background hover:bg-opacity-50 p-1">
            <TimerResetIcon size={16} onClick={() => setTime(0)} />
          </button>
        </div>
        <div className="cursor-default grow text-center">
          {formatTime(Math.min(time, limit))}
        </div>
        <div>
          {editingLimit ? (
            <div className="flex mix-blend-difference">
              <button className="px-2 hover:bg-gruvbox-background hover:bg-opacity-50">
                log
              </button>
              <input
                ref={inputRef}
                className="w-20 bg-gruvbox-background border border-gruvbox-foreg20mround focus:border focus:border-gruvbox-foreground px-1 focus:outline-none"
                autoFocus={true}
                defaultValue={formatTime(limit).trim()}
                spellCheck="false"
                onFocus={(e) => {
                  e.currentTarget.select();
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    const splits = e.currentTarget.value.split(" ");
                    let seconds = 0;
                    for (const split of splits) {
                      if (split.includes("h")) {
                        seconds += parseInt(split) * 60 * 60;
                      }
                      if (split.includes("m")) {
                        seconds += parseInt(split) * 60;
                      }
                      if (!split.includes("h") && !split.includes("m")) {
                        seconds += parseInt(split);
                      }
                    }
                    setLimit(seconds);
                    setEditingLimit(false);
                  }
                }}
              />
              <button className="px-2 hover:bg-gruvbox-background hover:bg-opacity-50">
                <XIcon size={16} onClick={() => setEditingLimit(false)} />
              </button>
            </div>
          ) : (
            <button
              className="px-2 cursor-pointer hover:bg-gruvbox-background hover:bg-opacity-50"
              onClick={() => {
                setEditingLimit(true);
              }}
            >
              {formatTime(limit)}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default Timer;