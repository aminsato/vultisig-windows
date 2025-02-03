import { WalletCore } from '@trustwallet/wallet-core';

import { getErc20ApproveTxInputData } from '../../../chain/evm/tx/getErc20ApproveTxInputData';
import { incrementKeysignPayloadNonce } from '../../../chain/evm/tx/incrementKeysignPayloadNonce';
import { getPreSignedInputData } from '../../../chain/keysign/preSignedInputData/getPreSignedInputData';
import { getOneInchSwapTxInputData } from '../../../chain/swap/general/oneInch/tx/getOneInchSwapTxInputData';
import { getThorchainSwapTxInputData } from '../../../chain/swap/native/thor/tx/getThorchainSwapTxInputData';
import { KeysignPayload } from '../../../gen/vultisig/keysign/v1/keysign_message_pb';
import { matchDiscriminatedUnion } from '@lib/utils/matchDiscriminatedUnion';
import { getKeysignChain } from './getKeysignChain';

type Input = {
  keysignPayload: KeysignPayload;
  walletCore: WalletCore;
};

export const getTxInputData = async ({
  keysignPayload,
  walletCore,
}: Input): Promise<Uint8Array[]> => {
  const chain = getKeysignChain(keysignPayload);

  const { erc20ApprovePayload, ...restOfKeysignPayload } = keysignPayload;
  if (erc20ApprovePayload) {
    const approveTxInputData = getErc20ApproveTxInputData({
      keysignPayload,
      walletCore,
    });

    const restOfTxInputData = await getTxInputData({
      keysignPayload: incrementKeysignPayloadNonce(
        new KeysignPayload(restOfKeysignPayload)
      ),
      walletCore,
    });

    return [approveTxInputData, ...restOfTxInputData];
  }

  if ('swapPayload' in keysignPayload && keysignPayload.swapPayload.value) {
    const txInputData: Uint8Array = await matchDiscriminatedUnion(
      keysignPayload.swapPayload,
      'case',
      'value',
      {
        thorchainSwapPayload: () =>
          getThorchainSwapTxInputData({
            keysignPayload,
            walletCore,
          }),
        mayachainSwapPayload: () => {
          throw new Error('Mayachain swap not supported');
        },
        oneinchSwapPayload: () =>
          getOneInchSwapTxInputData({
            keysignPayload,
            walletCore,
          }),
      }
    );

    return [txInputData];
  }

  const txInputData = await getPreSignedInputData({
    keysignPayload,
    walletCore,
    chain,
  });

  return [txInputData];
};
