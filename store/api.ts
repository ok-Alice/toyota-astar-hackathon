import { atom } from 'jotai';

import type { Keyring } from '@polkadot/ui-keyring';
import type { ApiPromise } from '@polkadot/api';

export const apiAtom = atom<ApiPromise | null>(null);
export const keyringAtom = atom<Keyring | null>(null);
export const apiConnectedAtom = atom<boolean>(false);
export const apiErrorAtom = atom<string | null>(null);
