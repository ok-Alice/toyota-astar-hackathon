import { WeightV2 } from '@polkadot/types/interfaces';
import { Registry } from '@polkadot/types/types';
import { BN } from '@polkadot/util';

export function getGasLimit(
  registry: Registry,
  refTime: BN | number,
  proofSize: BN | number
): WeightV2 {
  return registry.createType('WeightV2', {
    refTime,
    proofSize
  });
}
