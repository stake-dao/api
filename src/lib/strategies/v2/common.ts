import memoize from 'memoizee'
import { MEMO_MAX_AGE, publicClient } from '../../utils'
import { fetchPrices } from '@stake-dao/reader'
import { One, tokenWithAddress } from '@stake-dao/constants'
import baseTokens from '../../../baseTokens'
import { formatUnits, parseAbi } from 'viem'

require('dotenv').config()

const abi = parseAbi([
  'function totalSupply() view returns (uint256)',
  'function balanceOf(address) view returns (uint256)',
  'function adjusted_balance_of(address) view returns (uint256)',
])

export const getStratsFromGraph = memoize(
  async () => {
    const stratsFromGraph = await fetch(
      'https://api-staking-v2-worker.contact-69d.workers.dev/api/rest/getallvaultswithassets',
    ).then((res) => res.json())

    return stratsFromGraph
  },
  { maxAge: MEMO_MAX_AGE },
)

export const getMetadata = memoize(
  async ({ protocol, chainId, veToken, veBoost, locker, altLocker }) => {
    const metadata = await publicClient[chainId]
      .multicall({
        contracts: [
          { address: veToken, functionName: 'totalSupply', abi },
          { address: veToken, functionName: 'balanceOf', abi, args: [locker] },
          { address: veToken, functionName: 'balanceOf', abi, args: [altLocker] },
          { address: veBoost, functionName: 'adjusted_balance_of', abi, args: [locker] },
          { address: veBoost, functionName: 'adjusted_balance_of', abi, args: [altLocker] },
        ],
      })
      .then((res) => ({
        [protocol]: {
          veTknTotalSupply: formatUnits(res[0].result || One, 0),
          stakeDaoVeBalance: formatUnits(res[1].result || One, 0),
          sidecarVeBalance: formatUnits(res[2].result || One, 0),
          stakeDaoVeBoost: formatUnits(res[3].result || One, 0),
          sidecarVeBoost: formatUnits(res[4].result || One, 0),
        },
      }))

    const tokens = Object.keys(baseTokens[protocol]).map((chainId) =>
      tokenWithAddress(baseTokens[protocol][chainId], Number(chainId)),
    )

    const baseRewardsPrices = await fetchPrices(tokens as any)

    return { metadata, baseRewardsPrices }
  },
  { maxAge: MEMO_MAX_AGE },
)
