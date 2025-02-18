export type OneInchSwapQuoteResponse = {
  dstAmount: string
  tx: {
    from: string
    to: string
    data: string
    value: string
    gasPrice: string
    gas: number
  }
}
