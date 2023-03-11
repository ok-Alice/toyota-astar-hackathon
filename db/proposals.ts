import proposalData from './data/proposals.json';
import { saveData } from './utils';

export type Proposal = {
  id: number;
  projectId: number;
  address: string;
  name: string;
  description: string;
  yesVotes: number;
  noVotes: number;
  endDate: string;
};

const listProjectProposals = (projectId: number) =>
  proposalData.filter((proposal: Proposal) => proposal.projectId === projectId);

const createProposal = (
  projectId: number,
  address: string,
  name: string,
  description: string
) => {
  const proposal = {
    id: proposalData.length,
    projectId,
    address,
    name,
    description,
    yesVotes: 0,
    noVotes: 0,
    endDate: new Date().toISOString()
  } as Proposal;
  // @ts-ignore
  proposalData.push(proposal);
  saveData(proposalData, 'proposals.json');
  return proposal;
};

export const projectsDB = {
  list: listProjectProposals,
  create: createProposal
};
