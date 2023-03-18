import { ContractPromise } from '@polkadot/api-contract';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { useCallback, useEffect, useState } from 'react';
import {
  apiAtom,
  employeeContractAtom,
  projectContractAtom,
  projectIdsAtom
} from 'store/api';
import ProjectAbi from 'abis/project.json';
import EmployeeAbi from 'abis/employee.json';
import { appConfig } from 'config';
import { substrateAccountAddressAtom } from 'store/substrateAccount';
import { getGasLimit } from 'helpers';
import { BN, BN_ONE } from '@polkadot/util';
import { u32 } from '@polkadot/types';

export function DataLoader() {
  const api = useAtomValue(apiAtom);
  const setProjectIds = useSetAtom(projectIdsAtom);
  const [blockNumber, setBlockNumber] = useState<number | null>(null);
  const [projectContract, setProjectContract] = useAtom(projectContractAtom);
  const [employeeContract, setEmployeeContract] = useAtom(employeeContractAtom);
  const currentAccountAddress = useAtomValue(substrateAccountAddressAtom);

  const MAX_CALL_WEIGHT = new BN(5_000_000_000_000).isub(BN_ONE);
  const PROOFSIZE = new BN(1_000_000);

  const doContractQuery = async (contract: ContractPromise, method: string) => {
    const response = await contract.query[method](
      currentAccountAddress as string,
      {
        gasLimit: getGasLimit(api.registry, MAX_CALL_WEIGHT, PROOFSIZE),
        storageDepositLimit: null
      }
    );

    if (response.result.isOk) {
      const projectIds = response.output?.value?.value.map((id: u32) =>
        id.toNumber()
      );
      return projectIds;
    }

    throw new Error('Error fetching projects');
  };

  const getProjects = useCallback(async () => {
    if (!projectContract?.query) return;
    // fetch projects from smart contract on substrate chain
    const response = await doContractQuery(projectContract, 'listProjectIds');
    console.log(response);
    setProjectIds(response);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectContract?.query]);

  useEffect((): undefined | (() => void) => {
    if (!api?.derive.chain) return;
    let unsubscribeAll: (() => any) | null = null;

    api.derive.chain
      .bestNumber((number: any) => setBlockNumber(number.toNumber()))
      .then((unsub: any) => {
        unsubscribeAll = unsub;
      })
      .catch(console.error);

    // eslint-disable-next-line consistent-return
    return () => unsubscribeAll && unsubscribeAll();
  }, [api?.derive.chain]);

  useEffect(() => {
    if (!api || !blockNumber) return;
    getProjects();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [blockNumber]);

  useEffect(() => {
    if (!api) return;
    if (!projectContract) {
      const _p = new ContractPromise(
        api,
        ProjectAbi,
        appConfig.projectContractAddress
      );
      console.log(_p.query);
      setProjectContract(_p);
    }

    if (!employeeContract) {
      setEmployeeContract(
        new ContractPromise(api, EmployeeAbi, appConfig.employeeContractAddress)
      );
    }
  }, [
    api,
    projectContract,
    employeeContract,
    setProjectContract,
    setEmployeeContract
  ]);

  return null;
}
