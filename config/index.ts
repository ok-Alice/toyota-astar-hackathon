import assert from 'assert';

export type AppConfig = {
  appName: string;
  providerSocket: string;
  customRPCMethods?: object;
};

const appName = process.env.NEXT_PUBLIC_APP_NAME;
const providerSocket = process.env.NEXT_PUBLIC_PROVIDER_SOCKET;

assert(appName, 'APP_NAME was not provided.');
assert(providerSocket, 'PROVIDER_SOCKET was not provided.');

export const appConfig: AppConfig = { appName, providerSocket };
