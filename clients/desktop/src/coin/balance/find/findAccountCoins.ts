import { Chain, EvmChain } from '@core/chain/Chain';
import { isOneOf } from '@lib/utils/array/isOneOf';

import { ChainAccount } from '../../../chain/ChainAccount';
import { Coin } from '../../Coin';
import { findEvmAccountCoins } from './findEvmAccountCoins';
import { findSolanaAccountCoins } from './findSolanaAccountCoins';

export const findAccountCoins = ({
  address,
  chain,
}: ChainAccount): Promise<Coin[]> | Coin[] => {
  const evmChain = isOneOf(chain, Object.values(EvmChain));
  if (evmChain) {
    return findEvmAccountCoins({ address, chain: evmChain });
  }

  if (chain === Chain.Solana) {
    return findSolanaAccountCoins({ address, chain });
  }

  return [];
};
