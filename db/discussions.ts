import discussionData from './data/discussions.json';
import { saveData } from './utils';

export type Message = {
  id: number;
  userId: string;
  message: string;
  timestamp: string;
};

export type Discussion = {
  id: number;
  proposalId: number;
  messages: Message[];
};

export type ProposalDiscussions = {
  id: number;
  projectId: number;
  discussions: Discussion[];
};

const getProjectDiscussions = (projectId: number) =>
  discussionData.find((x) => x.projectId === projectId);

const getProposalDiscussion = (projectId: number, proposalId: number) => {
  const projectDiscussions = getProjectDiscussions(projectId);
  if (!projectDiscussions) return null;
  return projectDiscussions.discussions.find(
    (x) => x.proposalId === proposalId
  );
};

const addMessage = (
  projectId: number,
  proposalId: number,
  message: string,
  userId: number
) => {
  const projectDiscussions = getProjectDiscussions(projectId);
  let discussion = getProposalDiscussion(projectId, proposalId);

  if (!discussion) {
    discussion = {
      id: projectDiscussions?.discussions.length || 0,
      proposalId,
      messages: []
    };
  }

  const newMessage = {
    id: discussion.messages.length,
    userId,
    message,
    timestamp: new Date().toISOString()
  };

  discussion.messages.push(newMessage);
  projectDiscussions?.discussions.push(discussion);

  saveData(discussionData, 'discussions.json');
  return newMessage;
};

export const discussionsDB = {
  list: getProjectDiscussions,
  get: getProposalDiscussion,
  create: addMessage
};
