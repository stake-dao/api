import { SdtEmissionData, fetchBalancer } from '@stake-dao/reader'
import memoize from 'memoizee'
import { mainnet } from 'viem/chains'
import { MEMO_MAX_AGE, getSdtInflation, publicClient } from '../utils'

require('dotenv').config()

export const getBalancerMainnet = memoize(
  async () => {
    const sdtEmissionData = await getSdtInflation()

    return fetchBalancer({
      provider: publicClient[mainnet.id],
      explorerApiKey: process.env.ETHERSCAN_TOKEN as string,
      explorer: 'etherscan.io',
      chainId: mainnet.id,
      sdtEmissionData: sdtEmissionData as SdtEmissionData,
    })
  },
  { maxAge: MEMO_MAX_AGE },
)

export const getBalancer = memoize(async () => {
  const [balancerDataMainnet] = await Promise.all([getBalancerMainnet()])

  return {
    global: {
      [mainnet.id]: balancerDataMainnet.global,
    },
    deployed: [...balancerDataMainnet.deployed],
    notDeployed: [...balancerDataMainnet.notDeployed],
    fetched: true,
  }
})
