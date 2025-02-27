import api from '@clients/extension/src/utils/api'
import {
  MessageKey,
  RequestMethod,
  TssKeysignType,
} from '@clients/extension/src/utils/constants'
import {
  ChainProps,
  Messaging,
  SendTransactionResponse,
  TransactionDetails,
  TransactionType,
} from '@clients/extension/src/utils/interfaces'
import { Chain } from '@core/chain/Chain'

const isArray = (arr: any): arr is any[] => {
  return Array.isArray(arr)
}

const isObject = (obj: any): obj is Record<string, any> => {
  return obj === Object(obj) && !isArray(obj) && typeof obj !== 'function'
}

const processDecodedData = (data: any): any => {
  if (Array.isArray(data)) {
    return data.map(item => processDecodedData(item))
  } else if (typeof data === 'bigint') {
    return data.toString()
  } else if (typeof data === 'object' && data !== null) {
    if (data.toString && (data._isBigNumber || typeof data === 'bigint')) {
      return data.toString()
    }
    return Object.keys(data).reduce((acc, key) => {
      acc[key] = processDecodedData(data[key])
      return acc
    }, {} as any)
  }
  return data
}

const toCamel = (value: string): string => {
  return value.replace(/([-_][a-z])/gi, $1 =>
    $1.toUpperCase().replace('-', '').replace('_', '')
  )
}

const toSnake = (value: string): string => {
  return value.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`)
}

export const bigintToByteArray = (bigNumber: bigint): Uint8Array => {
  if (typeof bigNumber !== 'bigint' || bigNumber < 0n)
    throw new Error('Input must be a non-negative BigInt.')

  const bytes = []

  while (bigNumber > 0n) {
    bytes.unshift(Number(bigNumber & 0xffn))
    bigNumber = bigNumber >> 8n
  }

  return new Uint8Array(bytes.length > 0 ? bytes : [0])
}

export const calculateWindowPosition = (
  currentWindow: chrome.windows.Window
) => {
  const height = 639
  const width = 376
  let left = 0
  let top = 0

  if (
    currentWindow &&
    currentWindow.left !== undefined &&
    currentWindow.top !== undefined &&
    currentWindow.width !== undefined
  ) {
    left = currentWindow.left + currentWindow.width - width
    top = currentWindow.top
  }

  return { height, left, top, width }
}

export const checkERC20Function = async (
  inputHex: string
): Promise<boolean> => {
  if (!inputHex || inputHex === '0x')
    return new Promise(resolve => resolve(false))

  const functionSelector = inputHex.slice(0, 10) // "0x" + 8 hex chars

  return await api.getIsFunctionSelector(functionSelector)
}

export const formatDisplayNumber = (
  _number: number | string,
  ticker: string
) => {
  if (String(_number).includes('$')) {
    // gasPrice is in usd and already formatted
    return _number
  }
  const n = Number(_number)

  if (n === 0) {
    return '0'
  } else if (n < 0.0000001) {
    return `${n.toFixed(9)} ${ticker}`
  } else if (n < 0.000001) {
    return `${n.toFixed(8)} ${ticker}`
  } else if (n < 0.00001) {
    return `${n.toFixed(7)} ${ticker}`
  } else if (n < 0.0001) {
    return `${n.toFixed(6)} ${ticker}`
  } else if (n < 0.001) {
    return `${n.toFixed(5)} ${ticker}`
  } else if (n < 0.01) {
    return `${n.toFixed(4)} ${ticker}`
  } else if (n < 1) {
    return `${n.toFixed(3)} ${ticker}`
  } else if (n < 2) {
    return `${n.toFixed(2)} ${ticker}`
  } else if (n < 10000) {
    return `${n.toFixed(0)} ${ticker}`
  } else if (n < 100000) {
    return `${Number((n / 1000).toFixed(0)).toLocaleString()}K ${ticker}`
  } else {
    return `${Number((n / 1000000).toFixed(0)).toLocaleString()}M ${ticker}`
  }
}

export const getTssKeysignType = (chain: Chain): TssKeysignType => {
  switch (chain) {
    case Chain.Solana:
    case Chain.Polkadot:
    case Chain.Sui:
    case Chain.Ton:
      return TssKeysignType.EdDSA
    default:
      return TssKeysignType.ECDSA
  }
}

export const splitString = (str: string, size: number): string[] => {
  const result: string[] = []

  for (let i = 0; i < str.length; i += size) {
    result.push(str.slice(i, i + size))
  }

  return result
}

export const toCamelCase = (obj: any): any => {
  if (isObject(obj)) {
    const n: Record<string, any> = {}

    Object.keys(obj).forEach(k => {
      n[toCamel(k)] = toCamelCase(obj[k])
    })

    return n
  } else if (isArray(obj)) {
    return obj.map(i => {
      return toCamelCase(i)
    })
  }

  return obj
}

export const toSnakeCase = (obj: any): any => {
  if (isObject(obj)) {
    const n: Record<string, any> = {}

    Object.keys(obj).forEach(k => {
      n[toSnake(k)] = toSnakeCase(obj[k])
    })

    return n
  } else if (isArray(obj)) {
    return obj.map(i => {
      return toSnakeCase(i)
    })
  }

  return obj
}

export const processBackgroundResponse = (
  data: Messaging.Chain.Request,
  messageKey: MessageKey,
  result: Messaging.Chain.Response
) => {
  switch (data.method) {
    case RequestMethod.CTRL.TRANSFER:
    case RequestMethod.METAMASK.ETH_SEND_TRANSACTION:
    case RequestMethod.VULTISIG.SEND_TRANSACTION:
    case RequestMethod.CTRL.DEPOSIT:
    case RequestMethod.VULTISIG.DEPOSIT_TRANSACTION: {
      if (messageKey === MessageKey.SOLANA_REQUEST)
        return (result as SendTransactionResponse).raw
      return (result as SendTransactionResponse).txResponse
    }
    default: {
      return result
    }
  }
}

export const getStandardTransactionDetails = async (
  tx: TransactionType.Keplr,
  chain: ChainProps
) => {
  switch (tx.txType) {
    case 'Keplr': {
      const txDetails: TransactionDetails = {
        asset: {
          chain: chain.ticker,
          ticker: tx.amount[0].denom,
        },
        amount: { amount: tx.amount[0].amount, decimals: chain.decimals },
        from: tx.from_address,
        to: tx.to_address,
      }

      return txDetails
    }
  }
}
