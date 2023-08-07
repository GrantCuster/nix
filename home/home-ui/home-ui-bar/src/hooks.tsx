import useWebSocket from 'react-use-websocket';
import { socketUrl } from './consts';
import { SpaceType } from './types';
import { useEffect, useState } from 'react';

const socketOptions = {
  share: true
}

export const useSelectWorkspace = () => {
  const { sendJsonMessage } = useWebSocket(socketUrl, socketOptions);

  function selectWorkspace(space: SpaceType) {
    let payload = ''
    payload += `hyprctl dispatch workspace ${space.id}; `;
    payload += `save_history "/tmp/workspace_history" "${space.name}"`

    const content = {
      action: "command",
      payload: payload
    }

    sendJsonMessage(content)
  }
  return selectWorkspace;
}

export const useSubscribeToActiveWorkspace = () => {
  const { lastJsonMessage, sendJsonMessage } = useWebSocket(socketUrl, socketOptions);
  const [activeWorkspace, setActiveWorkspace] = useState<string>('');

  function getActiveWorkspace() {
    sendJsonMessage({
      action: 'workspaces_updated',
    });
  }

  useEffect(() => {
    if (lastJsonMessage) {
      if (lastJsonMessage.action === 'active_workspace_updated') {
        setActiveWorkspace(lastJsonMessage.response)
      }
    }
  }, [lastJsonMessage])

  useEffect(() => {
    getActiveWorkspace()
  }, [])

  return { activeWorkspace, getActiveWorkspace }
}

export function getCurrentDate() {
  const now = new Date();
  const options = {
    weekday: 'long',
    year: 'numeric',
    day: 'numeric',
    month: 'long',
  };
  // @ts-ignore
  return now.toLocaleDateString(undefined, options);
}

export function getCurrentTime() {
  const now = new Date();
  const options = {
    hour: 'numeric',
    minute: 'numeric',
  };
  // @ts-ignore
  return now.toLocaleTimeString(undefined, options)
}
