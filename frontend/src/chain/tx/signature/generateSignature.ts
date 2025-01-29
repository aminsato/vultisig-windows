import { WalletCore } from '@trustwallet/wallet-core';

import { tss } from '../../../../wailsjs/go/models';
import { match } from '../../../lib/utils/match';
import { pick } from '../../../lib/utils/record/pick';
import { recordMap } from '../../../lib/utils/record/recordMap';
import {
  Chain,
  getChainKind,
  signatureFormatRecord,
} from '../../../model/chain';

type Input = {
  walletCore: WalletCore;
  signature: tss.KeysignResponse;
  chain: Chain;
};

export const generateSignature = ({ walletCore, signature, chain }: Input) => {
  const chainKind = getChainKind(chain);
  const signatureFormat = signatureFormatRecord[chainKind];

  return match(signatureFormat, {
    rawWithRecoveryId: () => {
      const { r, s, recovery_id } = recordMap(
        pick(signature, ['r', 's', 'recovery_id']),
        value => walletCore.HexCoding.decode(value)
      );

      return new Uint8Array([...r, ...s, ...recovery_id]);
    },
    raw: () => {
      const { r, s } = recordMap(pick(signature, ['r', 's']), value =>
        walletCore.HexCoding.decode(value)
      );

      return new Uint8Array([...r, ...s]);
    },
    der: () => {
      return walletCore.HexCoding.decode(signature.der_signature);
    },
  });
};
