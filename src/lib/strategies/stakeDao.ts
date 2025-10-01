import { tokenWithId } from '@stake-dao/constants'
import { fetchStakeDao } from '@stake-dao/reader'
import memoize from 'memoizee'
import { mainnet } from 'viem/chains'
import { MEMO_MAX_AGE, getPricesFromLlama, publicClient } from '../utils'
import { getLockersMainnet } from '../lockers'

require('dotenv').config()

export const getStakeDaoMainnet = memoize(
  async () => {
    const [lockersMainnet, pricesMainnet] = await Promise.all([
      getLockersMainnet(),
      getPricesFromLlama([tokenWithId('sdt')], mainnet.id),
    ])

    return fetchStakeDao({
      prices: pricesMainnet,
      provider: publicClient[mainnet.id],
      explorerApiKey: process.env.ETHERSCAN_TOKEN as string,
      chainId: mainnet.id,
      lockers: lockersMainnet.parsed,
    })
  },
  { maxAge: MEMO_MAX_AGE },
)

export const getStakeDao = memoize(async () => {
  const [stakeDaoDataMainnet] = await Promise.all([getStakeDaoMainnet()])

  return {
    lastUpdate: Math.floor(Date.now() / 1000),
    global: {
      [mainnet.id]: stakeDaoDataMainnet.global,
    },
    deployed: [...stakeDaoDataMainnet.deployed],
    notDeployed: [...stakeDaoDataMainnet.notDeployed],
    fetched: true,
  }
})
