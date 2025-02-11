import { CoinKey } from '@core/chain/coin/Coin';
import { isEmpty } from '@lib/utils/array/isEmpty';
import { isOneOf } from '@lib/utils/array/isOneOf';

import { swapEnabledChains } from '../../../chain/swap/swapEnabledChains';
import { getStorageCoinKey } from '../../../coin/utils/storageCoin';
import { UniformColumnGrid } from '../../../lib/ui/css/uniformColumnGrid';
import { ValueProp } from '../../../lib/ui/props';
import { SendPrompt } from '../../send/SendPrompt';
import { useCurrentVaultNativeCoins } from '../../state/currentVault';
import { SwapPrompt } from '../../swap/components/SwapPrompt';
import { DepositPrompt } from '../DepositPrompts';

export const VaultPrimaryActions = ({ value }: Partial<ValueProp<CoinKey>>) => {
  const nativeCoins = useCurrentVaultNativeCoins();

  if (isEmpty(nativeCoins)) {
    return null;
  }

  const coinKey = value ?? getStorageCoinKey(nativeCoins[0]);

  return (
    <UniformColumnGrid fullWidth gap={12}>
      <SendPrompt value={coinKey} />
      {isOneOf(coinKey.chain, swapEnabledChains) && (
        <SwapPrompt value={coinKey} />
      )}
      <DepositPrompt value={coinKey} />
    </UniformColumnGrid>
  );
};
