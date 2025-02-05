import { Address } from '@solana/web3.js';

import { getSolanaRpcClient } from './getSolanaRpcClient';

type Input = {
  account: string;
  token: string;
};

export const getSolanaTokenAssociatedAccount = async ({
  account,
  token,
}: Input): Promise<Address> => {
  const client = getSolanaRpcClient();

  const { value } = await client
    .getTokenAccountsByOwner(account as Address, {
      mint: token as Address,
    })
    .send();

  return value[0].pubkey;
};
