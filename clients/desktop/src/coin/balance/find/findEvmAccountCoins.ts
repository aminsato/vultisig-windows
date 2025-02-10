import { EvmChain } from '@core/chain/Chain';
import { rootApiUrl } from '@core/config';
import { queryUrl } from '@lib/utils/query/queryUrl';

import { ChainAccount } from '../../../chain/ChainAccount';
import { getEvmChainId } from '../../../chain/evm/chainInfo';
import { fromOneInchToken, OneInchToken } from '../../oneInch/token';

interface OneInchBalanceResponse {
  [tokenAddress: string]: string;
}

export const findEvmAccountCoins = async (account: ChainAccount<EvmChain>) => {
  const oneInchChainId = getEvmChainId(account.chain);

  const url = `${rootApiUrl}/1inch/balance/v1.2/${oneInchChainId}/balances/${account.address}`;

  const balanceData = await queryUrl<OneInchBalanceResponse>(url);

  await new Promise(resolve => setTimeout(resolve, 1000)); // We have some rate limits on 1 inch, so I will wait a bit

  // Filter tokens with non-zero balance
  const nonZeroBalanceTokenAddresses = Object.entries(balanceData)
    .filter(([_, balance]) => BigInt(balance as string) > 0n) // Ensure the balance is non-zero
    .map(([tokenAddress]) => tokenAddress)
    .filter(
      tokenAddress =>
        tokenAddress !== '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee'
    );

  if (nonZeroBalanceTokenAddresses.length === 0) {
    return [];
  }

  // Fetch token information for the non-zero balance tokens
  const tokenInfoUrl = `${rootApiUrl}/1inch/token/v1.2/${oneInchChainId}/custom?addresses=${nonZeroBalanceTokenAddresses.join(',')}`;
  const tokenInfoData =
    await queryUrl<Record<string, OneInchToken>>(tokenInfoUrl);

  // Map the fetched token information to CoinMeta[] format
  return nonZeroBalanceTokenAddresses
    .map(tokenAddress => {
      const tokenInfo = tokenInfoData[tokenAddress];
      if (!tokenInfo) return null;

      return fromOneInchToken({
        token: tokenInfo,
        chain: account.chain,
      });
    })
    .filter(token => token !== null);
};
