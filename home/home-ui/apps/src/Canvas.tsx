import { useAtom, useSetAtom } from "jotai";
import { useEffect, useRef, useState } from "react";
import {
  barItemMapAtom,
  blockIdsAtom,
  blockMapAtom,
  blockMenuAtom,
  cameraAtom,
  createWorkspaceMenuAtom,
  cursorAtom,
  homeBarItemMap,
} from "./atoms";
import { v4 as uuid } from "uuid";
import {
  BlockIdsType,
  BlockMapType,
  BlockType,
  Box,
  Camera,
  Point,
  Size,
  WorkspaceBlockType,
} from "./Types";
import {
  useCreateOrSelectWorkspace,
  useCreateWorkspace,
  useSelectWorkspace,
} from "./hooks";
import { useGesture } from "react-use-gesture";
import { Button } from "./Bar";
import { XIcon } from "lucide-react";

const cell = 24;

function canvasToScreen(point: Point, camera: Camera): Point {
  return {
    x: (point.x + camera.x) * camera.z,
    y: (point.y + camera.y) * camera.z,
  };
}

function screenToCanvas(point: Point, camera: Camera): Point {
  return {
    x: point.x / camera.z - camera.x,
    y: point.y / camera.z - camera.y,
  };
}

function getViewport(camera: Camera, box: Box): Box {
  const topLeft = screenToCanvas({ x: box.minX, y: box.minY }, camera);
  const bottomRight = screenToCanvas({ x: box.maxX, y: box.maxY }, camera);

  return {
    minX: topLeft.x,
    minY: topLeft.y,
    maxX: bottomRight.x,
    maxY: bottomRight.y,
    height: bottomRight.x - topLeft.x,
    width: bottomRight.y - topLeft.y,
  };
}

function panCamera(camera: Camera, dx: number, dy: number): Camera {
  return {
    x: camera.x - dx / camera.z,
    y: camera.y - dy / camera.z,
    z: camera.z,
  };
}

function zoomCamera(camera: Camera, point: Point, dz: number): Camera {
  const zoom = camera.z - dz * camera.z;

  const p1 = screenToCanvas(point, camera);

  const p2 = screenToCanvas(point, { ...camera, z: zoom });

  return {
    x: camera.x + (p2.x - p1.x),
    y: camera.y + (p2.y - p1.y),
    z: zoom,
  };
}

function handleWheel(event: WheelEvent) {
  event.preventDefault();

  const { clientX: x, clientY: y, deltaX, deltaY, ctrlKey } = event;

  if (ctrlKey) {
    setCamera((camera) => zoomCamera(camera, { x, y }, deltaY / 100));
  } else {
    setCamera((camera) => panCamera(camera, deltaX, deltaY));
  }
}

function f(val: number) {
  return Math.floor(val / cell) * cell;
}

function r(val: number) {
  return Math.round(val / cell) * cell;
}

function Canvas() {
  const ref = useRef<HTMLDivElement>(null);
  const [camera, setCamera] = useAtom<Camera>(cameraAtom);
  const setBlockMenu = useSetAtom(blockMenuAtom);
  const setCreateWorkspaceMenu = useSetAtom(createWorkspaceMenuAtom);
  const [cursor] = useAtom(cursorAtom);
  const setBarItemMap = useSetAtom(homeBarItemMap);

  useEffect(() => {
    const handleFocus = () => {
      const stored = localStorage.getItem("barItemMap") || `{ }`;
      const data = JSON.parse(stored);
      setBarItemMap(data);
      // setCacheBump(Date.now());
    };
    window.addEventListener("focus", handleFocus);
    return () => {
      window.removeEventListener("focus", handleFocus);
    };
  }, []);

  useEffect(() => {
    function handleWheel(event: WheelEvent) {
      event.preventDefault();

      const { clientX, clientY, deltaX, deltaY, ctrlKey } = event;

      if (ctrlKey) {
        setCamera((camera) =>
          zoomCamera(camera, { x: clientX, y: clientY }, deltaY / 100)
        );
      } else {
        setCamera((camera) => panCamera(camera, deltaX, deltaY));
      }
    }

    const elm = ref.current;
    if (!elm) return;

    elm.addEventListener("wheel", handleWheel, { passive: false });

    return () => {
      elm.removeEventListener("wheel", handleWheel);
    };
  }, [ref]);

  const transform = `
  scale(${camera.z}) 
  translate(${camera.x}px, ${camera.y}px)
`;

  // keyboard listener for return
  useEffect(() => {
    function handleKeydown(e: KeyboardEvent) {
      if (document.activeElement?.tagName !== "INPUT") {
        if (e.key === "Enter") {
          setCreateWorkspaceMenu({
            origin: {
              x: cursor.x,
              y: cursor.y,
            },
          });
          e.preventDefault();
        }
      }
    }
    window.addEventListener("keydown", handleKeydown);
    return () => {
      window.removeEventListener("keydown", handleKeydown);
    };
  }, [cursor]);

  return (
    <div
      ref={ref}
      className="w-screen h-screen overflow-hidden bg-gruvbox-background"
      style={{
        backgroundSize: "24px 24px",
        backgroundImage: "radial-gradient(#7c6f64 1px, transparent 1px)",
        backgroundPosition: `${camera.x - 12}px ${camera.y - 12}px`,
      }}
      onPointerDown={(e) => {
        setCreateWorkspaceMenu(null);
        setCreateWorkspaceMenu({
          origin: {
            x: r(cursor.x),
            y: r(cursor.y),
          },
        });
        e.preventDefault();
      }}
    >
      <div
        className="text-gruvbox-foreground"
        style={{
          transform: transform,
        }}
      >
        <Cursor />
        <ActiveBlocks />
        <BlockMenu />
        <CreateWorkspaceMenu />
      </div>
    </div>
  );
}

function Cursor() {
  const [position, setPosition] = useAtom(cursorAtom);
  const [camera] = useAtom(cameraAtom);

  useEffect(() => {
    function setCursorPosition(e: PointerEvent) {
      const canvasPosition = screenToCanvas(
        { x: e.clientX, y: e.clientY },
        camera
      );
      setPosition({
        x: canvasPosition.x - cell / 2,
        y: canvasPosition.y - cell / 2,
      });
    }
    window.addEventListener("pointermove", setCursorPosition);
    return () => {
      window.removeEventListener("pointermove", setCursorPosition);
    };
  }, [camera]);

  useEffect(() => {
    function moveCursor(e: KeyboardEvent) {
      if (e.key === "ArrowLeft") {
        setPosition((prev) => {
          return {
            x: prev.x - cell,
            y: prev.y,
          };
        });
      } else if (e.key === "ArrowRight") {
        setPosition((prev) => {
          return {
            x: prev.x + cell,
            y: prev.y,
          };
        });
      } else if (e.key === "ArrowUp") {
        setPosition((prev) => {
          return {
            x: prev.x,
            y: prev.y - cell,
          };
        });
      } else if (e.key === "ArrowDown") {
        setPosition((prev) => {
          return {
            x: prev.x,
            y: prev.y + cell,
          };
        });
      }
    }
    window.addEventListener("keydown", moveCursor);
    return () => {
      window.removeEventListener("keydown", moveCursor);
    };
  });

  return (
    <div
      className="absolute rounded-full left-0 top-0 bg-gruvbox-foreground pointer-events-none"
      style={{
        transform: `translate(${position.x}px, ${position.y}px)`,
        width: cell,
        height: cell,
      }}
    ></div>
  );
}

function ActiveBlocks() {
  const [blockIds] = useAtom<BlockIdsType>(blockIdsAtom);
  const [blockMap] = useAtom<BlockMapType>(blockMapAtom);

  return (
    <>
      {blockIds.map((id) => {
        return <Block key={id} block={blockMap[id]} />;
      })}
    </>
  );
}

function Block({ block }: { block: BlockType }) {
  return (
    <div
      className="absolute bg-gruvbox-background"
      style={{
        left: block.origin.x,
        top: block.origin.y,
        width: block.size.width,
        height: block.size.height,
      }}
    >
      {block.type === "workspace" ? (
        <WorkspaceBlockContent block={block} />
      ) : null}
      <div className="absolute pointer-events-none inset-0 border border-gruvbox-foreground"></div>
    </div>
  );
}

function WorkspaceBlockContent({ block }: { block: WorkspaceBlockType }) {
  const setBlockMap = useSetAtom(blockMapAtom);
  const setBlockIds = useSetAtom(blockIdsAtom);
  const [camera] = useAtom(cameraAtom);
  const createOrSelectWorkspace = useCreateOrSelectWorkspace();
  const [cacheBump, setCacheBump] = useState(Date.now());
  const [barItemMap] = useAtom(barItemMapAtom);

  const originRef = useRef<Point>(block.origin);
  const sizeRef = useRef<Size>(block.size);

  const setBlock = (propname: string, propvalue: any) => {
    setBlockMap((prev) => {
      return {
        ...prev,
        [block.uuid]: {
          ...prev[block.uuid],
          [propname]: propvalue,
        },
      };
    });
  };

  // useEffect(() => {
  //   const handleFocus = () => {
  //     setCacheBump(Date.now());
  //   };
  //   window.addEventListener("focus", handleFocus);
  //   return () => {
  //     window.removeEventListener("focus", handleFocus);
  //   };
  // }, []);

  const dragHandle = useGesture({
    onDragStart: () => {
      originRef.current = { ...block.origin };
    },
    onDrag: ({ movement }) => {
      const canvasChange = screenToCanvas(
        { x: movement[0], y: movement[1] },
        { x: 0, y: 0, z: camera.z }
      );
      const x = originRef.current.x + canvasChange.x;
      const y = originRef.current.y + canvasChange.y;
      setBlock("origin", { x, y });
    },
    onDragEnd: ({ movement }) => {
      const canvasChange = screenToCanvas(
        { x: movement[0], y: movement[1] },
        { x: 0, y: 0, z: camera.z }
      );
      const x = f(originRef.current.x + canvasChange.x);
      const y = f(originRef.current.y + canvasChange.y);
      setBlock("origin", { x, y });
    },
  });

  const resizeHandle = useGesture({
    onPointerDown: ({ event }) => {
      event.stopPropagation();
    },
    onDragStart: () => {
      sizeRef.current = { ...block.size };
    },
    onDrag: ({ movement }) => {
      const canvasChange = screenToCanvas(
        { x: movement[0], y: movement[1] },
        { x: 0, y: 0, z: camera.z }
      );
      const width = sizeRef.current.width + canvasChange.x;
      const height = sizeRef.current.height + canvasChange.y;
      setBlock("size", { width, height });
    },
    onDragEnd: ({ movement }) => {
      const canvasChange = screenToCanvas(
        { x: movement[0], y: movement[1] },
        { x: 0, y: 0, z: camera.z }
      );
      const width = r(sizeRef.current.width + canvasChange.x);
      const height = r(sizeRef.current.height + canvasChange.y);
      setBlock("size", { width, height });
    },
  });

  return (
    <div
      className="absolute cursor-pointer inset-0 flex flex-col text-sm"
      onPointerDown={(e) => {
        e.stopPropagation();
      }}
    >
      <div className="flex">
        <div
          className="leading-6 h-6 grow px-2 cursor-move select-none"
          {...dragHandle()}
        >
          {block.name}
        </div>
        <Button
          className="w-8 px-0 bg-transparent flex justify-center items-center bg"
          action={(e) => {
            e.stopPropagation();
            setBlockIds((prev) => prev.filter((b) => b !== block.uuid));
          }}
        >
          <XIcon size={13} />
        </Button>
      </div>
      <button
        className="flex flex-col grow vrow w-full cursor-pointer"
        onPointerDown={() => {
          createOrSelectWorkspace(block.name);
        }}
      >
        <div
          className="grow w-full "
          style={{
            backgroundSize: "contain",
            backgroundPosition: "center center",
            backgroundRepeat: "no-repeat",
            backgroundImage: `url(http://localhost:6049/home/grant/screenshots/workspaces/${encodeURI(
              block.name
            )}.png?cacheBump=${cacheBump})`,
          }}
        ></div>
        <div className="h-6">
          {barItemMap[block.name] !== undefined ? (
            <AppSpaceTimers timers={barItemMap[block.name].timers} />
          ) : null}
        </div>
        <div
          className="absolute bottom-0 right-0 cursor-nw-resize w-6 h-6"
          {...resizeHandle()}
        ></div>
      </button>
    </div>
  );
}

function CreateWorkspaceMenu() {
  const [createWorkspaceMenu, setCreateWorkspaceMenu] = useAtom(
    createWorkspaceMenuAtom
  );
  const inputRef = useRef<HTMLInputElement | null>();
  const [blockIds, setBlockIds] = useAtom(blockIdsAtom);
  const [blockMap, setBlockMap] = useAtom(blockMapAtom);
  const createWorkspace = useCreateWorkspace();

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [createWorkspaceMenu?.origin]);

  useEffect(() => {
    function escapeClose(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setCreateWorkspaceMenu(null);
      }
    }
    window.addEventListener("keydown", escapeClose);
    return () => {
      window.removeEventListener("keydown", escapeClose);
    };
  }, []);

  return createWorkspaceMenu ? (
    <div
      className="absolute overflow-hidden bg-gruvbox-background"
      style={{
        left: createWorkspaceMenu.origin.x,
        top: createWorkspaceMenu.origin.y,
        width: cell * 10,
        height: cell * 2,
      }}
      onPointerDown={(e) => {
        e.stopPropagation();
      }}
    >
      <div className="leading-6 h-6 px-2 text-xs text-gruvbox-dark0 bg-gruvbox-light2 font-bold uppercase">
        Create workspace
      </div>
      <div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const newWorkspace = {
              uuid: "b" + uuid(),
              type: "workspace",
              name: inputRef.current!.value,
              id: null,
              origin: { ...createWorkspaceMenu.origin },
              size: {
                width: 12 * cell,
                height: 8 * cell,
              },
            };
            setBlockMap((prev) => {
              return {
                ...prev,
                [newWorkspace.uuid]: newWorkspace,
              };
            });
            setBlockIds((prev) => [...prev, newWorkspace.uuid]);
            setCreateWorkspaceMenu(null);
          }}
        >
          <input
            className="w-full bg-gruvbox-dark0 focus:outline-none leading-6 h-6 text-sm px-2 "
            ref={inputRef}
            type="text"
            onPointerDown={(e) => {
              e.stopPropagation();
            }}
            onKeyDown={() => {}}
          />
        </form>
      </div>
      <div className="absolute inset-0 border border-gruvbox-foreground pointer-events-none"></div>
    </div>
  ) : null;
}

function BlockMenu() {
  const [blockMenu, setBlockMenu] = useAtom(blockMenuAtom);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const setCreateWorkspaceMenu = useSetAtom(createWorkspaceMenuAtom);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [blockMenu?.origin]);

  const options = ["workspace", "text"];
  // TODO implement filtering

  function handleOption(optionString: string) {
    if (optionString === "workspace") {
      setCreateWorkspaceMenu((prev) => {
        return {
          ...prev,
          origin: blockMenu!.origin,
        };
      });
      setBlockMenu(null);
    }
  }

  return blockMenu ? (
    <div
      className="absolute overflow-hidden text-sm bg-gruvbox-background"
      style={{
        left: blockMenu.origin.x,
        top: blockMenu.origin.y,
        width: cell * 8,
        height: cell * 6,
      }}
      onPointerDown={(e) => {
        e.stopPropagation();
      }}
    >
      <div className="leading-6 h-6 px-2 text-xs text-gruvbox-dark0 bg-gruvbox-light2 font-bold uppercase">
        Create block
      </div>
      <div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleOption(options[selectedIndex]);
          }}
        >
          <input
            className="w-full bg-gruvbox-dark0 focus:outline-none leading-6 h-6 text-sm px-2 "
            ref={inputRef}
            type="text"
            onPointerDown={(e) => {
              e.stopPropagation();
            }}
            onKeyDown={() => {}}
          />
        </form>
      </div>
      <div>
        {options.map((option) => {
          return <div className="h-6 leading-6 px-2 text-sm ">{option}</div>;
        })}
      </div>
      <div className="absolute inset-0 border border-gruvbox-foreground"></div>
    </div>
  ) : null;
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

export default Canvas;
