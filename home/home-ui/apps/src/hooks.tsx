import useWebSocket from "react-use-websocket";
import { socketUrl } from "./consts";
import { SpaceType } from "./types";
import { createElement, useEffect, useState } from "react";
import { useAtom, useSetAtom } from "jotai";
import { marked } from "marked";
import {
  activeWorkspaceAtom,
  barItemMapAtom,
  workSpaceIdCounterAtom,
} from "./atoms";

export const socketOptions = {
  share: true,
  shouldReconnect: () => true,
};

export const useSelectWorkspace = () => {
  const { sendJsonMessage } = useWebSocket(socketUrl, socketOptions);
  const setActiveWorkspace = useSetAtom(activeWorkspaceAtom);

  function selectWorkspace(space: SpaceType) {
    setActiveWorkspace(space.name);

    let payload = "";
    payload += `hyprctl dispatch workspace ${space.id}; `;
    payload += `save_history "/tmp/workspace_history" "${space.name}"; `;

    const content = {
      action: "command",
      payload: payload,
    };

    sendJsonMessage(content);

    sendJsonMessage({
      action: "workspaces_updated",
    });
  }
  return selectWorkspace;
};

export const useCreateWorkspace = () => {
  const { sendJsonMessage } = useWebSocket(socketUrl, socketOptions);
  const setActiveWorkspace = useSetAtom(activeWorkspaceAtom);
  const [workspaceIdCounter, setWorkspaceIdCounter] = useAtom(
    workSpaceIdCounterAtom
  );

  function createWorkspace(newName: string) {
    setActiveWorkspace(newName);

    let payload = "";
    payload += `hyprctl dispatch workspace empty; `;
    payload += `id=$(hyprctl activeworkspace -j | jq -r ".id"); `;
    payload += `hyprctl dispatch renameworkspace "$id" "${newName}"; `;
    payload += `save_history "/tmp/workspace_history" "${newName}"; `;

    sendJsonMessage({
      action: "command",
      payload,
    });

    setTimeout(
      () =>
        sendJsonMessage({
          action: "workspaces_updated",
        }),
      200
    );
  }

  return createWorkspace;
};

export const underscoresForKeys = (string: string) => {
  return string.replace(/ /g, "_").replace(/:/g, "_").replace(/-/g, "_");
};

export const useCreateOrSelectWorkspace = () => {
  const { sendJsonMessage } = useWebSocket(socketUrl, socketOptions);
  const { workspaces } = useGetWorkspaceTree();

  function createOrSelectWorkspace(name: string) {
    const workspaceNames = workspaces.map((w) => w.name);
    let payload = "";
    if (workspaceNames.includes(name)) {
      const index = workspaceNames.indexOf(name);
      const space = workspaces[index];
      payload += `hyprctl dispatch workspace ${space.id}; `;
      payload += `save_history "/tmp/workspace_history" "${name}"; `;
    } else {
      payload += `hyprctl dispatch workspace empty; `;
      payload += `id=$(hyprctl activeworkspace -j | jq -r ".id"); `;
      payload += `hyprctl dispatch renameworkspace "$id" "${name}"; `;
      payload += `set_workspace_created_at "${underscoresForKeys(name)}"; `;
      payload += `save_history "/tmp/workspace_history" "${name}"; `;
    }

    sendJsonMessage({
      action: "update_bar_name",
      payload: name,
    });
    sendJsonMessage({
      action: "command",
      payload,
    });
  }

  return createOrSelectWorkspace;
};

export const useGetWorkspaceTree = () => {
  const { lastJsonMessage, sendJsonMessage } = useWebSocket(
    socketUrl,
    socketOptions
  );
  const [currentTree, setCurrentTree] = useState<SpaceType[]>([]);

  function getWorkspaceTree() {
    sendJsonMessage({
      action: "get_workspace_tree",
    });
  }

  useEffect(() => {
    if (lastJsonMessage) {
      if (lastJsonMessage.action === "get_workspace_tree") {
        setCurrentTree(lastJsonMessage.response);
      }
    }
  }, [lastJsonMessage]);

  return { workspaces: currentTree, getWorkspaceTree };
};

export const useGetCreatedAtTimestamps = () => {
  const { lastJsonMessage, sendJsonMessage } = useWebSocket(
    socketUrl,
    socketOptions
  );
  const [timestamps, setTimestamps] = useState<Record<string, string>>({});

  function getCreatedAtTimestamps() {
    sendJsonMessage({
      action: "get_created_at_timestamps",
    });
  }

  useEffect(() => {
    if (lastJsonMessage) {
      if (lastJsonMessage.action === "get_created_at_timestamps") {
        setTimestamps(lastJsonMessage.response);
      }
    }
  }, [lastJsonMessage]);

  return { timestamps, getCreatedAtTimestamps };
};

export const useSubscribeToTodos = () => {
  const { lastJsonMessage, sendJsonMessage } = useWebSocket(
    socketUrl,
    socketOptions
  );
  const [todos, setTodos] = useState<string>("");

  function getTodos() {
    sendJsonMessage({
      action: "active_todos_updated",
    });
  }

  useEffect(() => {
    if (lastJsonMessage) {
      if (lastJsonMessage.action === "active_todos_updated") {
        setTodos(lastJsonMessage.response);
      }
    }
  }, [lastJsonMessage]);

  useEffect(() => {
    getTodos();
  }, []);

  return { todos, getTodos };
};

export const useSubscribeToSystemIdeas = () => {
  const { lastJsonMessage, sendJsonMessage } = useWebSocket(
    socketUrl,
    socketOptions
  );
  const [systemIdeas, setSystemIdeas] = useState<string>("");

  function getSystemIdeas() {
    sendJsonMessage({
      action: "system_ideas_updated",
    });
  }

  useEffect(() => {
    if (lastJsonMessage) {
      if (lastJsonMessage.action === "system_ideas_updated") {
        setSystemIdeas(lastJsonMessage.response);
      }
    }
  }, [lastJsonMessage]);

  useEffect(() => {
    getSystemIdeas();
  }, []);

  return { systemIdeas, getSystemIdeas };
};

export const useSubscribeToScreenshots = () => {
  const { lastJsonMessage, sendJsonMessage } = useWebSocket(
    socketUrl,
    socketOptions
  );
  const [screenshots, setScreenshots] = useState<string>("");

  function getScreenshots() {
    sendJsonMessage({
      action: "screenshots_updated",
    });
  }

  useEffect(() => {
    if (lastJsonMessage) {
      if (lastJsonMessage.action === "screenshots_updated") {
        setScreenshots(lastJsonMessage.response);
      }
    }
  }, [lastJsonMessage]);

  useEffect(() => {
    getScreenshots();
  }, []);

  return { screenshots, getScreenshots };
};

export function getCurrentDate() {
  const now = new Date();
  const options = {
    weekday: "long",
    year: "numeric",
    day: "numeric",
    month: "long",
  };
  // @ts-ignore
  return now.toLocaleDateString(undefined, options);
}
export function getCurrentTime() {
  const now = new Date();
  const options = {
    hour: "numeric",
    minute: "numeric",
  };
  // @ts-ignore
  return now.toLocaleTimeString(undefined, options);
}

export const useSubscribeToActiveWorkspace = () => {
  const { lastJsonMessage, sendJsonMessage } = useWebSocket(
    socketUrl,
    socketOptions
  );
  const [activeWorkspace, setActiveWorkspace] = useAtom(activeWorkspaceAtom);

  function getActiveWorkspace() {
    sendJsonMessage({
      action: "workspaces_updated",
    });
  }

  useEffect(() => {
    if (lastJsonMessage) {
      if (lastJsonMessage.action === "update_bar_name") {
        setActiveWorkspace(lastJsonMessage.response);
      }
    }
  }, [lastJsonMessage]);

  useEffect(() => {
    getActiveWorkspace();
  }, []);

  return { activeWorkspace, getActiveWorkspace };
};

export const useGetActiveTodos = () => {
  const { lastJsonMessage, sendJsonMessage } = useWebSocket(
    socketUrl,
    socketOptions
  );
  const [activeTodos, setActiveTodos] = useState<string[]>([]);

  function getActiveTodos() {
    sendJsonMessage({
      action: "active_todos_updated",
    });
  }

  useEffect(() => {
    if (lastJsonMessage) {
      if (lastJsonMessage.action === "active_todos_updated") {
        const raw = lastJsonMessage.response;
        const lines = raw.split("\n");
        const filtered = lines.filter((l: string) => l.slice(0, 5) === "- [ ]");
        const todos = filtered.map((l: string) => l.slice(6));
        setActiveTodos(todos);
      }
    }
  }, [lastJsonMessage]);

  useEffect(() => {
    getActiveTodos();
  }, []);

  return { activeTodos, getActiveTodos };
};

export const useGetCouldDo = () => {
  const { lastJsonMessage, sendJsonMessage } = useWebSocket(
    socketUrl,
    socketOptions
  );
  const [couldDo, setCouldDo] = useState<string[]>([]);

  function getCouldDo() {
    sendJsonMessage({
      action: "system_ideas_updated",
    });
  }

  useEffect(() => {
    if (lastJsonMessage) {
      if (lastJsonMessage.action === "system_ideas_updated") {
        const raw = lastJsonMessage.response;
        const lines = raw.split("\n");
        const filtered = lines.filter((l: string) => l.slice(0, 5) === "- [ ]");
        const todos = filtered.map((l: string) => l.slice(6));
        setCouldDo(todos);
      }
    }
  }, [lastJsonMessage]);

  useEffect(() => {
    getCouldDo();
  }, []);

  return { couldDo, getCouldDo };
};

export const useSubscribeToBattery = () => {
  const { lastJsonMessage, sendJsonMessage } = useWebSocket(
    socketUrl,
    socketOptions
  );
  const [battery, setBattery] = useState<string>("");

  function getBattery() {
    sendJsonMessage({
      action: "battery_status",
    });
  }

  useEffect(() => {
    if (lastJsonMessage) {
      if (lastJsonMessage.action === "battery_status") {
        setBattery(JSON.parse(lastJsonMessage.response));
      }
    }
  }, [lastJsonMessage]);

  useEffect(() => {
    getBattery();
  }, []);

  return { battery, getBattery };
};

export const useSubscribeToVolume = () => {
  const { lastJsonMessage, sendJsonMessage } = useWebSocket(
    socketUrl,
    socketOptions
  );
  const [volume, setVolume] = useState<string>("");

  function getVolume() {
    sendJsonMessage({
      action: "volume_status",
    });
  }

  useEffect(() => {
    if (lastJsonMessage) {
      if (lastJsonMessage.action === "volume_status") {
        setVolume(lastJsonMessage.response);
      }
    }
  }, [lastJsonMessage]);

  useEffect(() => {
    getVolume();
  }, []);

  return { volume, getVolume, setVolume };
};
