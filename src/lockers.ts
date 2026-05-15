import { Hono } from 'hono'
import { getLockers } from './lib/lockers'

const lockers = new Hono()

lockers.get('/', async (c) => {
  const data = await getLockers()
  return c.json(data)
})

export default lockers
