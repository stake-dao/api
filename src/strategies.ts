import { Hono } from 'hono'
import { getCurve, getCurveArbitrum, getCurveMainnet } from './lib/strategies/curve'
import { getYearn, getYearnMainnet } from './lib/strategies/yearn'

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
