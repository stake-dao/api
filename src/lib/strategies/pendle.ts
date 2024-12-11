import { fetchPendle } from '@stake-dao/reader'
import memoize from 'memoizee'
import { mainnet } from 'viem/chains'
import { MEMO_MAX_AGE, getPrices, publicClient } from '../utils'
import { RPC } from '../constants'
import { tokens } from '@stake-dao/constants'

require('dotenv').config()

export const getPendleMainnet = memoize(
  async () => {
    const prices = await getPrices(
      tokens.filter((t) => t.chainId === mainnet.id),
      mainnet.id,
    )

    return fetchPendle({
      prices,
      provider: publicClient[mainnet.id],
      rpc: RPC[mainnet.id],
      explorerApiKey: process.env.ETHERSCAN_TOKEN as string,
      explorer: 'etherscan.io',
      chainId: mainnet.id,
    })
  },
  { maxAge: MEMO_MAX_AGE },
)

export const getPendle = memoize(async () => {
  const [pendleDataMainnet] = await Promise.all([getPendleMainnet()])

  return {
    lastUpdate: Math.floor(Date.now() / 1000),
    global: {
      [mainnet.id]: pendleDataMainnet.global,
    },
    deployed: [...pendleDataMainnet.deployed],
    notDeployed: [...pendleDataMainnet.notDeployed],
    fetched: true,
  }
})
