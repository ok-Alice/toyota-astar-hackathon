import { atom } from 'jotai';

export const emailAccountStorageKey = 'emailAccountStorageKey';

export type EmailAccount = {
  displayname: string;
  email: string;
};

export const emailAccountAtom = atom<EmailAccount | null>(null);
export const setCurrentEmailAccountAtom = atom(
  null,
  (_get, _set, _account: EmailAccount) => {
    _set(emailAccountAtom, _account);
    localStorage.setItem(emailAccountStorageKey, JSON.stringify(_account));
  }
);
export const currentEmailAccountAtom = atom((_get) => _get(emailAccountAtom));

export const disconnectEmailAccountAtom = atom(null, (_get, _set) => {
  localStorage.removeItem(emailAccountStorageKey);
  _set(emailAccountAtom, null);
});
