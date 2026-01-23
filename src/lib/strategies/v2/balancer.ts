import { parseV2Strats } from '@stake-dao/reader'
import memoize from 'memoizee'
import { mainnet } from 'viem/chains'
import { MEMO_MAX_AGE } from '../../utils'
import { getMetadata, getStratsFromGraph } from './common'

require('dotenv').config()

const protocol = 'balancer'
const protocolId = '0xb774acb8'

const veToken = '0xC128a9954e6c874eA3d62ce62B468bA073093F25'
const veBoost = '0x2cf8e145Bdfe7c52b49AD9bB3c294a31B2736c59'
const auraLocker = '0xaF52695E1bB01A16D33D7194C28C42b10e0Dbec2'
const locker = '0xea79d1A83Da6DB43a85942767C389fE0ACf336A5'

const getBalancerFromGraph = memoize(
  async () => {
    const [stratsFromGraph, { metadata, baseRewardsPrices }] = await Promise.all([
      getStratsFromGraph(),
      getMetadata({ protocol, chainId: mainnet.id, veToken, veBoost, locker, altLocker: auraLocker }),
    ])

    return {
      metadata,
      strats: (stratsFromGraph?.Vault || []).filter((s) => s.protocolId === protocolId),
      baseRewardsPrices,
    }
  },
  { maxAge: MEMO_MAX_AGE },
)

export const getBalancerForChain_v2 = memoize(
  async (chainId: number) => {
    const { metadata, strats, baseRewardsPrices } = await getBalancerFromGraph()

    return parseV2Strats(
      metadata,
      strats.filter((s) => s.chainId === chainId),
      { baseRewardsPrices },
    )
  },
  { maxAge: MEMO_MAX_AGE },
)

export const getBalancer_v2 = memoize(async () => {
  const [balancerDataMainnet] = await Promise.all([getBalancerForChain_v2(mainnet.id)])

  return {
    [mainnet.id]: balancerDataMainnet,
  }
})
