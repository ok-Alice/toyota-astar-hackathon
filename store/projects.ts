import { atom } from 'jotai';
import { Project } from 'db/projects';

export const projectsAtom = atom<Project[] | null>(null);
export const currentProject = atom<Project | null>(null);
