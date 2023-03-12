import { MouseEventHandler } from 'react';
import { useAtomValue } from 'jotai';
import { currentProjectAtom, usersAtom } from 'store/db';

import { Card } from 'components/ui-kit/Card';
import { Typography } from 'components/ui-kit/Typography';
import { Button } from 'components/ui-kit/Button';
import { Icon } from 'components/ui-kit/Icon';
import { Chip } from 'components/ui-kit/Chip';

import styles from './Members.module.scss';
import { maskAddress } from 'utils/maskAddress';

export function Members() {
  const currentProject = useAtomValue(currentProjectAtom);
  const users = useAtomValue(usersAtom);

  const getUser = (userId: number) => users?.find((user) => user.id === userId);

  const handleOnClick: MouseEventHandler<HTMLButtonElement> = (e) => {
    const address = (e.target as HTMLButtonElement).getAttribute(
      'data-address'
    );
    if (!address) {
      return;
    }

    navigator.clipboard.writeText(address);
  };

  return (
    <Card className={styles.card}>
      <span className={styles.title}>
        <Typography variant="title4">Members</Typography>
      </span>

      <ul className={styles.members}>
        {currentProject?.members?.map((member) => {
          const user = getUser(member.userId);
          if (!user) return null;

          return (
            <li className={styles.member} key={user?.displayName}>
              <span>
                <Typography variant="title4">
                  {user?.displayName || ''}
                </Typography>
              </span>
              <span className={styles['member-title']}>
                <Typography variant="title6">
                  {maskAddress(user?.address || '')}
                </Typography>
                <Button
                  variant="icon"
                  size="xs"
                  data-address={user?.address}
                  onClick={handleOnClick}
                >
                  <Icon name="copy" size="xs" />
                </Button>
              </span>

              {user?.badges.map((badge) => (
                <Chip
                  key={`${user.displayName}-${badge}`}
                  variant="group"
                  color="orange"
                >
                  <Typography variant="title8">{badge}</Typography>
                </Chip>
              ))}
            </li>
          );
        })}
      </ul>
    </Card>
  );
}
