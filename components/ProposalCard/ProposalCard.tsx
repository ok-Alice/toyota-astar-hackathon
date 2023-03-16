import clsx from 'clsx';
import { appConfig } from 'config';

import { Proposal } from 'db/proposals';
import { Card } from 'components/ui-kit/Card';
import { Icon } from 'components/ui-kit/Icon';
import { Typography } from 'components/ui-kit/Typography';

import { useAtomValue } from 'jotai';
import { currentProjectAtom } from 'store/db';

import { maskAddress } from 'utils/maskAddress';
import { keyringAtom } from 'store/api';
import { KeyringPair } from '@polkadot/keyring/types';
import { Chip } from 'components/ui-kit/Chip';
import { ProposalActions } from './ProposalActions';

import styles from './ProposalCard.module.scss';

export interface ProposalCardProps {
  proposal: Proposal;
  currentBlock: number | null;
}

export function ProposalCard({ proposal, currentBlock }: ProposalCardProps) {
  const title = proposal?.title;
  const description = proposal?.description;
  const currentProject = useAtomValue(currentProjectAtom);
  const keyring = useAtomValue(keyringAtom);

  const getUser = (address: string) =>
    keyring
      ?.getPairs()
      .find((keypair: KeyringPair) => keypair.address === address);

  return (
    <Card className={styles.card}>
      <div className={styles.header}>
        <div className={styles['status-container']}>
          <Icon
            name="circle"
            className={clsx(
              styles['status-icon'],
              styles[
                proposal?.status === 'ACTIVE' ? 'icon-active' : 'icon-completed'
              ]
            )}
          />
          <Typography variant="title7">{proposal?.status}</Typography>
        </div>
        {proposal.status === 'ACTIVE' && currentProject && currentBlock && (
          <div className={styles.countdown}>
            <Typography variant="value5">
              {proposal.createdAtBlock +
                appConfig.proposalVotingPeriod -
                currentBlock}
            </Typography>
            <Typography variant="body2">blocks left</Typography>
          </div>
        )}
      </div>
      <div className={styles.content}>
        <div className={styles['description-container']}>
          <div className={styles['title-container']}>
            <Icon name="proposals" className={styles['proposal-icon']} />
            <div className={styles.title}>
              <Typography variant="title4">{title}</Typography>
              <span>
                <Chip variant="proposal" className={styles['vote-access']}>
                  <Typography variant="title6">
                    {proposal.internal ? 'Members Only' : 'Everyone'}
                  </Typography>
                </Chip>
              </span>
            </div>
          </div>
          {title && <Typography variant="title5">{title}</Typography>}
          {description && (
            <Typography variant="body2">{description}</Typography>
          )}

          <div className={styles['proposal-bottom-container']}>
            <span className={styles['proposal-item-info']}>
              <Typography variant="caption2">Proposer&nbsp;</Typography>
              <span className={styles['proposal-item']}>
                <Icon name="user-profile" size="xs" />
                <Typography variant="title5">
                  {`${
                    getUser(proposal.proposer)?.meta.name || ''
                  } - ${maskAddress(proposal.proposer)}`}
                </Typography>
              </span>
            </span>

            <ProposalActions proposal={proposal} />
          </div>
        </div>
      </div>
    </Card>
  );
}
