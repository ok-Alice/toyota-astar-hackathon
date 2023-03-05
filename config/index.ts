import assert from 'assert';

export type AppConfig = {
  appName: string;
};

const appName = process.env.NEXT_PUBLIC_APP_NAME;

assert(appName, 'APP_NAME was not provided.');

export const appConfig: AppConfig = { appName };
