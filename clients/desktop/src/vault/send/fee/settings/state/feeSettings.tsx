import { Chain } from '@core/chain/Chain';
import { isFeeCoin } from '@core/chain/coin/utils/isFeeCoin';
import { omit } from '@lib/utils/record/omit';
import { useCallback, useMemo } from 'react';

import { EvmFeeSettings } from '../../../../../chain/evm/fee/EvmFeeSettings';
import { UtxoFeeSettings } from '../../../../../chain/utxo/fee/UtxoFeeSettings';
import { ChildrenProp } from '../../../../../lib/ui/props';
import { getStateProviderSetup } from '../../../../../lib/ui/state/getStateProviderSetup';
import { useCurrentSendCoin } from '../../../state/sendCoin';

type FeeSettings = EvmFeeSettings | UtxoFeeSettings;

type FeeSettingsRecord = Record<string, FeeSettings>;

type FeeSettingsKey = {
  chain: Chain;
  isNativeToken: boolean;
};

const feeSettingsKeyToString = (key: FeeSettingsKey): string =>
  `${key.chain}:${key.isNativeToken}`;

const { useState: useFeeSettingsRecord, provider: FeeSettingsRecordProvider } =
  getStateProviderSetup<FeeSettingsRecord>('FeeSettings');

export const FeeSettingsProvider = ({ children }: ChildrenProp) => (
  <FeeSettingsRecordProvider initialValue={{}}>
    {children}
  </FeeSettingsRecordProvider>
);

export const useFeeSettings = <T extends FeeSettings>() => {
  const [coin] = useCurrentSendCoin();
  const [record, setRecord] = useFeeSettingsRecord();

  const value = useMemo(() => {
    const stringKey = feeSettingsKeyToString({
      chain: coin.chain,
      isNativeToken: isFeeCoin(coin),
    });

    if (stringKey in record) {
      return record[stringKey] as T;
    }

    return null;
  }, [coin, record]);

  const setValue = useCallback(
    (value: T | null) => {
      const stringKey = feeSettingsKeyToString({
        chain: coin.chain,
        isNativeToken: isFeeCoin(coin),
      });

      setRecord(record => {
        if (value) {
          return {
            ...record,
            [stringKey]: value,
          };
        }

        return omit(record, stringKey);
      });
    },
    [coin, setRecord]
  );

  return [value, setValue] as const;
};
