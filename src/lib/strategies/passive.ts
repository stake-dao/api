import { fetchPassive } from '@stake-dao/reader'
import memoize from 'memoizee'
import { mainnet, polygon } from 'viem/chains'
import { MEMO_MAX_AGE, publicClient } from '../utils'

require('dotenv').config()

export const getPassiveMainnet = memoize(
  async () => fetchPassive({ provider: publicClient[mainnet.id], chainId: mainnet.id }),
  { maxAge: MEMO_MAX_AGE },
)

export const getPassivePolygon = memoize(
  async () => fetchPassive({ provider: publicClient[polygon.id], chainId: polygon.id }),
  { maxAge: MEMO_MAX_AGE },
)

export const getPassive = memoize(async () => {
  const [passiveDataMainnet, passiveDataPolygon] = await Promise.all([getPassiveMainnet(), getPassivePolygon()])

  return {
    lastUpdate: Math.floor(Date.now() / 1000),
    global: {},
    deployed: [...passiveDataMainnet.deployed, ...passiveDataPolygon.deployed],
    notDeployed: [...passiveDataMainnet.notDeployed, ...passiveDataPolygon.notDeployed],
    fetched: true,
  }
})
