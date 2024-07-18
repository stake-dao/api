import { yearnStrats, tokens } from '@stake-dao/constants'
import { SdtEmissionData, fetchYearn } from '@stake-dao/reader'
import memoize from 'memoizee'
import { mainnet } from 'viem/chains'
import { MEMO_MAX_AGE, getPrices, getSdtInflation, publicClient } from '../utils'
import { RPC } from '../constants'

require('dotenv').config()

export const getYearnMainnet = memoize(
  async () => {
    const [pricesMainnet, sdtEmissionData] = await Promise.all([
      getPrices(
        tokens.filter((t) => t.chainId === mainnet.id),
        mainnet.id,
      ),
      getSdtInflation(),
    ])

    return fetchYearn({
      prices: pricesMainnet,
      provider: publicClient[mainnet.id],
      rpc: RPC[mainnet.id],
      explorerApiKey: process.env.ETHERSCAN_TOKEN as string,
      explorer: 'etherscan.io',
      chainId: mainnet.id,
      lastBlockNumber: yearnStrats.meta.lastSyncBlock[mainnet.id] + 1,
      sdtEmissionData: sdtEmissionData as SdtEmissionData,
    })
  },
  { maxAge: MEMO_MAX_AGE },
)

export const getYearn = memoize(async () => {
  const [yearnDataMainnet] = await Promise.all([getYearnMainnet()])

  return {
    global: {
      [mainnet.id]: yearnDataMainnet.global,
    },
    deployed: [...yearnDataMainnet.deployed],
    notDeployed: [...yearnDataMainnet.notDeployed],
    fetched: true,
  }
})
