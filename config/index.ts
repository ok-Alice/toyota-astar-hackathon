import assert from 'assert';

export type AppConfig = {
  appName: string;
  providerSocket: string;
  customRPCMethods?: object;
  proposalVotingDelay: number;
  proposalVotingPeriod: number;
};

const appName = process.env.NEXT_APP_NAME;
const providerSocket = process.env.NEXT_PROVIDER_SOCKET;
const proposalVotingDelay = process.env.NEXT_PROPOSAL_VOTING_DELAY;
const proposalVotingPeriod = process.env.NEXT_PROPOSAL_VOTING_PERIOD;

assert(appName, 'APP_NAME was not provided.');
assert(providerSocket, 'PROVIDER_SOCKET was not provided.');
assert(proposalVotingDelay, 'NEXT_PROPOSAL_VOTING_DELAY was not provided.');
assert(proposalVotingPeriod, 'NEXT_PROPOSAL_VOTING_PERIOD was not provided.');

export const appConfig: AppConfig = {
  appName,
  providerSocket,
  proposalVotingDelay: parseInt(proposalVotingDelay, 10),
  proposalVotingPeriod: parseInt(proposalVotingPeriod, 10)
};
