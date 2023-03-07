import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from 'components/ui-kit/Select';
import { Typography } from 'components/ui-kit/Typography';
import { useAtomValue, useSetAtom } from 'jotai';
import { keyringAtom } from 'store/api';
import { substrateAccountAtom } from 'store/substrateAccount';

export default function AccountSelector() {
  const keyring = useAtomValue(keyringAtom);
  const setSubstrateAccount = useSetAtom(substrateAccountAtom);
  const accounts = keyring?.getPairs();

  const onAccountValueChange = (address: string) => {
    const foundAccount = keyring
      ?.getPairs()
      .find((_account) => _account.address === address);
    if (!foundAccount) {
      return;
    }

    setSubstrateAccount(foundAccount);
  };

  return (
    <Select onValueChange={onAccountValueChange}>
      <SelectTrigger>
        <SelectValue placeholder="Choose an account" />
      </SelectTrigger>
      <SelectContent>
        {accounts?.map((_account) => (
          <SelectItem value={_account.address} key={_account.address}>
            <Typography variant="button2">
              {_account.meta.name as string}
            </Typography>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
