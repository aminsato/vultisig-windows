import { CoinKey } from '../../../../../coin/Coin';
import { EntityWithTicker } from '../../../../../lib/utils/entities/EntityWithTicker';
import { isNativeCoin } from '../../../../utils/isNativeCoin';
import { NativeSwapChain, nativeSwapChainIds } from '../../NativeSwapChain';

export const toThorchainSwapAsset = ({
  chain,
  id,
  ticker,
}: CoinKey & EntityWithTicker): string => {
  const swapChainId = nativeSwapChainIds[chain as NativeSwapChain];

  if (!swapChainId) {
    throw new Error(`No swap chain id found for ${chain}`);
  }

  const key = `${swapChainId}.${ticker}`;

  if (isNativeCoin({ chain, id })) {
    return key;
  }

  return `${key}-${id}`;
};
