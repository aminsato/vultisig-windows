import { fromChainAmount } from '@core/chain/amount/fromChainAmount';
import { shouldBePresent } from '@lib/utils/assert/shouldBePresent';
import { formatAmount } from '@lib/utils/formatAmount';
import { useTranslation } from 'react-i18next';

import { TxOverviewChainDataRow } from '../../../chain/tx/components/TxOverviewRow';
import { MatchQuery } from '../../../lib/ui/query/components/MatchQuery';
import { useSwapKeysignPayloadQuery } from '../queries/useSwapKeysignPayloadQuery';

export const SwapAllowance = () => {
  const query = useSwapKeysignPayloadQuery();

  const { t } = useTranslation();

  return (
    <MatchQuery
      value={query}
      error={() => null}
      pending={() => null}
      success={({ erc20ApprovePayload, coin }) => {
        if (!erc20ApprovePayload) {
          return null;
        }

        const { decimals, ticker } = shouldBePresent(coin);

        return (
          <TxOverviewChainDataRow>
            <span>{t('allowance')}</span>
            <span>
              {formatAmount(
                fromChainAmount(erc20ApprovePayload.amount, decimals),
                ticker
              )}
            </span>
          </TxOverviewChainDataRow>
        );
      }}
    />
  );
};
