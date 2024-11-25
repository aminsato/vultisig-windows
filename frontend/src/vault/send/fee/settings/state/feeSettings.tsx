import { useCallback, useMemo } from 'react';

import { EvmFeeSettings } from '../../../../../chain/evm/fee/EvmFeeSettings';
import { isNativeCoin } from '../../../../../chain/utils/isNativeCoin';
import { UtxoFeeSettings } from '../../../../../chain/utxo/fee/UtxoFeeSettings';
import { ComponentWithChildrenProps } from '../../../../../lib/ui/props';
import { getStateProviderSetup } from '../../../../../lib/ui/state/getStateProviderSetup';
import { omit } from '../../../../../lib/utils/record/omit';
import { Chain } from '../../../../../model/chain';
import { useCurrentSendCoin } from '../../../state/sendCoin';

type FeeSettings = EvmFeeSettings | UtxoFeeSettings;

type FeeSettingsRecord = Record<string, FeeSettings>;

type FeeSettingsKey = {
  chainId: Chain;
  isNativeToken: boolean;
};

const feeSettingsKeyToString = (key: FeeSettingsKey): string =>
  `${key.chainId}:${key.isNativeToken}`;

const { useState: useFeeSettingsRecord, provider: FeeSettingsRecordProvider } =
  getStateProviderSetup<FeeSettingsRecord>('FeeSettings');

export const FeeSettingsProvider = ({
  children,
}: ComponentWithChildrenProps) => (
  <FeeSettingsRecordProvider initialValue={{}}>
    {children}
  </FeeSettingsRecordProvider>
);

export const useFeeSettings = <T extends FeeSettings>() => {
  const [coin] = useCurrentSendCoin();
  const [record, setRecord] = useFeeSettingsRecord();

  const value = useMemo(() => {
    const stringKey = feeSettingsKeyToString({
      chainId: coin.chainId,
      isNativeToken: isNativeCoin(coin),
    });

    if (stringKey in record) {
      return record[stringKey] as T;
    }

    return null;
  }, [coin, record]);

  const setValue = useCallback(
    (value: T | null) => {
      const stringKey = feeSettingsKeyToString({
        chainId: coin.chainId,
        isNativeToken: isNativeCoin(coin),
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
