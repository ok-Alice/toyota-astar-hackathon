import { atom } from 'jotai';
import type { KeyringPair } from '@polkadot/keyring/types';

// Substrate
export const substrateAccountAddressAtom = atom<string | null>(null);
export const substrateAccountAtom = atom<KeyringPair | null>(null);
export const setCurrentSubstrateAccountAtom = atom(
  null,
  (_get, _set, _account: KeyringPair) => {
    _set(substrateAccountAtom, _account);
    _set(substrateAccountAddressAtom, _account?.address.toString());
  }
);

export const currentAccountAtom = atom((_get) => _get(substrateAccountAtom));
