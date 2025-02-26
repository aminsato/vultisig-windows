import { Chain } from '@core/chain/Chain'
import { Coin } from '@core/chain/coin/Coin'
import { recordMap } from '@lib/utils/record/recordMap'

const leanChainFeeCoin: Record<Chain, Omit<Coin, 'chain' | 'id'>> = {
  [Chain.Bitcoin]: {
    ticker: 'BTC',
    logo: 'btc',
    decimals: 8,
    priceProviderId: 'bitcoin',
    cmcId: 1,
  },
  [Chain.BitcoinCash]: {
    ticker: 'BCH',
    logo: 'bch',
    decimals: 8,
    priceProviderId: 'bitcoin-cash',
    cmcId: 1831,
  },
  [Chain.Litecoin]: {
    ticker: 'LTC',
    logo: 'ltc',
    decimals: 8,
    priceProviderId: 'litecoin',
    cmcId: 2,
  },
  [Chain.Dogecoin]: {
    ticker: 'DOGE',
    logo: 'doge',
    decimals: 8,
    priceProviderId: 'dogecoin',
    cmcId: 74,
  },
  [Chain.Dash]: {
    ticker: 'DASH',
    logo: 'dash',
    decimals: 8,
    priceProviderId: 'dash',
    cmcId: 131,
  },
  [Chain.Ripple]: {
    ticker: 'XRP',
    logo: 'xrp',
    decimals: 6,
    priceProviderId: 'ripple',
    cmcId: 52,
  },
  [Chain.THORChain]: {
    ticker: 'RUNE',
    logo: 'rune',
    decimals: 8,
    priceProviderId: 'thorchain',
    cmcId: 4157,
  },
  [Chain.MayaChain]: {
    ticker: 'CACAO',
    logo: 'cacao',
    decimals: 10,
    priceProviderId: 'cacao',
    cmcId: 23534,
  },
  [Chain.Solana]: {
    ticker: 'SOL',
    logo: 'solana',
    decimals: 9,
    priceProviderId: 'solana',
    cmcId: 5426,
  },
  [Chain.Ton]: {
    ticker: 'TON',
    logo: 'ton',
    decimals: 9,
    priceProviderId: 'the-open-network',
    cmcId: 11419,
  },
  [Chain.Ethereum]: {
    ticker: 'ETH',
    logo: 'eth',
    decimals: 18,
    priceProviderId: 'ethereum',
    cmcId: 1027,
  },
  [Chain.Avalanche]: {
    ticker: 'AVAX',
    logo: 'avax',
    decimals: 18,
    priceProviderId: 'avalanche-2',
    cmcId: 5805,
  },
  [Chain.BSC]: {
    ticker: 'BNB',
    logo: 'bsc',
    decimals: 18,
    priceProviderId: 'binancecoin',
    cmcId: 1839,
  },
  [Chain.Base]: {
    ticker: 'ETH',
    logo: 'ethereum',
    decimals: 18,
    priceProviderId: 'ethereum',
    cmcId: 1027,
  },
  [Chain.Arbitrum]: {
    ticker: 'ETH',
    logo: 'ethereum',
    decimals: 18,
    priceProviderId: 'ethereum',
    cmcId: 1027,
  },
  [Chain.Optimism]: {
    ticker: 'ETH',
    logo: 'ethereum',
    decimals: 18,
    priceProviderId: 'ethereum',
    cmcId: 1027,
  },
  [Chain.Polygon]: {
    ticker: 'MATIC',
    logo: 'matic',
    decimals: 18,
    priceProviderId: 'matic-network',
    cmcId: 3890,
  },
  [Chain.Blast]: {
    ticker: 'ETH',
    logo: 'ethereum',
    decimals: 18,
    priceProviderId: 'ethereum',
    cmcId: 1027,
  },
  [Chain.CronosChain]: {
    ticker: 'CRO',
    logo: 'cro',
    decimals: 18,
    priceProviderId: 'crypto-com-chain',
    cmcId: 3635,
  },
  [Chain.Zksync]: {
    ticker: 'ETH',
    logo: 'ethereum',
    decimals: 18,
    priceProviderId: 'ethereum',
    cmcId: 1027,
  },
  [Chain.Dydx]: {
    ticker: 'DYDX',
    logo: 'dydx',
    decimals: 18,
    priceProviderId: 'dydx-chain',
    cmcId: 28324,
  },
  [Chain.Kujira]: {
    ticker: 'KUJI',
    logo: 'kuji',
    decimals: 6,
    priceProviderId: 'kujira',
    cmcId: 15185,
  },
  [Chain.Terra]: {
    ticker: 'LUNA',
    logo: 'luna',
    decimals: 6,
    priceProviderId: 'terra-luna-2',
    cmcId: 20314,
  },
  [Chain.TerraClassic]: {
    ticker: 'LUNC',
    logo: 'lunc',
    decimals: 6,
    priceProviderId: 'terra-luna',
    cmcId: 4172,
  },
  [Chain.Sui]: {
    ticker: 'SUI',
    logo: 'sui',
    decimals: 9,
    priceProviderId: 'sui',
    cmcId: 20947,
  },
  [Chain.Polkadot]: {
    ticker: 'DOT',
    logo: 'dot',
    decimals: 10,
    priceProviderId: 'polkadot',
    cmcId: 6636,
  },
  [Chain.Noble]: {
    ticker: 'USDC',
    logo: 'usdc',
    decimals: 6,
    priceProviderId: 'usd-coin',
    cmcId: 3408,
  },
  [Chain.Akash]: {
    ticker: 'AKT',
    logo: 'akash',
    decimals: 6,
    priceProviderId: 'akash-network',
    cmcId: 7431,
  },
  [Chain.Cosmos]: {
    ticker: 'ATOM',
    logo: 'atom',
    decimals: 6,
    priceProviderId: 'cosmos',
    cmcId: 3794,
  },
  [Chain.Osmosis]: {
    ticker: 'OSMO',
    logo: 'osmo',
    decimals: 6,
    priceProviderId: 'osmosis',
    cmcId: 12220,
  },
}

export const chainFeeCoin: Record<Chain, Coin> = recordMap(
  leanChainFeeCoin,
  (coin, chain) => ({
    ...coin,
    chain,
    id: coin.ticker,
  })
)
