import {
  getPrices as getReaderPrices,
  getPricesFromLlama as getReaderPricesFromLlama,
  getSdtInflationData,
  getGaugesWeights,
} from '@stake-dao/reader'
import memoize from 'memoizee'
import { createPublicClient, http } from 'viem'
import { arbitrum, base, bsc, fraxtal, linea, mainnet, polygon } from 'viem/chains'
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
  [polygon.id]: createPublicClient({
    chain: bsc,
    transport: http(RPC[polygon.id]),
  }),
  [fraxtal.id]: createPublicClient({
    chain: fraxtal,
    transport: http(RPC[fraxtal.id]),
  }),
  [base.id]: createPublicClient({
    chain: base,
    transport: http(RPC[base.id]),
  }),
  [arbitrum.id]: createPublicClient({
    chain: arbitrum,
    transport: http(RPC[arbitrum.id]),
  }),
  [linea.id]: createPublicClient({
    chain: linea,
    transport: http(RPC[linea.id]),
  }),
}

export const getPrices = memoize(async (tokens: any[], chainId = 1) => getReaderPrices(tokens, chainId), {
  maxAge: MEMO_MAX_AGE,
})

export const getPricesFromLlama = memoize(
  async (tokens: any[], chainId = 1) => getReaderPricesFromLlama(tokens, chainId),
  {
    maxAge: MEMO_MAX_AGE,
  },
)

export const getSdtInflation = memoize(async () => getSdtInflationData(publicClient[mainnet.id]), {
  maxAge: MEMO_MAX_AGE,
})

export const getCurveGaugesWeights = memoize(async () => getGaugesWeights(publicClient[mainnet.id], RPC[mainnet.id]), {
  maxAge: MEMO_MAX_AGE,
})

export const ethBlockNumber = async (rpc: string) =>
  fetch(rpc, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      id: 0,
      jsonrpc: '2.0',
      method: 'eth_blockNumber',
      params: [],
    }),
  }).then((res) => res.json())

// Etherscan
export const getEtherscanEvents = async ({ chainId, address, topic, fromBlock }) => {
  const queryParams = {
    chainid: `${chainId}`,
    module: 'logs',
    action: 'getLogs',
    apikey: process.env.ETHERSCAN_TOKEN as string,
    address,
    topic0: topic,
    fromBlock: `${fromBlock}`,
  }

  return await fetch(`https://api.etherscan.io/v2/api?${new URLSearchParams(queryParams)}`).then((res) => res.json())
}
