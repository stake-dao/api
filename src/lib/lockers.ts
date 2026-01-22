import { fetchLockers } from '@stake-dao/reader'
import memoize from 'memoizee'
import { base, bsc, fraxtal, linea, mainnet } from 'viem/chains'
import { MEMO_MAX_AGE, getPrices, publicClient } from './utils'
import { tokens } from '@stake-dao/constants'
import { createPublicClient, http } from 'viem'
import { RPC } from './constants'

require('dotenv').config()

export const getLockers = memoize(
  async () => {
    const pricesPromises = await Promise.all(
      [mainnet.id, bsc.id, base.id, linea.id, fraxtal.id].map((chainId) =>
        getPrices(
          tokens.filter((t) => t.chainId === chainId),
          chainId,
        ),
      ),
    )

    const lockers = await fetchLockers({
      prices: pricesPromises.flat(),
      provider: {
        [mainnet.id]: createPublicClient({ chain: mainnet, transport: http(RPC[mainnet.id]) }),
        [bsc.id]: createPublicClient({ chain: bsc, transport: http(RPC[bsc.id]) }),
        [base.id]: createPublicClient({ chain: base, transport: http(RPC[base.id]) }),
        [linea.id]: createPublicClient({ chain: linea, transport: http(RPC[linea.id]) }),
        [fraxtal.id]: createPublicClient({ chain: fraxtal, transport: http(RPC[fraxtal.id]) }),
      },
    })

    return {
      lastUpdate: Math.floor(Date.now() / 1000),
      parsed: lockers.parsed,
      sdt: lockers.sdt,
      fetched: true,
    }
  },
  { maxAge: MEMO_MAX_AGE },
)
