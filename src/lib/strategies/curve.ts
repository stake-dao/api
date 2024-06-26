import { curveStrats, tokens } from '@stake-dao/constants'
import { SdtEmissionData, fetchCurve } from '@stake-dao/reader'
import memoize from 'memoizee'
import { arbitrum, mainnet } from 'viem/chains'
import { MEMO_MAX_AGE, getCurveGaugesWeights, getPrices, getSdtInflation, publicClient } from '../utils'

require('dotenv').config()

export const getCurveMainnet = memoize(
  async () => {
    const [pricesMainnet, sdtEmissionData, gaugesWeights] = await Promise.all([
      getPrices(
        tokens.filter((t) => t.chainId === mainnet.id),
        mainnet.id,
      ),
      getSdtInflation(),
      getCurveGaugesWeights(),
    ])

    return fetchCurve(
      pricesMainnet,
      publicClient[mainnet.id],
      process.env.PUBLIC_RPC_MAINNET as string,
      process.env.ETHERSCAN_TOKEN as string,
      'etherscan.io',
      mainnet.id,
      curveStrats.meta.lastSyncBlock[mainnet.id],
      sdtEmissionData as SdtEmissionData,
      gaugesWeights,
    )
  },
  { maxAge: MEMO_MAX_AGE },
)

export const getCurveArbitrum = memoize(
  async () => {
    const [pricesArbitrum, sdtEmissionData, gaugesWeights] = await Promise.all([
      getPrices(
        tokens.filter((t) => t.chainId === arbitrum.id),
        arbitrum.id,
      ),
      getSdtInflation(),
      getCurveGaugesWeights(),
    ])

    return fetchCurve(
      pricesArbitrum,
      publicClient[arbitrum.id],
      process.env.PUBLIC_RPC_ARBITRUM as string,
      process.env.ARBISCAN_TOKEN as string,
      'arbiscan.io',
      arbitrum.id,
      curveStrats.meta.lastSyncBlock[arbitrum.id],
      sdtEmissionData as SdtEmissionData,
      gaugesWeights,
    )
  },
  { maxAge: MEMO_MAX_AGE },
)

export const getCurve = memoize(async () => {
  const [curveDataMainnet, curveDataArbitrum] = await Promise.all([getCurveMainnet(), getCurveArbitrum()])

  return {
    ...curveDataMainnet,
    deployed: [...curveDataMainnet.deployed, ...curveDataArbitrum.deployed],
    notDeployed: [...curveDataMainnet.notDeployed, ...curveDataArbitrum.notDeployed],
  }
})
