import { tokens } from '@stake-dao/constants'
import { fetchPancakeswap } from '@stake-dao/reader'
import memoize from 'memoizee'
import { arbitrum, bsc, mainnet } from 'viem/chains'
import { MEMO_MAX_AGE, getPrices, publicClient } from '../utils'
import { RPC } from '../constants'

require('dotenv').config()

export const getPancakeMainnet = memoize(
  async () => {
    const prices = await getPrices(
      tokens.filter((t) => t.chainId === mainnet.id),
      mainnet.id,
    )

    return fetchPancakeswap({
      provider: publicClient[mainnet.id],
      rpc: RPC[mainnet.id],
      explorerApiKey: process.env.ETHERSCAN_TOKEN as string,
      chainId: mainnet.id,
      prices,
    })
  },
  { maxAge: MEMO_MAX_AGE },
)

export const getPancakeBsc = memoize(
  async () => {
    const prices = await getPrices(
      tokens.filter((t) => t.chainId === bsc.id),
      bsc.id,
    )

    return fetchPancakeswap({
      provider: publicClient[bsc.id],
      rpc: RPC[bsc.id],
      explorerApiKey: process.env.ETHERSCAN_TOKEN as string,
      chainId: bsc.id,
      prices,
    })
  },
  { maxAge: MEMO_MAX_AGE },
)

export const getPancakeArbitrum = memoize(
  async () => {
    const prices = await getPrices(
      tokens.filter((t) => t.chainId === arbitrum.id),
      arbitrum.id,
    )

    return fetchPancakeswap({
      provider: publicClient[arbitrum.id],
      rpc: RPC[arbitrum.id],
      explorerApiKey: process.env.ETHERSCAN_TOKEN as string,
      chainId: arbitrum.id,
      prices,
    })
  },
  { maxAge: MEMO_MAX_AGE },
)

export const getPancake = memoize(async () => {
  const [pancakeDataMainnet, pancakeDataBsc, pancakeDataArbitrum] = await Promise.all([
    getPancakeMainnet(),
    getPancakeBsc(),
    getPancakeArbitrum(),
  ])

  return {
    lastUpdate: Math.floor(Date.now() / 1000),
    global: {
      [mainnet.id]: pancakeDataMainnet.global,
      [bsc.id]: pancakeDataBsc.global,
      [arbitrum.id]: pancakeDataArbitrum.global,
    },
    deployed: [...pancakeDataMainnet.deployed, ...pancakeDataBsc.deployed, ...pancakeDataArbitrum.deployed],
    notDeployed: [...pancakeDataMainnet.notDeployed, ...pancakeDataBsc.notDeployed, ...pancakeDataArbitrum.notDeployed],
    fetched: true,
  }
})
