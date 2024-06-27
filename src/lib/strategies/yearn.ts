import { yearnStrats, tokens } from '@stake-dao/constants'
import { SdtEmissionData, fetchYearn } from '@stake-dao/reader'
import memoize from 'memoizee'
import { mainnet } from 'viem/chains'
import { MEMO_MAX_AGE, getPrices, getSdtInflation, publicClient } from '../utils'

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

    return fetchYearn(
      pricesMainnet,
      publicClient[mainnet.id],
      process.env.PUBLIC_RPC_MAINNET as string,
      process.env.ETHERSCAN_TOKEN as string,
      'etherscan.io',
      mainnet.id,
      yearnStrats.meta.lastSyncBlock[mainnet.id] + 1,
      sdtEmissionData as SdtEmissionData,
    )
  },
  { maxAge: MEMO_MAX_AGE },
)

export const getYearn = memoize(async () => {
  const [yearnDataMainnet] = await Promise.all([getYearnMainnet()])

  return {
    ...yearnDataMainnet,
    deployed: [...yearnDataMainnet.deployed],
    notDeployed: [...yearnDataMainnet.notDeployed],
  }
})
