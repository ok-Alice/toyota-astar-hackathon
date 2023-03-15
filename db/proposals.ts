import proposalData from './data/proposals.json';
import { saveData } from './utils';

export type Proposal = {
  id: number;
  projectId: number;
  userId: number;
  title: string;
  description: string;
  yesVotes: number;
  noVotes: number;
  status: 'ACTIVE' | 'COMPLETED' | 'DECLINED';
  createdAtBlock: number;
  internal: boolean;
};

const getProjectProposal = (projectId: number, proposalId: number) => {
  const proposal = proposalData.find(
    (x: Proposal) => x.id === proposalId && x.projectId === projectId
  );
  return proposal;
};

const listProjectProposals = (projectId: number) =>
  proposalData.filter((proposal: Proposal) => proposal.projectId === projectId);

const createProposal = (
  title: string,
  description: string,
  projectId: number,
  createdAtBlock: number,
  internal: boolean
) => {
  const proposal = {
    id: proposalData.length,
    projectId,
    title,
    description,
    yesVotes: 0,
    noVotes: 0,
    createdAtBlock,
    internal
  } as Proposal;
  // @ts-ignore
  proposalData.push(proposal);
  saveData(proposalData, 'proposals.json');
  return proposal;
};

const doVote = (projectId: number, proposalId: number, vote: 'yes' | 'no') => {
  const proposal = getProjectProposal(projectId, proposalId);
  if (!proposal) return;

  if (vote === 'yes') (proposal as Proposal).yesVotes += 1;
  if (vote === 'no') (proposal as Proposal).noVotes += 1;
  saveData(proposalData, 'proposals.json');
};

export const proposalDB = {
  get: getProjectProposal,
  list: listProjectProposals,
  create: createProposal,
  doVote
};
