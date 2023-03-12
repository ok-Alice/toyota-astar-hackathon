import { useCallback, useState } from 'react';
import { toast } from 'react-toastify';

import { useAtomValue } from 'jotai';
import { apiAtom } from 'store/api';
import { substrateAccountAtom } from 'store/substrateAccount';

import { LENGTH_BOUND } from 'constants/transaction';
import { stringToHex } from '@polkadot/util';

import { Button } from 'components/ui-kit/Button';
import { Typography } from 'components/ui-kit/Typography';
import { TxButton } from 'components/TxButton';
import { Notification } from 'components/ui-kit/Notifications';
import { Icon } from 'components/ui-kit/Icon';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger
} from 'components/ui-kit/Dialog';

import { ProposalEnum, ProposalVotingAccessEnum, State } from './types';
import styles from './CreateProposal.module.scss';

export interface CreateProposalProps {
  daoId: string;
}

const INITIAL_STATE: State = {
  amount: '',
  description: '',
  target: '',
  title: '',
  balance: ''
};

export function CreateProposal({ daoId }: CreateProposalProps) {
  const [modalOpen, setModalOpen] = useState(false);

  const [proposalVotingAccess, setProposalVotingAccess] =
    useState<ProposalVotingAccessEnum | null>(null);
  const [proposalType, setProposalType] = useState<ProposalEnum | null>(null);

  const api = useAtomValue(apiAtom);
  const substrateAccount = useAtomValue(substrateAccountAtom);

  const [state, setState] = useState<State>(INITIAL_STATE);

  const getProposalTx = useCallback(() => {
    // eslint-disable-next-line prefer-destructuring
    const target = state.target;

    const amount = parseInt(state.amount, 10);

    switch (proposalType) {
      case ProposalEnum.PROPOSE_ADD_MEMBER: {
        return api?.tx.daoCouncilMembers.addMember(daoId, target);
      }
      case ProposalEnum.PROPOSE_REMOVE_MEMBER: {
        return api?.tx.daoCouncilMembers.removeMember(daoId, target);
      }
      case ProposalEnum.PROPOSE_TRANSFER: {
        return api?.tx.daoTreasury.spend(daoId, amount, target);
      }
      case ProposalEnum.PROPOSE_TRANSFER_GOVERNANCE_TOKEN: {
        return api?.tx.daoTreasury.transferToken(daoId, amount, target);
      }
      default: {
        throw new Error('No such extrinsic method exists.');
      }
    }
  }, [
    api?.tx.daoCouncilMembers,
    api?.tx.daoTreasury,
    daoId,
    proposalType,
    state.amount,
    state.target
  ]);

  const proposalCreatedHandler = useCallback(() => {
    setTimeout(
      () =>
        toast.success(
          <Notification
            title="Proposal created"
            body="Proposal was created."
            variant="success"
          />
        ),
      1000
    );
    setProposalVotingAccess(null);
    setProposalType(null);
    setState(INITIAL_STATE);
    setModalOpen(false);
  }, []);

  const handleCancelClick = () => setModalOpen(false);

  const handleTransform = useCallback(() => {
    const meta = stringToHex(
      JSON.stringify({
        title: state.title.trim(),
        description: state.description.trim()
      })
    );

    const _tx = getProposalTx();

    if (proposalVotingAccess === ProposalVotingAccessEnum.Council) {
      return [daoId, _tx, LENGTH_BOUND, meta];
    }

    return [daoId, { Inline: _tx?.method.toHex() }, state.balance, meta];
  }, [
    daoId,
    getProposalTx,
    proposalVotingAccess,
    state.balance,
    state.description,
    state.title
  ]);

  const disabled =
    !proposalVotingAccess ||
    !proposalType ||
    !state.title ||
    !state.description ||
    ((proposalType === ProposalEnum.PROPOSE_TRANSFER ||
      proposalType === ProposalEnum.PROPOSE_TRANSFER_GOVERNANCE_TOKEN) &&
      (!state.amount || !state.target)) ||
    ((proposalType === ProposalEnum.PROPOSE_ADD_MEMBER ||
      proposalType === ProposalEnum.PROPOSE_REMOVE_MEMBER) &&
      !state.target);

  const onSuccess = () => proposalCreatedHandler();

  return (
    <Dialog open={modalOpen} onOpenChange={setModalOpen}>
      <DialogTrigger asChild>
        <Button>
          <span className={styles['button-content']}>
            <Icon name="proposals-add" size="sm" />
            <Typography variant="button1">Create Proposal</Typography>
          </span>
        </Button>
      </DialogTrigger>
      <DialogContent className={styles['dialog-content']} closeIcon={false}>
        <DialogTitle asChild>
          <Typography className={styles.title} variant="title1">
            Create Proposal
          </Typography>
        </DialogTitle>
        <DialogDescription asChild>
          <div className={styles.container}>
            <div className={styles.content}>
              <div className={styles['buttons-container']}>
                <Button
                  variant="outlined"
                  color="destructive"
                  onClick={handleCancelClick}
                >
                  Cancel
                </Button>

                <TxButton
                  accountId={substrateAccount?.address}
                  params={handleTransform}
                  disabled={disabled}
                  tx={() => {}}
                  onSuccess={onSuccess}
                >
                  Submit
                </TxButton>
              </div>
            </div>
          </div>
        </DialogDescription>
      </DialogContent>
    </Dialog>
  );
}
