import { Hono } from 'hono'
import { bsc, mainnet, polygon, arbitrum, zkSync, base } from 'viem/chains'
import { getTokens, getTokensArbitrum, getTokensBase, getTokensBsc, getTokensMainnet, getTokensZksync } from './lib/tokens'

const tokens = new Hono()

tokens.get('/', async (c) => {
  const data = await getTokens()
  return c.json(data)
})

tokens.get(`/${mainnet.id}`, async (c) => {
  const data = await getTokensMainnet()
  return c.json(data)
})

tokens.get(`/${bsc.id}`, async (c) => {
  const data = await getTokensBsc()
  return c.json(data)
})

tokens.get(`/${polygon.id}`, async (c) => {
  const data = await getTokensBsc()
  return c.json(data)
})

tokens.get(`/${arbitrum.id}`, async (c) => {
  const data = await getTokensArbitrum()
  return c.json(data)
})

tokens.get(`/${zkSync.id}`, async (c) => {
  const data = await getTokensZksync()
  return c.json(data)
})

tokens.get(`/${base.id}`, async (c) => {
  const data = await getTokensBase()
  return c.json(data)
})

export default tokens
