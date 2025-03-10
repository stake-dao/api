import { Hono } from 'hono'
import { getLockers, getLockersBsc, getLockersFraxtal, getLockersMainnet } from './lib/lockers'
import { bsc, fraxtal, mainnet } from 'viem/chains'

const lockers = new Hono()

lockers.get('/', async (c) => {
  const data = await getLockers()
  return c.json(data)
})

////////////////////////////////////////////////////////////////
/// --- MAINNET
///////////////////////////////////////////////////////////////

lockers.get(`/${mainnet.id}`, async (c) => {
  const data = await getLockersMainnet()
  return c.json(data)
})

////////////////////////////////////////////////////////////////
/// --- BNB CHAIN
///////////////////////////////////////////////////////////////

lockers.get(`/${bsc.id}`, async (c) => {
  const data = await getLockersBsc()
  return c.json(data)
})

////////////////////////////////////////////////////////////////
/// --- FRAXTAL
///////////////////////////////////////////////////////////////

lockers.get(`/${fraxtal.id}`, async (c) => {
  const data = await getLockersFraxtal()
  return c.json(data)
})

export default lockers
