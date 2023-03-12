import assert from 'assert';

export type AppConfig = {
  appName: string;
  providerSocket: string;
  customRPCMethods?: object;
  expectedBlockTimeInSeconds: number;
};

const appName = process.env.NEXT_PUBLIC_APP_NAME;
const providerSocket = process.env.NEXT_PUBLIC_PROVIDER_SOCKET;
const expectedBlockTimeInSeconds =
  process.env.NEXT_PUBLIC_EXPECTED_BLOCK_TIME_IN_SECONDS;

assert(appName, 'APP_NAME was not provided.');
assert(providerSocket, 'PROVIDER_SOCKET was not provided.');
assert(
  expectedBlockTimeInSeconds,
  'EXPECTED_BLOCK_TIME_IN_SECONDS was not provided.'
);

export const appConfig: AppConfig = {
  appName,
  providerSocket,
  expectedBlockTimeInSeconds: parseInt(expectedBlockTimeInSeconds, 10)
};
