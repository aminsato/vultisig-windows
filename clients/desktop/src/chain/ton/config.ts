import { chainFeeCoin } from '../../coin/chainFeeCoin';
import { Chain } from '@core/chain/Chain';
import { toChainAmount } from '../utils/toChainAmount';

export const tonConfig = {
  fee: toChainAmount(0.01, chainFeeCoin[Chain.Ton].decimals),
};
