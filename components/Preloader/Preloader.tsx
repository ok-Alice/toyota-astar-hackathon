import { useCallback, useEffect, useRef } from 'react';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { appConfig } from 'config';
import {
  apiAtom,
  apiConnectedAtom,
  apiErrorAtom,
  jsonrpcAtom,
  keyringAtom,
  socketAtom
} from 'store/api';

export default function Preloader() {
  const connectRef = useRef<boolean>(false);
  const [api, setApi] = useAtom(apiAtom);
  const [keyring, setKeyring] = useAtom(keyringAtom);
  const socket = useAtomValue(socketAtom);
  const setJsonRPC = useSetAtom(jsonrpcAtom);
  const setApiConnected = useSetAtom(apiConnectedAtom);
  const setApiError = useSetAtom(apiErrorAtom);

  const loadAccounts = useCallback(async () => {
    const { keyring: uikeyring } = await import('@polkadot/ui-keyring');

    try {
      uikeyring.loadAll({ isDevelopment: true });
      setKeyring(uikeyring);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
    }
  }, [setKeyring]);

  const connect = useCallback(async () => {
    const jsonrpc = (await import('@polkadot/types/interfaces/jsonrpc'))
      .default;
    const { ApiPromise, WsProvider } = await import('@polkadot/api');

    const rpc = { ...jsonrpc, ...appConfig.customRPCMethods };
    setJsonRPC(rpc);

    const provider = new WsProvider(socket);
    const _api = new ApiPromise({ provider, rpc });

    _api.on('connected', () => setApiConnected(true));
    _api.on('disconnected', () => setApiConnected(false));
    _api.on('error', (err: Error) => setApiError(err.message));
    _api.on('ready', () => setApi(_api));
  }, [setApi, setApiConnected, setApiError, setJsonRPC, socket]);

  useEffect(() => {
    if (!api || keyring) {
      return;
    }

    loadAccounts();
  }, [api, keyring, loadAccounts]);

  useEffect(() => {
    if (connectRef.current) {
      return;
    }

    // connect();
    connectRef.current = true;
  }, [connect]);

  return null;
}
