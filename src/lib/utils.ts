import { getPricesFromLlama, getSdtInflationData, getGaugesWeights } from '@stake-dao/reader'
import memoize from 'memoizee'
import { createPublicClient, http } from 'viem'
import { arbitrum, bsc, mainnet } from 'viem/chains'

require('dotenv').config()

// Config
export const MEMO_MAX_AGE = 300000 // 5 minutes

// Providers
export const publicClient = {
  [mainnet.id]: createPublicClient({
    chain: mainnet,
    transport: http(process.env.PUBLIC_RPC_MAINNET),
  }),
  [arbitrum.id]: createPublicClient({
    chain: arbitrum,
    transport: http(process.env.PUBLIC_RPC_ARBITRUM),
  }),
  [bsc.id]: createPublicClient({
    chain: bsc,
    transport: http(),
  }),
}

export const getPrices = memoize(async (tokens: any[], chainId = 1) => getPricesFromLlama(tokens, chainId), {
  maxAge: MEMO_MAX_AGE,
})

export const getSdtInflation = memoize(
  async () => {
    const provider = createPublicClient({
      chain: mainnet,
      transport: http(process.env.PUBLIC_RPC_MAINNET),
    })

    return getSdtInflationData(provider, mainnet.id)
  },
  { maxAge: MEMO_MAX_AGE },
)

export const getCurveGaugesWeights = memoize(
  async () => {
    return getGaugesWeights(process.env.PUBLIC_RPC_MAINNET as string)
  },
  { maxAge: MEMO_MAX_AGE },
)
