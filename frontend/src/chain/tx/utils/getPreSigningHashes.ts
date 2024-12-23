import { TW, WalletCore } from '@trustwallet/wallet-core';

import { withoutNullOrUndefined } from '../../../lib/utils/array/withoutNullOrUndefined';
import { Chain, UtxoChain } from '../../../model/chain';
import { getCoinType } from '../../walletCore/getCoinType';
import { hexEncode } from '../../walletCore/hexEncode';

type Input = {
  walletCore: WalletCore;
  chain: Chain;
  txInputData: Uint8Array;
};

export const getPreSigningHashes = ({
  walletCore,
  txInputData,
  chain,
}: Input) => {
  const preHashes = walletCore.TransactionCompiler.preImageHashes(
    getCoinType({
      walletCore,
      chain,
    }),
    txInputData
  );

  const getHashes = () => {
    if (chain in UtxoChain) {
      const { errorMessage, hashPublicKeys } =
        TW.Bitcoin.Proto.PreSigningOutput.decode(preHashes);

      if (errorMessage) {
        throw new Error(errorMessage);
      }

      return withoutNullOrUndefined(
        hashPublicKeys.map(hash => hash?.dataHash)
      ).sort();
    }

    const { errorMessage, dataHash } =
      TW.TxCompiler.Proto.PreSigningOutput.decode(preHashes);

    if (errorMessage) {
      throw new Error(errorMessage);
    }

    return [dataHash];
  };

  return getHashes().map(value =>
    hexEncode({
      value,
      walletCore,
    })
  );
};
