import { One, tokenWithAddress } from '@stake-dao/constants'
import { parseV2Strats } from '@stake-dao/reader'
import memoize from 'memoizee'
import { arbitrum, base, etherlink, fraxtal, gnosis, mainnet, optimism, sonic } from 'viem/chains'
import { MEMO_MAX_AGE, publicClient } from '../../utils'
import { formatUnits, parseAbi } from 'viem'
import baseTokens from '../../../baseTokens'
import { fetchPrices } from '../../../prices'
import { getMetadata, getStratsFromGraph } from './common'

require('dotenv').config()

const protocol = 'curve'
const protocolId = '0xc715e373'

const veToken = '0x5f3b5DfEb7B28CDbD7FAba78963EE202a494e2A2'
const veBoost = '0xD37A6aa3d8460Bd2b6536d608103D880695A23CD'
const convexLocker = '0x989AEb4d175e16225E39E87d0D97A3360524AD80'
const locker = '0x52f541764E6e90eeBc5c21Ff570De0e2D63766B6'

const getCurveFromGraph = memoize(
  async () => {
    const [stratsFromGraph, { metadata, baseRewardsPrices }] = await Promise.all([
      getStratsFromGraph(),
      getMetadata({ protocol, chainId: mainnet.id, veToken, veBoost, locker, altLocker: convexLocker }),
    ])

    return {
      metadata,
      strats: (stratsFromGraph?.Vault || []).filter((s) => s.protocolId === protocolId),
      baseRewardsPrices,
    }
  },
  { maxAge: MEMO_MAX_AGE },
)

export const getCurveForChain_v2 = memoize(
  async (chainId: number) => {
    const { metadata, strats, baseRewardsPrices } = await getCurveFromGraph()

    return parseV2Strats(
      metadata,
      strats.filter((s) => s.chainId === chainId),
      { baseRewardsPrices },
    )
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
    curveDataEtherlink,
  ] = await Promise.all([
    getCurveForChain_v2(mainnet.id),
    getCurveForChain_v2(arbitrum.id),
    getCurveForChain_v2(fraxtal.id),
    getCurveForChain_v2(base.id),
    getCurveForChain_v2(sonic.id),
    getCurveForChain_v2(optimism.id),
    getCurveForChain_v2(gnosis.id),
    getCurveForChain_v2(etherlink.id),
  ])

  return {
    [mainnet.id]: curveDataMainnet,
    [arbitrum.id]: curveDataArbitrum,
    [fraxtal.id]: curveDataFraxtal,
    [base.id]: curveDataBase,
    [sonic.id]: curveDataSonic,
    [optimism.id]: curveDataOptimism,
    [gnosis.id]: curveDataGnosis,
    [etherlink.id]: curveDataEtherlink,
  }
})
