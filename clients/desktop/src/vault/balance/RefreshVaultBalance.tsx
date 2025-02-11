import { useMutation } from '@tanstack/react-query';

import { getBalanceQueryKey } from '../../coin/query/useBalancesQuery';
import { getCoinPricesQueryKeys } from '../../coin/query/useCoinPricesQuery';
import { useInvalidateQueries } from '../../lib/ui/query/hooks/useInvalidateQueries';
import { useFiatCurrency } from '../../preferences/state/fiatCurrency';
import { PageHeaderRefresh } from '../../ui/page/PageHeaderRefresh';
import { useCurrentVaultCoins } from '../state/currentVault';

export const RefreshVaultBalance = () => {
  const invalidateQueries = useInvalidateQueries();

  const coins = useCurrentVaultCoins();

  const [fiatCurrency] = useFiatCurrency();

  const { mutate: refresh, isPending } = useMutation({
    mutationFn: () => {
      return invalidateQueries(
        getCoinPricesQueryKeys({
          coins,
          fiatCurrency,
        }),
        ...coins.map(getBalanceQueryKey)
      );
    },
  });

  return <PageHeaderRefresh onClick={() => refresh()} isPending={isPending} />;
};
