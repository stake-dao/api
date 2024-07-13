import { tokens } from '@stake-dao/constants'
import { fetchPancakeswap } from '@stake-dao/reader'
import memoize from 'memoizee'
import { arbitrum, bsc, mainnet } from 'viem/chains'
import { MEMO_MAX_AGE, getPrices } from '../utils'
import { RPC } from '../constants'

require('dotenv').config()

export const getPancakeMainnet = memoize(
  async () => {
    const prices = await getPrices(
      tokens.filter((t) => t.chainId === mainnet.id),
      mainnet.id,
    )

    return fetchPancakeswap({
      rpc: RPC[mainnet.id],
      explorerApiKey: process.env.ETHERSCAN_TOKEN as string,
      chainId: mainnet.id,
      explorer: 'etherscan.io',
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
      rpc: RPC[bsc.id],
      explorerApiKey: process.env.BSCSCAN_TOKEN as string,
      chainId: bsc.id,
      explorer: 'bscscan.com',
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
      rpc: RPC[arbitrum.id],
      explorerApiKey: process.env.ARBISCAN_TOKEN as string,
      chainId: arbitrum.id,
      explorer: 'arbiscan.io',
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
