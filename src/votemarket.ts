import { Hono } from 'hono'
import { getProofs, getBlockData, getGaugeData, getUserData, getBlacklistData } from './lib/votemarket/proofs'

const proofsVM = new Hono()

const protocols = ['curve', 'balancer', 'frax', 'fxn']

function isValidPeriod(period: number): boolean {
  return !isNaN(period) && period > 0
}

protocols.forEach((protocol) => {
  // Get all proofs for a protocol
  proofsVM.get(`/:period/${protocol}`, async (c) => {
    const period = parseInt(c.req.param('period'))
    if (!isValidPeriod(period)) {
      return c.json({ error: `Invalid period: ${c.req.param('period')}` }, 400)
    }
    const data = await getProofs(protocol.toLowerCase(), period)
    if (data) {
      return c.json(data)
    } else {
      return c.json({ error: `No proofs found for ${protocol} in period ${period}` }, 404)
    }
  })

  // Get block info
  proofsVM.get(`/:period/block_info`, async (c) => {
    const period = parseInt(c.req.param('period'))
    if (!isValidPeriod(period)) {
      return c.json({ error: `Invalid period: ${c.req.param('period')}` }, 400)
    }
    const data = await getBlockData(period)
    if (data) {
      return c.json({
        block_number: data.block_header.BlockNumber,
        period: data.epoch,
      })
    } else {
      return c.json({ error: `No block info found for period ${period}` }, 404)
    }
  })

  // Get gauge controller proof
  proofsVM.get(`/:period/${protocol}/gauge_controller`, async (c) => {
    const period = parseInt(c.req.param('period'))
    if (!isValidPeriod(period)) {
      return c.json({ error: `Invalid period: ${c.req.param('period')}` }, 400)
    }
    const data = await getProofs(protocol.toLowerCase(), period)
    if (data) {
      return c.json({ gauge_controller_proof: data.gauge_controller_proof })
    } else {
      return c.json({ error: `No gauge controller proof found for ${protocol} in period ${period}` }, 404)
    }
  })

  // Get gauge proofs (point data proof + users)
  proofsVM.get(`/:period/${protocol}/:gauge`, async (c) => {
    const period = parseInt(c.req.param('period'))
    if (!isValidPeriod(period)) {
      return c.json({ error: `Invalid period: ${c.req.param('period')}` }, 400)
    }
    const gaugeAddress = c.req.param('gauge').toLowerCase()
    const data = await getProofs(protocol.toLowerCase(), period)
    if (data) {
      const gaugeData = getGaugeData(data, gaugeAddress)
      if (gaugeData) {
        return c.json({
          point_data_proof: gaugeData.point_data_proof,
          users: gaugeData.users
        })
      }
    }
    return c.json({ error: `No gauge info found for ${protocol}, gauge ${gaugeAddress} in period ${period}` }, 404)
  })

  // Get user info
  proofsVM.get(`/:period/${protocol}/:gauge/:user`, async (c) => {
    const period = parseInt(c.req.param('period'))
    if (!isValidPeriod(period)) {
      return c.json({ error: `Invalid period: ${c.req.param('period')}` }, 400)
    }
    const gaugeAddress = c.req.param('gauge').toLowerCase()
    const userAddress = c.req.param('user').toLowerCase()
    const data = await getProofs(protocol.toLowerCase(), period)
    if (data) {
      const userData = getUserData(data, gaugeAddress, userAddress)
      if (userData) {
        return c.json(userData)
      }
    }
    return c.json({ error: `No user info found for ${protocol}, gauge ${gaugeAddress}, user ${userAddress} in period ${period}` }, 404)
  })

  // Get blacklist
  proofsVM.get(`/:period/${protocol}/:gauge/blacklist`, async (c) => {
    const period = parseInt(c.req.param('period'))
    if (!isValidPeriod(period)) {
      return c.json({ error: `Invalid period: ${c.req.param('period')}` }, 400)
    }
    const gaugeAddress = c.req.param('gauge').toLowerCase()
    const data = await getProofs(protocol.toLowerCase(), period)
    if (data) {
      const blacklistData = getBlacklistData(data, gaugeAddress)
      if (blacklistData) {
        return c.json(blacklistData)
      }
    }
    return c.json({ error: `No blacklist found for ${protocol}, gauge ${gaugeAddress} in period ${period}` }, 404)
  })
})

export default proofsVM