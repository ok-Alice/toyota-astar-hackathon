import assert from 'assert';

export type AppConfig = {
  appName: string;
  providerSocket: string;
  mainProjectContractAddress: string;
  customRPCMethods?: object;
};

const appName = process.env.NEXT_PUBLIC_APP_NAME;
const providerSocket = process.env.NEXT_PUBLIC_PROVIDER_SOCKET;
const mainProjectContractAddress =
  process.env.NEXT_PUBLIC_DAO_PROJECT_CONTRACT_ADDRESS;

assert(appName, 'APP_NAME was not provided.');
assert(providerSocket, 'PROVIDER_SOCKET was not provided.');
assert(
  mainProjectContractAddress,
  'PROJECT_CONTRACT_ADDRESS was not provided.'
);

export const appConfig: AppConfig = {
  appName,
  providerSocket,
  mainProjectContractAddress
};
