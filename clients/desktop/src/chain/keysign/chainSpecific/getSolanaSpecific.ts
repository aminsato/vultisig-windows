import { create } from '@bufbuild/protobuf';
import { SolanaSpecificSchema } from '@core/communication/vultisig/keysign/v1/blockchain_specific_pb';
import { shouldBePresent } from '@lib/utils/assert/shouldBePresent';
import { Address } from '@solana/web3.js';

import { getSolanaRpcClient } from '../../solana/rpc/getSolanaRpcClient';
import { getSolanaTokenAssociatedAccount } from '../../solana/rpc/getSolanaTokenAssociatedAccount';
import { KeysignChainSpecificValue } from '../KeysignChainSpecific';
import { GetChainSpecificInput } from './GetChainSpecificInput';

export const getSolanaSpecific = async ({
  coin,
  receiver,
}: GetChainSpecificInput): Promise<KeysignChainSpecificValue> => {
  const client = getSolanaRpcClient();

  const recentBlockHash = (
    await client.getLatestBlockhash().send()
  ).value.blockhash.toString();

  const prioritizationFees = await client
    .getRecentPrioritizationFees([coin.address as Address])
    .send();

  const highPriorityFee = Math.max(
    ...prioritizationFees.map(fee => Number(fee.prioritizationFee.valueOf())),
    0
  );

  const result = create(SolanaSpecificSchema, {
    recentBlockHash,
    priorityFee: highPriorityFee.toString(),
  });

  if (!coin.isNativeToken) {
    result.fromTokenAssociatedAddress = await getSolanaTokenAssociatedAccount({
      account: coin.address,
      token: coin.contractAddress,
    });
    result.toTokenAssociatedAddress = await getSolanaTokenAssociatedAccount({
      account: shouldBePresent(receiver),
      token: coin.contractAddress,
    });
  }

  return result;
};
