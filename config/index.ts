import assert from 'assert';

export type AppConfig = {
  appName: string;
  providerSocket: string;
  customRPCMethods?: object;
  proposalVotingDelay: number;
  proposalVotingPeriod: number;
};

const appName = process.env.NEXT_PUBLIC_APP_NAME;
const providerSocket = process.env.NEXT_PUBLIC_PROVIDER_SOCKET;
const proposalVotingDelay = process.env.NEXT_PUBLIC_PROPOSAL_VOTING_DELAY;
const proposalVotingPeriod = process.env.NEXT_PUBLIC_PROPOSAL_VOTING_PERIOD;

assert(appName, 'NEXT_PUBLIC_APP_NAME was not provided.');
assert(providerSocket, 'NEXT_PUBLIC_PROVIDER_SOCKET was not provided.');
assert(
  proposalVotingDelay,
  'NEXT_PUBLIC_PROPOSAL_VOTING_DELAY was not provided.'
);
assert(
  proposalVotingPeriod,
  'NEXT_PUBLIC_PROPOSAL_VOTING_PERIOD was not provided.'
);

export const appConfig: AppConfig = {
  appName,
  providerSocket,
  proposalVotingDelay: parseInt(proposalVotingDelay, 10),
  proposalVotingPeriod: parseInt(proposalVotingPeriod, 10)
};
