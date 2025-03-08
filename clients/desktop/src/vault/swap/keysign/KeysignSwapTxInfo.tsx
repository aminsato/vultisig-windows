import { fromChainAmount } from '@core/chain/amount/fromChainAmount'
import { Chain } from '@core/chain/Chain'
import { OneInchSwapPayload } from '@core/communication/vultisig/keysign/v1/1inch_swap_payload_pb'
import { KeysignPayload } from '@core/communication/vultisig/keysign/v1/keysign_message_pb'
import { withoutUndefined } from '@lib/utils/array/withoutUndefined'
import { formatTokenAmount } from '@lib/utils/formatTokenAmount'
import { getDiscriminatedUnionValue } from '@lib/utils/getDiscriminatedUnionValue'
import { matchDiscriminatedUnion } from '@lib/utils/matchDiscriminatedUnion'
import { assertField } from '@lib/utils/record/assertField'
import { useTranslation } from 'react-i18next'

import {
  KeysignSwapPayload,
  toKeysignSwapPayload,
} from '../../../chain/keysign/KeysignSwapPayload'
import { generalSwapProviderName } from '../../../chain/swap/general/GeneralSwapProvider'
import {
  TxOverviewChainDataRow,
  TxOverviewRow,
} from '../../../chain/tx/components/TxOverviewRow'
import { ValueProp } from '../../../lib/ui/props'

export const KeysignSwapTxInfo = ({ value }: ValueProp<KeysignPayload>) => {
  const { erc20ApprovePayload, toAmount: fromAmount } = value

  const fromCoin = assertField(value, 'coin')

  const { t } = useTranslation()

  const action = withoutUndefined([
    erc20ApprovePayload ? t('approve') : undefined,
    t('swap'),
  ]).join(` ${t('and')} `)

  const swapPayload = toKeysignSwapPayload(value.swapPayload)

  const swapPayloadValue = getDiscriminatedUnionValue(
    swapPayload,
    'case',
    'value',
    swapPayload.case
  )

  const toCoin = assertField(swapPayloadValue, 'toCoin')
  const toAmount = Number(swapPayloadValue.toAmountDecimal)

  const provider = matchDiscriminatedUnion<KeysignSwapPayload, string>(
    swapPayload,
    'case',
    'value',
    {
      thorchainSwapPayload: () => Chain.THORChain,
      mayachainSwapPayload: () => Chain.MayaChain,
      oneinchSwapPayload: () => {
        const oneInchPayload = swapPayload?.value as OneInchSwapPayload
        if (oneInchPayload?.quote?.tx?.swapFee) {
          return generalSwapProviderName.lifi
        } else {
          return generalSwapProviderName.oneinch
        }
      },
    }
  )

  return (
    <>
      <TxOverviewRow>
        <span>{t('action')}</span>
        <span>{action}</span>
      </TxOverviewRow>
      <TxOverviewRow>
        <span>{t('provider')}</span>
        <span>{provider}</span>
      </TxOverviewRow>
      <TxOverviewRow>
        <span>{t('from_asset')}</span>
        <span>
          {formatTokenAmount(
            fromChainAmount(fromAmount, fromCoin.decimals),
            fromCoin.ticker
          )}
        </span>
      </TxOverviewRow>
      <TxOverviewRow>
        <span>{t('to_asset')}</span>
        <span>{formatTokenAmount(toAmount, toCoin.ticker)}</span>
      </TxOverviewRow>

      {erc20ApprovePayload && (
        <>
          <TxOverviewChainDataRow>
            <span>{t('allowance_spender')}</span>
            <span>{erc20ApprovePayload.spender}</span>
          </TxOverviewChainDataRow>
          <TxOverviewChainDataRow>
            <span>{t('allowance_amount')}</span>
            <span>
              {formatTokenAmount(
                fromChainAmount(erc20ApprovePayload.amount, fromCoin.decimals),
                fromCoin.ticker
              )}
            </span>
          </TxOverviewChainDataRow>
        </>
      )}
    </>
  )
}
