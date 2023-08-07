import { useEffect, useState } from 'react';
import './App.css'
import { getCurrentTime, useSubscribeToActiveWorkspace } from './hooks'
import { ArrowLeft, Circle, CircleDot, CircleIcon, Dot, DotIcon } from 'lucide-react';
import { useWebSocket } from 'react-use-websocket/dist/lib/use-websocket';
import { socketUrl } from './consts';

function App() {
  const { activeWorkspace } = useSubscribeToActiveWorkspace();
  const { sendJsonMessage } = useWebSocket(socketUrl);

  const splits = activeWorkspace.split(':')
  return (
    <div className='h-screen overflow-hidden bg-gruvbox-background text-gruvbox-foreground flex flex-col'>
      <div className='flex justify-between pt-[3px] text-gruvbox-light2'>
        <div className='flex'>
          <button className='px-2 border-r border-gruvbox-dark0 flex items-center' onClick={() => {
            sendJsonMessage({ action: "command", payload: "back_to_workspace" })
          }}><ArrowLeft size={12} /></button>

          <button className='px-2 border-r border-gruvbox-dark0 flex items-center' onClick={() => {
            sendJsonMessage({ action: "command", payload: "go_home_space" })
          }}>

            {splits.length > 1 ? <div className='flex gap-3'><div className='text-left text-gruvbox-light4'>{splits[0]}</div>{splits[1]}</div> : <div>{activeWorkspace}</div>}


          </button>


        </div>

        <Clock />
      </div>
    </div>
  )
}

function Clock() {
  const [, setBump] = useState('bump')

  useEffect(() => {
    setInterval(() => setBump('bump'), 1000);
  }, [])

  return <div className='px-3'>{getCurrentTime()}</div>
}

export default App
