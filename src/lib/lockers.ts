import { fetchLockers } from '@stake-dao/reader'
import memoize from 'memoizee'
import { base, bsc, fraxtal, linea, mainnet } from 'viem/chains'
import { MEMO_MAX_AGE } from './utils'
import { createPublicClient, http } from 'viem'
import { RPC } from './constants'

require('dotenv').config()

export const getLockers = memoize(
  async () => {
    const prices = await fetch("https://data-hub.contact-69d.workers.dev/v1/prices").then(res => res.json())

    const lockers = await fetchLockers({
      rpc: RPC,
      prices,
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
