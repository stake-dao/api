import { tokens } from '@stake-dao/constants'
import { SdtEmissionData, fetchCurve } from '@stake-dao/reader'
import memoize from 'memoizee'
import { arbitrum, base, fraxtal, gnosis, mainnet, optimism, sonic } from 'viem/chains'
import { MEMO_MAX_AGE, getCurveGaugesWeights, getPrices, getSdtInflation, publicClient } from '../../utils'
import { RPC } from '../../constants'
import { parseV2Strats } from './parse'

require('dotenv').config()

const getCurveFromGraph = memoize(
  async () => {
    const stratsFromGraph = await fetch(
      'https://api-staking-v2-worker.contact-69d.workers.dev/api/rest/getallvaultswithassets',
    ).then((res) => res.json())

    return (stratsFromGraph?.Vault || []).filter((s) => s.protocolId === '0xc715e373')
  },
  { maxAge: MEMO_MAX_AGE },
)

export const getCurveForChain_v2 = memoize(
  async (chainId: number) => {
    const strats = await getCurveFromGraph()

    return parseV2Strats(strats.filter((s) => s.chainId === chainId))
  },
  { maxAge: MEMO_MAX_AGE },
)

export const getCurve_v2 = memoize(async () => {
  const [
    curveDataMainnet,
    curveDataArbitrum,
    curveDataFraxtal,
    curveDataBase,
    curveDataSonic,
    curveDataOptimism,
    curveDataGnosis,
  ] = await Promise.all([
    getCurveForChain_v2(mainnet.id),
    getCurveForChain_v2(arbitrum.id),
    getCurveForChain_v2(fraxtal.id),
    getCurveForChain_v2(base.id),
    getCurveForChain_v2(sonic.id),
    getCurveForChain_v2(optimism.id),
    getCurveForChain_v2(gnosis.id),
  ])

  return {
    [mainnet.id]: curveDataMainnet,
    [arbitrum.id]: curveDataArbitrum,
    [fraxtal.id]: curveDataFraxtal,
    [base.id]: curveDataBase,
    [sonic.id]: curveDataSonic,
    [optimism.id]: curveDataOptimism,
    [gnosis.id]: curveDataGnosis,
  }
})
