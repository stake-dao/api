import { Hono } from 'hono'
import { getCurve, getCurveArbitrum, getCurveMainnet } from './lib/strategies/curve'
import { getYearn, getYearnMainnet } from './lib/strategies/yearn'
import { getPancake, getPancakeArbitrum, getPancakeBsc, getPancakeMainnet } from './lib/strategies/pancakeswap'
import { getPendle, getPendleGaugeHolders, getPendleMainnet } from './lib/strategies/pendle'
import { getBalancer, getBalancerMainnet } from './lib/strategies/balancer'
import {
  getGaugeData,
  getGaugeIds,
  getCurrentHoldersSnapshot,
  getHistoricalHoldersData,
  getHoldersForPeriod,
  getHolderAnalytics,
  getUserHistory,
} from './lib/strategies/pendleHolders'

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

// Main holders endpoint - returns all gauge holders data
strategies.get('/pendle/holders', async (c) => {
  const data = await getPendleGaugeHolders()
  return c.json(data)
})

// List all gauge IDs
strategies.get('/pendle/holders/gauges', async (c) => {
  const gaugeIds = await getGaugeIds()
  return c.json({
    total: gaugeIds.length,
    gauge_ids: gaugeIds,
  })
})

// Current holders snapshot
strategies.get('/pendle/holders/current', async (c) => {
  const data = await getCurrentHoldersSnapshot()
  if (!data) {
    return c.json({ error: 'Failed to fetch current holders data' }, 500)
  }
  return c.json(data)
})

// Historical holders data
strategies.get('/pendle/holders/historical', async (c) => {
  const gauge = c.req.query('gauge')
  const includeEvents = c.req.query('include_events') === 'true'

  const data = await getHistoricalHoldersData(gauge, includeEvents)
  return c.json(data)
})

// Period analysis
strategies.get('/pendle/holders/period', async (c) => {
  const startDate = c.req.query('start_date')
  const endDate = c.req.query('end_date')
  const gauge = c.req.query('gauge')
  const minDurationDays = c.req.query('min_duration_days')

  if (!startDate || !endDate) {
    return c.json({ error: 'start_date and end_date are required' }, 400)
  }

  const data = await getHoldersForPeriod(
    startDate,
    endDate,
    gauge,
    minDurationDays ? parseFloat(minDurationDays) : undefined,
  )

  return c.json(data)
})

// Holder analytics
strategies.get('/pendle/holders/analytics', async (c) => {
  const gauge = c.req.query('gauge')
  const data = await getHolderAnalytics(gauge)
  return c.json(data)
})

// User history across all gauges
strategies.get('/pendle/holders/user/:address', async (c) => {
  const address = c.req.param('address')
  const data = await getUserHistory(address)
  if (!data) {
    return c.json({ error: 'User not found' }, 404)
  }
  return c.json(data)
})

// Single gauge data - must be after other /pendle/holders/* routes
strategies.get('/pendle/holders/:gaugeId', async (c) => {
  const gaugeId = c.req.param('gaugeId')
  const data = await getGaugeData(gaugeId)
  if (!data) {
    return c.json({ error: 'Gauge not found' }, 404)
  }
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
