import { tokens } from '@stake-dao/constants'
import { SdtEmissionData, fetchCurve } from '@stake-dao/reader'
import memoize from 'memoizee'
import { arbitrum, mainnet } from 'viem/chains'
import { MEMO_MAX_AGE, getCurveGaugesWeights, getPricesFromLlama, getSdtInflation, publicClient } from '../utils'
import { RPC } from '../constants'

require('dotenv').config()

export const getCurveMainnet = memoize(
  async () => {
    const [pricesMainnet, sdtEmissionData, gaugesWeights] = await Promise.all([
      getPricesFromLlama(
        tokens.filter((t) => t.chainId === mainnet.id),
        mainnet.id,
      ),
      getSdtInflation(),
      getCurveGaugesWeights(),
    ])

    return fetchCurve({
      prices: pricesMainnet,
      provider: publicClient[mainnet.id],
      rpc: RPC[mainnet.id],
      chainId: mainnet.id,
      sdtEmissionData: sdtEmissionData as SdtEmissionData,
      gaugesWeights,
    })
  },
  { maxAge: MEMO_MAX_AGE },
)

export const getCurveArbitrum = memoize(
  async () => {
    const [pricesArbitrum, sdtEmissionData, gaugesWeights] = await Promise.all([
      getPricesFromLlama(
        tokens.filter((t) => t.chainId === arbitrum.id),
        arbitrum.id,
      ),
      getSdtInflation(),
      getCurveGaugesWeights(),
    ])

    return fetchCurve({
      prices: pricesArbitrum,
      provider: publicClient[arbitrum.id],
      rpc: RPC[arbitrum.id],
      chainId: arbitrum.id,
      sdtEmissionData: sdtEmissionData as SdtEmissionData,
      gaugesWeights,
    })
  },
  { maxAge: MEMO_MAX_AGE },
)

export const getCurve = memoize(async () => {
  const [curveDataMainnet, curveDataArbitrum] = await Promise.all([getCurveMainnet(), getCurveArbitrum()])

  return {
    lastUpdate: Math.floor(Date.now() / 1000),
    global: {
      [mainnet.id]: curveDataMainnet.global,
      [arbitrum.id]: curveDataArbitrum.global,
    },
    deployed: [...curveDataMainnet.deployed, ...curveDataArbitrum.deployed],
    notDeployed: [...curveDataMainnet.notDeployed, ...curveDataArbitrum.notDeployed],
    fetched: true,
  }
})
