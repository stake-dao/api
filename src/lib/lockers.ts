import { fetchLockers } from '@stake-dao/reader'
import memoize from 'memoizee'
import { bsc, mainnet } from 'viem/chains'
import { MEMO_MAX_AGE, getPrices, publicClient } from './utils'
import { tokens } from '@stake-dao/constants'

require('dotenv').config()

export const getLockersMainnet = memoize(
  async () => {
    const prices = await getPrices(
      tokens.filter((t) => t.chainId === mainnet.id),
      mainnet.id,
    )

    return fetchLockers({ provider: publicClient[mainnet.id], chainId: mainnet.id, prices })
  },
  { maxAge: MEMO_MAX_AGE },
)

export const getLockersBsc = memoize(
  async () => {
    const prices = await getPrices(
      tokens.filter((t) => t.chainId === bsc.id),
      bsc.id,
    )

    return fetchLockers({ provider: publicClient[bsc.id], chainId: bsc.id, prices })
  },
  { maxAge: MEMO_MAX_AGE },
)

export const getLockers = memoize(async () => {
  const [lockersMainnet, lockersBsc] = await Promise.all([getLockersMainnet(), getLockersBsc()])

  return {
    lastUpdate: Math.floor(Date.now() / 1000),
    parsed: [...lockersMainnet.parsed, ...lockersBsc.parsed].sort((a, b) => a.order - b.order),
    sdt: lockersMainnet.sdt,
    fetched: true,
  }
})
