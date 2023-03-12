import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { toast } from 'react-toastify';

import { useAtomValue } from 'jotai';
import { apiAtom, keyringAtom } from 'store/api';
import { projectsAtom } from 'store/db';
import { accountsAtom, substrateAccountAtom } from 'store/substrateAccount';

// import { useDaoContract } from 'hooks/useDaoContract';
// import { ssToEvmAddress } from 'utils/ssToEvmAddress';
// import { keyringAddExternal } from 'utils/keyringAddExternal';
// import { convertTimeToBlock } from 'utils/convertTimeToBlock';
// import { formLinkByDaoId } from 'utils/formLinkByDaoId';

// import { stringToHex } from '@polkadot/util';

// import type { Option, u32 } from '@polkadot/types';
// import type { CreateDaoInput, DaoCodec } from 'types';

import { Typography } from 'components/ui-kit/Typography';
import { Button } from 'components/ui-kit/Button';
import { Notification } from 'components/ui-kit/Notifications';
import { TxButton } from 'components/TxButton';
import { formLinkByProjectId } from 'utils/formLinkByProjectId';
import {
  DaoGovernanceState,
  DaoInfoState,
  DaoMembersState,
  ProposalPeriod
} from './types';
// import { DaoInfo } from './DaoInfo';
// import { DaoMembers } from './DaoMembers';
// import { DaoToken } from './DaoToken';
// import { DaoGovernance } from './DaoGovernance';

import styles from './CreateProject.module.scss';

const initialInfoState: DaoInfoState = {
  name: '',
  purpose: ''
};

const initialGovernanceState: DaoGovernanceState = {
  approveOrigin: '1/2',
  enactmentPeriod: '',
  launchPeriod: '',
  proposalPeriod: '',
  voteLockingPeriod: '',
  votingPeriod: '',
  proposalPeriodType: ProposalPeriod.DAYS,
  enactmentPeriodType: ProposalPeriod.DAYS,
  launchPeriodType: ProposalPeriod.DAYS,
  voteLockingPeriodType: ProposalPeriod.DAYS,
  votingPeriodType: ProposalPeriod.DAYS
};

const initialMembersState: DaoMembersState = {
  members: []
};

export function CreateProject() {
  const router = useRouter();
  const [nextProjectId, setNextProjectId] = useState<number>(0);
  const [projectInfo, setProjectInfo] =
    useState<DaoInfoState>(initialInfoState);
  const [projectGovernance, setprojectGovernance] =
    useState<DaoGovernanceState>(initialGovernanceState);
  const [projectMembers, setProjectMembers] =
    useState<DaoMembersState>(initialMembersState);
  const api = useAtomValue(apiAtom);
  const keyring = useAtomValue(keyringAtom);
  const projects = useAtomValue(projectsAtom);
  const accounts = useAtomValue(accountsAtom);
  const substrateAccount = useAtomValue(substrateAccountAtom);

  const [createdProjectId, setCreatedProjectId] = useState<number | null>(null);
  const [proposedProjectId, setProposedProjectId] = useState<number | null>(
    null
  );
  const createdRef = useRef<boolean>(false);

  // const daoContract = useDaoContract();

  useEffect(() => {
    if (!createdRef.current || createdProjectId === null) {
      return;
    }

    const currentProject = projects?.find(
      (project) => project.id === createdProjectId
    );

    if (!currentProject) {
      return;
    }

    toast.success(
      <Notification
        title="You've successfully created a new Project"
        body="You can create new DAO and perform other actions."
        variant="success"
      />
    );
    router.push(
      formLinkByProjectId(currentProject?.id?.toString() || '', 'dashboard')
    );
  }, [createdProjectId, projects, router]);

  useEffect(() => {
    if (proposedProjectId === null) {
      return undefined;
    }

    setCreatedProjectId(proposedProjectId);
    return undefined;
  }, [proposedProjectId]);

  useEffect(() => {
    // Todo fetch projects and set next id
  }, [api, nextProjectId]);

  const handleOnSuccess = async () => {
    createdRef.current = true;
    setProposedProjectId(nextProjectId);
    toast.success(
      <Notification
        title="Transaction created"
        body="Project will be created soon."
        variant="success"
      />
    );
  };

  const disabled =
    !projectInfo.name ||
    !projectInfo.purpose ||
    !projectMembers.members ||
    !projectGovernance.proposalPeriod ||
    !projectGovernance.proposalPeriodType;

  return (
    <div className={styles.container}>
      <Link href="/" className={styles['cancel-button']}>
        <Button variant="outlined" color="destructive" size="sm">
          Cancel Project creation
        </Button>
      </Link>

      <div className={styles.content}>
        <Typography variant="h1" className={styles.title}>
          Create Project
        </Typography>

        {/* <DaoInfo state={daoInfo} setState={setDaoInfo} />
        <DaoMembers state={daoMembers} setState={setDaoMembers} />

        <DaoToken state={daoToken} setState={setDaoToken} />

        <DaoGovernance state={daoGovernance} setState={setDaoGovernance} /> */}

        <div className={styles['create-proposal']}>
          <TxButton
            onSuccess={handleOnSuccess}
            disabled={disabled}
            accountId={substrateAccount?.address}
            params={[]}
            tx={null}
            className={styles['create-button']}
          >
            Create Project
          </TxButton>
        </div>
      </div>
    </div>
  );
}
