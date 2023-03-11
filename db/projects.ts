import { Proposal } from './proposals';
import projectData from './data/projects.json';
import proposalData from './data/proposals.json';
import { saveData } from './utils';

export type Member = {
  id?: number;
  userId: number;
  role: string;
};
export type Project = {
  id?: number;
  address: string;
  name: string;
  description: string;
  proposals?: Proposal[];
  members?: Member[];
};

const getProposals = (projectId: number) =>
  proposalData.find((proposal: Proposal) => proposal.projectId === projectId);

const getProject = (id: number) => {
  const project = projectData.find((x) => x.id === id);
  if (!project) return null;
  return { ...project, proposals: getProposals(project.id) };
};

const createProject = (
  address: string,
  name: string,
  description: string,
  members: Member[]
) => {
  const project = {
    id: projectData.length,
    address,
    name,
    description,
    members: members.map(
      (member, index) => ({ id: index, ...member } as Member)
    )
  };
  // @ts-ignore
  projectData.push(project);
  saveData(projectData, 'projects.json');
  return project;
};

export const projectsDB = {
  list: projectData as Project[],
  get: getProject,
  create: createProject
};
