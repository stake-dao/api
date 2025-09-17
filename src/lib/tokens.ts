import memoize from 'memoizee'
import { MEMO_MAX_AGE, STAKE_DAO_ASSETS_BASE_URL } from './utils'

require('dotenv').config()

export const getTokensMainnet = memoize(
  async () => (await fetch(`${STAKE_DAO_ASSETS_BASE_URL}/tokens/1.json`)).json(),
  { maxAge: MEMO_MAX_AGE },
)

export const getTokensBsc = memoize(async () => (await fetch(`${STAKE_DAO_ASSETS_BASE_URL}/tokens/56.json`)).json(), {
  maxAge: MEMO_MAX_AGE,
})

export const getTokensPolygon = memoize(
  async () => (await fetch(`${STAKE_DAO_ASSETS_BASE_URL}/tokens/137.json`)).json(),
  { maxAge: MEMO_MAX_AGE },
)

export const getTokensArbitrum = memoize(
  async () => (await fetch(`${STAKE_DAO_ASSETS_BASE_URL}/tokens/42161.json`)).json(),
  { maxAge: MEMO_MAX_AGE },
)

export const getTokensZksync = memoize(
  async () => (await fetch(`${STAKE_DAO_ASSETS_BASE_URL}/tokens/324.json`)).json(),
  { maxAge: MEMO_MAX_AGE },
)

export const getTokensBase = memoize(
  async () => (await fetch(`${STAKE_DAO_ASSETS_BASE_URL}/tokens/8453.json`)).json(),
  { maxAge: MEMO_MAX_AGE },
)

export const getTokensFantom = memoize(
  async () => (await fetch(`${STAKE_DAO_ASSETS_BASE_URL}/tokens/250.json`)).json(),
  { maxAge: MEMO_MAX_AGE },
)

export const getTokensFraxtal = memoize(
  async () => (await fetch(`${STAKE_DAO_ASSETS_BASE_URL}/tokens/252.json`)).json(),
  { maxAge: MEMO_MAX_AGE },
)

export const getTokensCelo = memoize(
  async () => (await fetch(`${STAKE_DAO_ASSETS_BASE_URL}/tokens/42220.json`)).json(),
  { maxAge: MEMO_MAX_AGE },
)

export const getTokensSonic = memoize(
  async () => (await fetch(`${STAKE_DAO_ASSETS_BASE_URL}/tokens/146.json`)).json(),
  { maxAge: MEMO_MAX_AGE },
)

export const getTokensGnosis = memoize(
  async () => (await fetch(`${STAKE_DAO_ASSETS_BASE_URL}/tokens/100.json`)).json(),
  { maxAge: MEMO_MAX_AGE },
)

export const getTokensOptimism = memoize(
  async () => (await fetch(`${STAKE_DAO_ASSETS_BASE_URL}/tokens/10.json`)).json(),
  { maxAge: MEMO_MAX_AGE },
)

export const getTokensAvalanche = memoize(
  async () => (await fetch(`${STAKE_DAO_ASSETS_BASE_URL}/tokens/43114.json`)).json(),
  { maxAge: MEMO_MAX_AGE },
)

export const getTokensLinea = memoize(
  async () => (await fetch(`${STAKE_DAO_ASSETS_BASE_URL}/tokens/59144.json`)).json(),
  { maxAge: MEMO_MAX_AGE },
)

export const getTokens = memoize(async () => {
  const tokens = await Promise.all([
    getTokensMainnet(),
    getTokensBsc(),
    getTokensPolygon(),
    getTokensArbitrum(),
    getTokensZksync(),
    getTokensBase(),
    getTokensFantom(),
    getTokensFraxtal(),
    getTokensCelo(),
    getTokensSonic(),
    getTokensGnosis(),
    getTokensOptimism(),
    getTokensAvalanche(),
    getTokensLinea(),
  ])

  return tokens.flat()
})
