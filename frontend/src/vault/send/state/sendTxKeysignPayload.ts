import { useMemo } from 'react';

import { fromChainAmount } from '../../../chain/utils/fromChainAmount';
import { useBalanceQuery } from '../../../coin/query/useBalanceQuery';
import { storageCoinToCoin } from '../../../coin/utils/storageCoin';
import { shouldBePresent } from '../../../lib/utils/assert/shouldBePresent';
import { ISendTransaction, TransactionType } from '../../../model/transaction';
import { useAssertWalletCore } from '../../../providers/WalletCoreProvider';
import { BlockchainServiceFactory } from '../../../services/Blockchain/BlockchainServiceFactory';
import { useCurrentVault, useCurrentVaultCoin } from '../../state/currentVault';
import { useSpecificSendTxInfoQuery } from '../queries/useSpecificSendTxInfoQuery';
import { useSender } from '../sender/hooks/useSender';
import { capSendAmountToMax } from '../utils/capSendAmountToMax';
import { useSendAmount } from './amount';
import { useSendMemo } from './memo';
import { useSendReceiver } from './receiver';
import { useCurrentSendCoin } from './sendCoin';

export const useSendTxKeysignPayload = () => {
  const [coinKey] = useCurrentSendCoin();
  const sender = useSender();
  const coin = useCurrentVaultCoin(coinKey);
  const [receiver] = useSendReceiver();
  const [amount] = useSendAmount();
  const [memo] = useSendMemo();
  const vault = useCurrentVault();

  const walletCore = useAssertWalletCore();

  const specificTxInfoQuery = useSpecificSendTxInfoQuery();
  const balanceQuery = useBalanceQuery(storageCoinToCoin(coin));

  return useMemo(() => {
    const balance = shouldBePresent(balanceQuery.data);
    const isMaxAmount =
      amount === fromChainAmount(balance.amount, coin.decimals);

    const specificTransactionInfo = shouldBePresent(specificTxInfoQuery.data);

    const tx: ISendTransaction = {
      fromAddress: sender,
      toAddress: receiver,
      amount: capSendAmountToMax({
        amount: shouldBePresent(amount),
        coin: storageCoinToCoin(coin),
        fee: specificTransactionInfo.fee,
      }),
      memo,
      coin: storageCoinToCoin(coin),
      transactionType: TransactionType.SEND,
      specificTransactionInfo: shouldBePresent(specificTxInfoQuery.data),
      sendMaxAmount: isMaxAmount,
    };

    const keysignPayload = BlockchainServiceFactory.createService(
      coinKey.chainId,
      walletCore
    ).createKeysignPayload(tx, vault.local_party_id, vault.public_key_ecdsa);

    return keysignPayload;
  }, [
    amount,
    balanceQuery.data,
    coin,
    coinKey.chainId,
    memo,
    receiver,
    sender,
    specificTxInfoQuery.data,
    vault.local_party_id,
    vault.public_key_ecdsa,
    walletCore,
  ]);
};
