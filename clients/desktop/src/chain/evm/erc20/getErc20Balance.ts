import { Address, erc20Abi } from 'viem';

import { EvmChain } from '@core/chain/Chain';
import { getEvmClient } from '../client/getEvmClient';

type Input = {
  chain: EvmChain;
  address: Address;
  accountAddress: Address;
};

export const getErc20Balance = async ({
  chain,
  address,
  accountAddress,
}: Input) => {
  const publicClient = getEvmClient(chain);

  return publicClient.readContract({
    address,
    abi: erc20Abi,
    functionName: 'balanceOf',
    args: [accountAddress],
  });
};
