import { fetchLockers } from '@stake-dao/reader'
import memoize from 'memoizee'
import { base, bsc, fraxtal, linea, mainnet } from 'viem/chains'
import { MEMO_MAX_AGE, getPrices, publicClient } from './utils'
import { tokens } from '@stake-dao/constants'
import { createPublicClient, http } from 'viem'
import { RPC } from './constants'

require('dotenv').config()

export const getLockersMainnet = memoize(
  async () => {
    const prices = await getPrices(
      tokens.filter((t) => t.chainId === mainnet.id),
      mainnet.id,
    )

    const provider = createPublicClient({
      chain: mainnet,
      transport: http(RPC[mainnet.id]),
    })

    return fetchLockers({ provider, chainId: mainnet.id, prices })
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

export const getLockersBase = memoize(
  async () => {
    const prices = await getPrices(
      tokens.filter((t) => t.chainId === base.id),
      base.id,
    )

    return fetchLockers({ provider: publicClient[base.id], chainId: base.id, prices })
  },
  { maxAge: MEMO_MAX_AGE },
)

export const getLockersFraxtal = memoize(
  async () => {
    const prices = await getPrices(
      tokens.filter((t) => t.chainId === fraxtal.id),
      fraxtal.id,
    )
    const fxsMainnetPrice = await getPrices(
      tokens.filter((t) => t.chainId === mainnet.id && t.id === 'fxs'),
      mainnet.id,
    )

    return fetchLockers({
      provider: publicClient[fraxtal.id],
      chainId: fraxtal.id,
      prices: [...prices, ...fxsMainnetPrice],
    })
  },
  { maxAge: MEMO_MAX_AGE },
)

export const getLockersLinea = memoize(
  async () => {
    const prices = await getPrices(
      tokens.filter((t) => t.chainId === linea.id),
      linea.id,
    )

    return fetchLockers({
      provider: publicClient[linea.id],
      chainId: linea.id,
      prices,
    })
  },
  { maxAge: MEMO_MAX_AGE },
)

export const getLockers = memoize(async () => {
  const [lockersMainnet, lockersBsc, lockersFraxtal, lockersBase, lockersLinea] = await Promise.all([
    getLockersMainnet(),
    getLockersBsc(),
    getLockersFraxtal(),
    getLockersBase(),
    getLockersLinea(),
  ])

  return {
    lastUpdate: Math.floor(Date.now() / 1000),
    parsed: [
      ...lockersMainnet.parsed,
      ...lockersBsc.parsed,
      ...lockersFraxtal.parsed,
      ...lockersBase.parsed,
      ...lockersLinea.parsed,
    ].sort((a, b) => a.order - b.order),
    sdt: lockersMainnet.sdt,
    fetched: true,
  }
})
