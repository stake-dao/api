import { Hono } from 'hono'
import { getCurve, getCurveArbitrum, getCurveMainnet } from './lib/strategies/curve'
import { getYearn, getYearnMainnet } from './lib/strategies/yearn'
import { getPancake, getPancakeArbitrum, getPancakeBsc, getPancakeMainnet } from './lib/strategies/pancakeswap'
import { getPendle, getPendleGaugeHolders, getPendleMainnet } from './lib/strategies/pendle'
import { getBalancer, getBalancerMainnet } from './lib/strategies/balancer'

const strategies = new Hono()

strategies.get('/', (c) => c.json('TODO ALL'))

////////////////////////////////////////////////////////////////
/// --- CURVE
///////////////////////////////////////////////////////////////

strategies.get('/curve', async (c) => {
  const data = await getCurve()
  return c.json(data)
})

strategies.get('/curve/1', async (c) => {
  const data = await getCurveMainnet()
  return c.json(data)
})

strategies.get('/curve/42161', async (c) => {
  const data = await getCurveArbitrum()
  return c.json(data)
})

////////////////////////////////////////////////////////////////
/// --- PANCAKESWAP
///////////////////////////////////////////////////////////////

strategies.get('/pancakeswap', async (c) => {
  const data = await getPancake()
  return c.json(data)
})

strategies.get('/pancakeswap/1', async (c) => {
  const data = await getPancakeMainnet()
  return c.json(data)
})

strategies.get('/pancakeswap/56', async (c) => {
  const data = await getPancakeBsc()
  return c.json(data)
})

strategies.get('/pancakeswap/42161', async (c) => {
  const data = await getPancakeArbitrum()
  return c.json(data)
})

////////////////////////////////////////////////////////////////
/// --- PENDLE
///////////////////////////////////////////////////////////////

strategies.get('/pendle', async (c) => {
  const data = await getPendle()
  return c.json(data)
})

strategies.get('/pendle/1', async (c) => {
  const data = await getPendleMainnet()
  return c.json(data)
})

strategies.get('/pendle/holders', async (c) => {
  const data = await getPendleGaugeHolders()
  return c.json(data)
})

////////////////////////////////////////////////////////////////
/// --- BALANCER
///////////////////////////////////////////////////////////////

strategies.get('/balancer', async (c) => {
  const data = await getBalancer()
  return c.json(data)
})

strategies.get('/balancer/1', async (c) => {
  const data = await getBalancerMainnet()
  return c.json(data)
})

////////////////////////////////////////////////////////////////
/// --- YEARN
///////////////////////////////////////////////////////////////

strategies.get('/yearn', async (c) => {
  const data = await getYearn()
  return c.json(data)
})

strategies.get('/yearn/1', async (c) => {
  const data = await getYearnMainnet()
  return c.json(data)
})

export default strategies
