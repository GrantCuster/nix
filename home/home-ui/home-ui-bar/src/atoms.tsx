import { atom } from 'jotai'
import { SpaceType } from './App';

export const workspacesAtom = atom<SpaceType[]>([]);
export const spaceInputAtom = atom('');

