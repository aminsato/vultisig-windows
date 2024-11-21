import { useCallback, useMemo } from 'react';

import { getEvmGasLimit } from '../../../../../chain/evm/utils/getEvmGasLimit';
import {
  defaultFeePriority,
  FeePriority,
} from '../../../../../chain/fee/FeePriority';
import { isNativeCoin } from '../../../../../chain/utils/isNativeCoin';
import { ComponentWithChildrenProps } from '../../../../../lib/ui/props';
import { getStateProviderSetup } from '../../../../../lib/ui/state/getStateProviderSetup';
import { omit } from '../../../../../lib/utils/record/omit';
import { Chain, EvmChain } from '../../../../../model/chain';
import { useCurrentSendCoin } from '../../../state/sendCoin';

export type FeeSettings = {
  priority: FeePriority;
  gasLimit: number;
};

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

export const useFeeSettings = () => {
  const [coin] = useCurrentSendCoin();
  const [record, setRecord] = useFeeSettingsRecord();

  const value = useMemo(() => {
    const stringKey = feeSettingsKeyToString({
      chainId: coin.chainId,
      isNativeToken: isNativeCoin(coin),
    });

    if (stringKey in record) {
      return record[stringKey];
    }

    if (coin.chainId in EvmChain) {
      return {
        priority: defaultFeePriority,
        gasLimit: getEvmGasLimit({
          chainId: coin.chainId as EvmChain,
          isNativeToken: isNativeCoin(coin),
        }),
      };
    }

    return null;
  }, [coin, record]);

  const setValue = useCallback(
    (value: FeeSettings | null) => {
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
