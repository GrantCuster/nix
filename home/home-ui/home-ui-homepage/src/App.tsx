import { useEffect, useRef, useState } from 'react'
import './App.css'
import TimeAgo from 'react-timeago'
import { spaceInputAtom, workspacesAtom } from './atoms'
import { useAtom } from 'jotai'
import { getCurrentDate, getCurrentTime, useCreateWorkspace, useGetWorkspaceTree, useSelectWorkspace, useSubscribeToScreenshots, useSubscribeToSystemIdeas, useSubscribeToTodos } from './hooks'

function App() {
  const [spaceInput, setSpaceInput] = useAtom(spaceInputAtom)
  const spaceInputRef = useRef<HTMLInputElement | null>(null)
  const selectWorkspace = useSelectWorkspace();
  const createWorkspace = useCreateWorkspace();
  const { workspaces, getWorkspaceTree } = useGetWorkspaceTree();

  let activeSpaces = workspaces;
  if (spaceInput.length > 0) {
    activeSpaces = workspaces.filter(space => space !== null).filter(space => space.name.includes(spaceInput));
  }

  useEffect(() => {
    function handleFocus() {
      spaceInputRef.current?.focus();
    }
    window.addEventListener('focus', handleFocus);
    return () => {
      window.removeEventListener('focus', handleFocus)
    }
  })

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        selectWorkspace(workspaces[0])
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  })



  return (
    <div className='h-screen overflow-hidden bg-gruvbox-background text-gruvbox-foreground flex flex-col'>
      <div className='flex justify-between px-4 pb-2 pt-2 text-gruvbox-light2'>
        <div>{getCurrentDate()}</div>
        <div>{getCurrentTime()}</div>
      </div>
      <div className='flex h-full border-gruvbox-dark3 border-t'>
        <div className='w-3/4 overflow-hidden flex flex-col'>
          <div className='grow'>
            <div className=''>
              <form onSubmit={(e) => {
                e.preventDefault()
                if (activeSpaces.length > 0 && !e.ctrlKey) {
                  selectWorkspace(activeSpaces[0])
                } else {
                  createWorkspace(spaceInput)
                }
                setSpaceInput('');
              }}>
                <input ref={spaceInputRef} className='w-full text-gruvbox-foreground text-lg px-4 placeholder:text-gruvbox-dark4 bg-gruvbox-dark0 py-3 font-bold focus:outline-none ' placeholder='What are you working on?' spellCheck='false' type="text" value={spaceInput} onChange={e => setSpaceInput(e.currentTarget.value)}
                />
              </form>
            </div>
            <ListSpaces />
          </div>
          <div className='h-[240px]'>
            <RecentScreenshots />
          </div>
        </div>
        <div className='w-1/4 text-gruvbox-light3 overflow-hidden h-full border-l border-gruvbox-dark3 flex flex-col'>
          <Todo />
          <SystemIdeas />
        </div>
      </div>
    </div >
  )
}

function RecentScreenshots() {
  const { screenshots } = useSubscribeToScreenshots();

  const lines = screenshots.split('\n').filter(line => line.length > 0).reverse();

  return <div className='h-full border-gruvbox-dark3 border-t flex flex-col overflow-hidden'>
    <div className='pt-2 pb-4 px-4 text-sm uppercase text-gruvbox-light2'>Recent Screenshots</div>
    <div className='grow w-full grid-cols-4 gap-6 px-4 grid h-full'>{lines.slice(0, 4).map(location => <div className='flex justify-center items-start'><img className="w-auto h-auto border border-gruvbox-dark3 opacity-50 hover:opacity-100" src={`http://localhost:6049${location}`} /></div>)}</div>
  </div>
}


function SystemIdeas() {
  const { systemIdeas } = useSubscribeToSystemIdeas();

  const lines = systemIdeas.split('\n');

  return <div className='overflow-auto h-full border-t border-gruvbox-dark3'><div className='px-4 py-2 text-sm uppercase'>System ideas</div>
    <div className='bg-gruvbox-dark3 flex-col flex py-px gap-px'>{lines.filter(line => line.length > 0).map((line, i) => {
      const splits = line.split(']');
      const hasX = splits[0].includes('x');
      return <div className={`flex gap-3 bg-gruvbox-background px-4 py-2 items-center ${hasX ? 'hidden' : ''}`}><div>{splits[1]}</div></div>
    })}</div>
  </div>
}



function Todo() {
  const { todos } = useSubscribeToTodos();

  const lines = todos.split('\n');

  return <div className='overflow-auto h-full'><div className='px-4 py-2 text-sm uppercase'>Active todos</div>
    <div className='bg-gruvbox-dark3 flex-col flex py-px gap-px'>{lines.filter(line => line.length > 0).map((line, i) => {
      const splits = line.split(']');
      const hasX = splits[0].includes('x');
      return <div className={`flex gap-3 bg-gruvbox-background px-4 py-2 items-center ${hasX ? 'hidden' : ''}`}><div>{splits[1]}</div></div>
    })}</div>
  </div>
}

function ListSpaces() {
  const [spaceInput] = useAtom(spaceInputAtom)
  const selectWorkspace = useSelectWorkspace();

  const { workspaces, getWorkspaceTree } = useGetWorkspaceTree();

  useEffect(() => {
    getWorkspaceTree()
  }, [])

  let activeSpaces = workspaces.filter(space => space !== null)
  if (spaceInput.length > 0) {
    activeSpaces = workspaces.filter(space => space !== null).filter(space => space.name.includes(spaceInput));
  }

  return <div className='flex flex-col grow overflow-auto '><div className='gap-px py-px bg-gruvbox-dark2 flex flex-col'>{activeSpaces.map(space => {
    const splits = space.name.split(':')
    return <div key={space.id} className='w-full bg-gruvbox-background'><button className='px-4 py-2 w-full flex justify-between hover:bg-gruvbox-dark1 focus:bg-gruvbox-dark1 focus:outline-none focus:border-none' onClick={() => selectWorkspace(space)}>
      {splits.length > 1 ? <div className='flex gap-3'><div className='text-left text-gruvbox-light4'>{splits[0]}</div><div>{splits[1]}</div></div> : <div>{space.name}</div>}
      {space.startTime ? <div className='text-gruvbox-light4'><TimeAgo date={space.startTime} /></div> : null}
    </button></div>
  })}</div ></div>
}

export default App
