import { fetchSdt } from '@stake-dao/reader'
import memoize from 'memoizee'
import { mainnet } from 'viem/chains'
import { MEMO_MAX_AGE, getPrices, publicClient } from './utils'
import { tokens } from '@stake-dao/constants'

require('dotenv').config()

export const getSdtData = memoize(
  async () => {
    const prices = await getPrices(
      tokens.filter((t) => t.chainId === mainnet.id && (t.id === 'sdt' || t.id === 'frax3crv')),
      mainnet.id,
    )

    return fetchSdt({ provider: publicClient[mainnet.id], prices, explorerApiKey: process.env.ETHERSCAN_TOKEN as string })
  },
  { maxAge: MEMO_MAX_AGE },
)
