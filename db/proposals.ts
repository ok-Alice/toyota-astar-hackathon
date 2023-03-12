import proposalData from './data/proposals.json';
import { saveData } from './utils';

export type Proposal = {
  id: number;
  projectId: number;
  userId: number;
  address: string;
  name: string;
  description: string;
  yesVotes: number;
  noVotes: number;
  status: 'ACTIVE' | 'PASSED' | 'DECLINED';
  blockNumber: number;
};

const listProjectProposals = (projectId: number) =>
  proposalData.filter((proposal: Proposal) => proposal.projectId === projectId);

const createProposal = (
  projectId: number,
  address: string,
  name: string,
  description: string,
  blockNumber: number
) => {
  const proposal = {
    id: proposalData.length,
    projectId,
    address,
    name,
    description,
    yesVotes: 0,
    noVotes: 0,
    blockNumber
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
