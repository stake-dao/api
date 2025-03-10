import { fetchAngle } from '@stake-dao/reader'
import memoize from 'memoizee'
import { mainnet } from 'viem/chains'
import { MEMO_MAX_AGE, getPrices, publicClient } from '../utils'
import { RPC } from '../constants'
import { tokens } from '@stake-dao/constants'

require('dotenv').config()

export const getAngleMainnet = memoize(
  async () => {
    const prices = await getPrices(
      tokens.filter((t) => t.chainId === mainnet.id),
      mainnet.id,
    )

    return fetchAngle({
      prices,
      provider: publicClient[mainnet.id],
      rpc: RPC[mainnet.id],
      chainId: mainnet.id,
    })
  },
  { maxAge: MEMO_MAX_AGE },
)

export const getAngle = memoize(async () => {
  const [angleDataMainnet] = await Promise.all([getAngleMainnet()])

  return {
    lastUpdate: Math.floor(Date.now() / 1000),
    global: {
      [mainnet.id]: angleDataMainnet.global,
    },
    deployed: [...angleDataMainnet.deployed],
    notDeployed: [...angleDataMainnet.notDeployed],
    fetched: true,
  }
})
