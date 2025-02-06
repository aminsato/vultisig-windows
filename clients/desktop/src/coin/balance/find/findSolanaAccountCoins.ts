// TODO: REWRITE THIS
import { queryUrl } from '@lib/utils/query/queryUrl';

import { ChainAccount } from '../../../chain/ChainAccount';
import { getSplAccounts } from '../../../chain/solana/client/getSplAccounts';
import { Chain } from '../../../model/chain';
import { Endpoint } from '../../../services/Endpoint';

export const findSolanaAccountCoins = async (account: ChainAccount) => {
  if (!account.address) {
    throw new Error('Invalid native token: Address is required');
  }

  const accounts = await getSplAccounts(account.address);
  if (!accounts.length) {
    return [];
  }

  const tokenAddresses = accounts.map(
    account => account.account.data.parsed.info.mint
  );
  const tokenInfos = await fetchSolanaTokenInfoList(tokenAddresses);

  return Object.entries(tokenInfos)
    .filter(([_, info = {}]) =>
      isValidToken({
        coingeckoId: info.tokenList?.extensions?.coingeckoId,
        symbol: info.tokenList?.symbol,
        decimals: info.decimals,
      })
    )
    .map(([address, info]) => ({
      chain: Chain.Solana,
      ticker: (info.tokenList?.symbol || '').toUpperCase(),
      logo: info.tokenList?.image || '',
      decimals: info.decimals || 0,
      contractAddress: address,
      isNativeToken: false,
      priceProviderId: info.tokenList?.extensions?.coingeckoId || '',
    }));
};

const fetchSolanaTokenInfoList = async (
  contractAddresses: string[]
): Promise<Record<string, any>> => {
  const results: Record<string, any> = {};
  const missingTokens: string[] = [];

  const solanaFmResults = await queryUrl(Endpoint.solanaTokenInfoServiceRpc, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      tokens: contractAddresses,
    }),
  });

  Object.assign(results, solanaFmResults);

  missingTokens.push(...contractAddresses.filter(addr => !results[addr]));

  if (missingTokens.length) {
    console.warn(`Missing tokens from Solana.fm: ${missingTokens.join(', ')}`);

    const fallbackResults = await fetchFromJupiterBatch(missingTokens);

    fallbackResults.forEach(({ address, data }) => {
      if (data) results[address] = data;
    });
  }
  return results;
};

const fetchFromJupiterBatch = async (
  contractAddresses: string[]
): Promise<{ address: string; data: any }[]> => {
  const fetchPromises = contractAddresses.map(address =>
    fetchFromJupiter(address)
      .then(data => ({ address, data }))
      .catch(error => {
        console.error(
          `Error fetching token ${address} from Jupiter API: ${error.message}`
        );
        return { address, data: null };
      })
  );

  return Promise.all(fetchPromises);
};

const fetchFromJupiter = async (contractAddress: string): Promise<any> => {
  const url = Endpoint.solanaTokenInfoJupiterServiceRpc(contractAddress);

  const response = await fetch(url, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });

  if (!response.ok) {
    throw new Error(`HTTP error: ${response.status}`);
  }

  return await response.json();
};

const isValidToken = (tokenInfo: {
  coingeckoId?: string;
  symbol?: string;
  decimals?: number;
}): boolean => {
  if (!tokenInfo?.symbol || !tokenInfo?.decimals || !tokenInfo?.coingeckoId) {
    console.warn(
      `Skipping token with incomplete metadata: ${JSON.stringify(tokenInfo)}`
    );
    return false;
  }
  return true;
};
