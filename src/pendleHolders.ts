import { Hono } from 'hono'
import {
  getCurrentHoldersSnapshot,
  getHistoricalHoldersData,
  getHoldersForPeriod,
  getHolderAnalytics,
  getUserHistory,
  getGaugeSummary
} from './lib/strategies/pendleHolders'

const pendleHolders = new Hono()

// Root endpoint - returns summary
pendleHolders.get('/', async (c) => {
  const data = await getGaugeSummary()
  if (!data) {
    return c.json({ error: 'Failed to fetch gauge summary' }, 500)
  }
  return c.json(data)
})

// 1. Current Holders Snapshot
pendleHolders.get('/current', async (c) => {
  const data = await getCurrentHoldersSnapshot()
  if (!data) {
    return c.json({ error: 'Failed to fetch current holders data' }, 500)
  }
  return c.json(data)
})

// 2. Historical Holders Data
pendleHolders.get('/historical', async (c) => {
  const gauge = c.req.query('gauge')
  const token = c.req.query('token')
  const includeEvents = c.req.query('include_events') === 'true'
  
  const data = await getHistoricalHoldersData(gauge || token, includeEvents, !!token)
  if (!data) {
    return c.json({ error: 'Failed to fetch historical holders data' }, 500)
  }
  return c.json(data)
})

// 3. Period Analysis
pendleHolders.get('/period', async (c) => {
  const startDate = c.req.query('start_date')
  const endDate = c.req.query('end_date')
  const gauge = c.req.query('gauge')
  const token = c.req.query('token')
  const minDurationDays = c.req.query('min_duration_days')
  
  if (!startDate || !endDate) {
    return c.json({ error: 'start_date and end_date are required' }, 400)
  }
  
  const data = await getHoldersForPeriod(
    startDate, 
    endDate, 
    gauge || token, 
    minDurationDays ? parseFloat(minDurationDays) : undefined,
    !!token
  )
  
  if (!data) {
    return c.json({ error: 'Failed to fetch period holders data' }, 500)
  }
  return c.json(data)
})

// 4. Holder Analytics
pendleHolders.get('/analytics', async (c) => {
  const gauge = c.req.query('gauge')
  const token = c.req.query('token')
  
  const data = await getHolderAnalytics(gauge || token, !!token)
  if (!data) {
    return c.json({ error: 'Failed to fetch holder analytics' }, 500)
  }
  return c.json(data)
})

// 5. User History
pendleHolders.get('/user/:address', async (c) => {
  const address = c.req.param('address')
  
  const data = await getUserHistory(address)
  if (!data) {
    return c.json({ error: 'User not found' }, 404)
  }
  return c.json(data)
})

// 6. Gauge Summary
pendleHolders.get('/summary', async (c) => {
  const data = await getGaugeSummary()
  if (!data) {
    return c.json({ error: 'Failed to fetch gauge summary' }, 500)
  }
  return c.json(data)
})



export default pendleHolders