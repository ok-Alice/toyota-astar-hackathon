import { ContractPromise } from '@polkadot/api-contract';
import ProjectAbi from 'abis/project.json';
import EmployeeAbi from 'abis/employee.json';
import AssignmentsAbi from 'abis/assignments.json';
import { ApiPromise } from '@polkadot/api';
import { WeightV2 } from '@polkadot/types/interfaces';

// Create contract promise
export function createContractPromise(
  api: ApiPromise,
  contract: 'project' | 'employee' | 'assignments',
  contractAddress: string
) {
  let abi;
  switch (contract) {
    case 'project':
      abi = ProjectAbi;
      break;
    case 'employee':
      abi = EmployeeAbi;
      break;
    case 'assignments':
      abi = AssignmentsAbi;
      break;
    default:
      abi = null;
  }

  // @ts-ignore
  return new ContractPromise(api, abi, contractAddress);
}

export async function queryContract(
  api: ApiPromise,
  account: string,
  contract: ContractPromise,
  method: string,
  params: string[]
) {
  const { output, result } = await contract.query[method](
    account,
    {
      // @ts-ignore
      gasLimit: api?.registry.createType('WeightV2', {
        refTime: 0,
        proofSize: 0
      }) as WeightV2,
      storageDepositLimit: null
    },
    params
  );

  return Promise.resolve({
    result: result.isOk ? result.asOk : result.asErr,
    output: output?.toHuman()
  });
}
