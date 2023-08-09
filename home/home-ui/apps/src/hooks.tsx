import useWebSocket from "react-use-websocket";
import { socketUrl } from "./consts";
import { SpaceType } from "./types";
import { useEffect, useState } from "react";
import { useAtom, useSetAtom } from "jotai";
import { activeWorkspaceAtom } from "./atoms";

const socketOptions = {
  share: true,
};

export const useSelectWorkspace = () => {
  const { sendJsonMessage } = useWebSocket(socketUrl, socketOptions);
  const setActiveWorkspace = useSetAtom(activeWorkspaceAtom);

  function selectWorkspace(space: SpaceType) {
    setActiveWorkspace(space.name);

    let payload = "";
    payload += `hyprctl dispatch movewindowpixel "exact 0 0,title:^(home_bar)$"; `;
    payload += `hyprctl dispatch workspace ${space.id}; `;
    payload += `save_history "/tmp/workspace_history" "${space.name}"; `;
    payload += `refresh_ui_websocket;`;

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

  function createWorkspace(newName: string) {
    setActiveWorkspace(newName);

    let payload = "";
    payload += `hyprctl dispatch workspace empty; `;
    payload += `id=$(hyprctl activeworkspace -j | jq -r ".id"); `;
    payload += `hyprctl dispatch renameworkspace "$id" "${newName}"; `;
    payload += `save_history "/tmp/workspace_history" "${newName}"; `;
    payload += `hyprctl dispatch movewindowpixel "exact 0 0,title:^(home_bar)$"; `;
    payload += `start_workspace_timer "${newName}"`;

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
      if (lastJsonMessage.action === "active_workspace_updated") {
        setActiveWorkspace(lastJsonMessage.response);
      }
    }
  }, [lastJsonMessage]);

  useEffect(() => {
    getActiveWorkspace();
  }, []);

  return { activeWorkspace, getActiveWorkspace };
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
        setBattery(lastJsonMessage.response);
      }
    }
  }, [lastJsonMessage]);

  useEffect(() => {
    getBattery();
  }, []);

  return { battery, getBattery };
};
