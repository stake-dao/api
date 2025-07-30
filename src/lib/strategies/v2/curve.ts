import { One, tokens } from '@stake-dao/constants'
import { SdtEmissionData, fetchCurve } from '@stake-dao/reader'
import memoize from 'memoizee'
import { arbitrum, base, fraxtal, gnosis, mainnet, optimism, sonic } from 'viem/chains'
import { MEMO_MAX_AGE, getCurveGaugesWeights, getPrices, getSdtInflation, publicClient } from '../../utils'
import { RPC } from '../../constants'
import { parseV2Strats } from './parse'
import { multicall } from 'viem/actions'
import { formatUnits, parseAbi } from 'viem'

require('dotenv').config()

const veToken = '0x5f3b5DfEb7B28CDbD7FAba78963EE202a494e2A2'
const veBoost = '0xD37A6aa3d8460Bd2b6536d608103D880695A23CD'
const convexLocker = '0x989AEb4d175e16225E39E87d0D97A3360524AD80'
const locker = '0x52f541764E6e90eeBc5c21Ff570De0e2D63766B6'

const abi = parseAbi([
  'function totalSupply() view returns (uint256)',
  'function balanceOf(address) view returns (uint256)',
  'function adjusted_balance_of(address) view returns (uint256)',
])

const getCurveFromGraph = memoize(
  async () => {
    const stratsFromGraph = await fetch(
      'https://api-staking-v2-worker.contact-69d.workers.dev/api/rest/getallvaultswithassets',
    ).then((res) => res.json())

    const metadata = await publicClient[mainnet.id]
      .multicall({
        contracts: [
          { address: veToken, functionName: 'totalSupply', abi },
          { address: veToken, functionName: 'balanceOf', abi, args: [locker] },
          { address: veToken, functionName: 'balanceOf', abi, args: [convexLocker] },
          { address: veBoost, functionName: 'adjusted_balance_of', abi, args: [locker] },
          { address: veBoost, functionName: 'adjusted_balance_of', abi, args: [convexLocker] },
        ],
      })
      .then((res) => ({
        veCrvTotalSupply: formatUnits(res[0].result || One, 0),
        stakeDaoVeBalance: formatUnits(res[1].result || One, 0),
        convexVeBalance: formatUnits(res[2].result || One, 0),
        stakeDaoVeBoost: formatUnits(res[3].result || One, 0),
        convexVeBoost: formatUnits(res[4].result || One, 0),
      }))

    return { metadata, strats: (stratsFromGraph?.Vault || []).filter((s) => s.protocolId === '0xc715e373') }
  },
  { maxAge: MEMO_MAX_AGE },
)

export const getCurveForChain_v2 = memoize(
  async (chainId: number) => {
    const { metadata, strats } = await getCurveFromGraph()

    return parseV2Strats(metadata, strats.filter((s) => s.chainId === chainId))
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
