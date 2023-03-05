import { atom } from 'jotai';
import type { KeyringPair } from '@polkadot/keyring/types';

const substrateAccountStorageKey = 'substrateAccountStorageKey';

// Substrate
export const substrateAccountAddressAtom = atom<string | null>(
  typeof window !== 'undefined'
    ? localStorage.getItem(substrateAccountStorageKey)
    : null
);
export const substrateAccountAtom = atom<KeyringPair | null>(null);
export const setCurrentSubstrateAccountAtom = atom(
  null,
  (_get, _set, _account: KeyringPair) => {
    _set(substrateAccountAtom, _account);
    _set(substrateAccountAddressAtom, _account?.address.toString());

    localStorage.setItem(substrateAccountStorageKey, _account.address);
  }
);

export const currentAccountAtom = atom((_get) => _get(substrateAccountAtom));

export const disconnectSubstrateAccountAtom = atom(null, (_get, _set) => {
  localStorage.removeItem(substrateAccountStorageKey);
  _set(substrateAccountAtom, null);
  _set(substrateAccountAddressAtom, null);
});
