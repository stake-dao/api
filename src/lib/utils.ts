import { getPricesFromLlama, getSdtInflationData, getGaugesWeights } from '@stake-dao/reader'
import memoize from 'memoizee'
import { createPublicClient, http } from 'viem'
import { arbitrum, bsc, fraxtal, mainnet } from 'viem/chains'
import { RPC } from './constants'

require('dotenv').config()

// Config
export const MEMO_MAX_AGE = 300000 // 5 minutes
export const STAKE_DAO_ASSETS_BASE_URL = 'https://raw.githubusercontent.com/stake-dao/assets/main'

// Providers
export const publicClient = {
  [mainnet.id]: createPublicClient({
    chain: mainnet,
    transport: http(RPC[mainnet.id]),
  }),
  [bsc.id]: createPublicClient({
    chain: bsc,
    transport: http(RPC[bsc.id]),
  }),
  [fraxtal.id]: createPublicClient({
    chain: fraxtal,
    transport: http(RPC[fraxtal.id]),
  }),
  [arbitrum.id]: createPublicClient({
    chain: arbitrum,
    transport: http(RPC[arbitrum.id]),
  }),
}

export const getPrices = memoize(async (tokens: any[], chainId = 1) => getPricesFromLlama(tokens, chainId), {
  maxAge: MEMO_MAX_AGE,
})

export const getSdtInflation = memoize(async () => getSdtInflationData(publicClient[mainnet.id]), {
  maxAge: MEMO_MAX_AGE,
})

export const getCurveGaugesWeights = memoize(async () => getGaugesWeights(publicClient[mainnet.id], RPC[mainnet.id]), {
  maxAge: MEMO_MAX_AGE,
})
