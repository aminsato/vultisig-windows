import { EvmChain, OtherChain } from '@core/chain/Chain';
import { Coin, CoinKey, coinKeyToString } from '@core/chain/coin/Coin';
import { getErc20Prices } from '@core/chain/coin/price/evm/getErc20Prices';
import { getCoinPrices } from '@core/chain/coin/price/getCoinPrices';
import { getSolanaTokenPrices } from '@core/chain/coin/price/solana/getSolanaTokenUSDValue';
import { isFeeCoin } from '@core/chain/coin/utils/isFeeCoin';
import { FiatCurrency } from '@core/config/FiatCurrency';
import { groupItems } from '@lib/utils/array/groupItems';
import { isEmpty } from '@lib/utils/array/isEmpty';
import { isOneOf } from '@lib/utils/array/isOneOf';
import { splitBy } from '@lib/utils/array/splitBy';
import { withoutUndefined } from '@lib/utils/array/withoutUndefined';
import { shouldBePresent } from '@lib/utils/assert/shouldBePresent';
import { mergeRecords } from '@lib/utils/record/mergeRecords';
import { areLowerCaseEqual } from '@lib/utils/string/areLowerCaseEqual';
import { useQueries } from '@tanstack/react-query';

import { useQueriesToEagerQuery } from '../../lib/ui/query/hooks/useQueriesToEagerQuery';
import { useFiatCurrency } from '../../preferences/state/fiatCurrency';

type GetCoinPricesQueryKeysInput = {
  coins: CoinKey[];
  fiatCurrency: FiatCurrency;
};

export const getCoinPricesQueryKeys = (input: GetCoinPricesQueryKeysInput) => [
  'coinPrices',
  input,
];

type UseCoinPricesQueryInput = {
  coins: Pick<Coin, 'id' | 'chain' | 'priceProviderId'>[];
  fiatCurrency?: FiatCurrency;
};

export const useCoinPricesQuery = (input: UseCoinPricesQueryInput) => {
  const [defaultFiatCurrency] = useFiatCurrency();

  const fiatCurrency = input.fiatCurrency ?? defaultFiatCurrency;

  const queries = [];

  const [regularCoins, erc20Coins] = splitBy(input.coins, coin =>
    isOneOf(coin.chain, Object.values(EvmChain)) && !isFeeCoin(coin) ? 1 : 0
  );

  // Split regular coins and Solana tokens
  const [, solanaCoins] = splitBy(input.coins, coin =>
    isOneOf(coin.chain, [OtherChain.Solana]) ? 1 : 0
  );

  if (!isEmpty(solanaCoins)) {
    queries.push({
      queryKey: getCoinPricesQueryKeys({
        coins: solanaCoins,
        fiatCurrency,
      }),
      queryFn: async () => {
        return await getSolanaTokenPrices({
          coins: solanaCoins,
          chain: OtherChain.Solana,
          fiatCurrency,
        });
      },
    });
  }

  if (!isEmpty(erc20Coins)) {
    const groupedByChain = groupItems(erc20Coins, coin => coin.chain);

    Object.entries(groupedByChain).forEach(([chain, coins]) => {
      queries.push({
        queryKey: getCoinPricesQueryKeys({
          coins,
          fiatCurrency,
        }),
        queryFn: async () => {
          const prices = await getErc20Prices({
            ids: coins.map(coin => coin.id),
            chain: chain as EvmChain,
            fiatCurrency,
          });

          const result: Record<string, number> = {};

          Object.entries(prices).forEach(([id, price]) => {
            const coin = shouldBePresent(
              coins.find(coin => areLowerCaseEqual(coin.id, id))
            );

            result[coinKeyToString(coin)] = price;
          });

          return result;
        },
      });
    });
  }

  if (!isEmpty(regularCoins)) {
    queries.push({
      queryKey: getCoinPricesQueryKeys({
        coins: regularCoins,
        fiatCurrency,
      }),
      queryFn: async () => {
        const prices = await getCoinPrices({
          ids: withoutUndefined(regularCoins.map(coin => coin.priceProviderId)),
          fiatCurrency,
        });

        const result: Record<string, number> = {};

        Object.entries(prices).forEach(([priceProviderId, price]) => {
          // multiple coins can have the same price provider
          // so we need to find all coins with the same price provider
          // for example: ETH.ETH, ARBITRUM.ETH, OPTIMISM.ETH there are all ETH , so they have the same price provider
          const matchedCoins = shouldBePresent(
            regularCoins.filter(coin => coin.priceProviderId == priceProviderId)
          );
          matchedCoins.forEach(coin => {
            result[coinKeyToString(coin)] = price;
          });
        });

        return result;
      },
    });
  }

  const queryResults = useQueries({
    queries,
  });

  return useQueriesToEagerQuery({
    queries: queryResults,
    joinData: data => mergeRecords(...data),
  });
};
