import { getChainFeeCoin } from '../../../chain/tx/fee/utils/getChainFeeCoin';
import { fromChainAmount } from '../../../chain/utils/fromChainAmount';
import { useCoinPriceQuery } from '../../../coin/query/useCoinPriceQuery';
import { storageCoinToCoin } from '../../../coin/utils/storageCoin';
import { useGlobalCurrency } from '../../../lib/hooks/useGlobalCurrency';
import { Spinner } from '../../../lib/ui/loaders/Spinner';
import { QueryDependant } from '../../../lib/ui/query/components/QueryDependant';
import { formatAmount } from '../../../lib/utils/formatAmount';
import { CoinMeta } from '../../../model/coin-meta';
import { useCurrentVaultCoin } from '../../state/currentVault';
import { useCurrentDepositCoin } from '../hooks/useCurrentDepositCoin';
import { useSendSpecificTxInfo } from './DepositSpecificTxInfoProvider';

export const DepositFiatFeeValue = () => {
  const [coinKey] = useCurrentDepositCoin();
  const coin = useCurrentVaultCoin(coinKey);
  const priceQuery = useCoinPriceQuery(
    CoinMeta.fromCoin(storageCoinToCoin(coin))
  );

  const { globalCurrency } = useGlobalCurrency();

  const { fee } = useSendSpecificTxInfo();

  const { decimals } = getChainFeeCoin(coinKey.chainId);

  const feeAmount = fromChainAmount(fee, decimals);

  return (
    <QueryDependant
      query={priceQuery}
      pending={() => <Spinner />}
      error={() => null}
      success={price => {
        const formattedAmount = formatAmount(feeAmount * price, globalCurrency);

        return formattedAmount;
      }}
    />
  );
};
