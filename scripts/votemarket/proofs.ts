import { Hono } from 'hono'
import { getProofs } from '../../src/lib/votemarket/proofs'

const proofsVM = new Hono()

const protocols = ['curve', 'balancer', 'frax', 'fxn']

protocols.forEach(protocol => {
  // Get all proofs for a protocol
  proofsVM.get(`/:period/${protocol}`, async (c) => {
    const period = parseInt(c.req.param('period'))
    const data = await getProofs(protocol, period)
    if (data) {
      return c.json(data)
    } else {
      return c.json({ error: `No proofs found for ${protocol} in period ${period}` }, 404)
    }
  })

  // Get block info
  proofsVM.get(`/:period/${protocol}/block_info`, async (c) => {
    const period = parseInt(c.req.param('period'))
    const data = await getProofs(protocol, period)
    if (data) {
      return c.json({
        block_number: data.block_number,
        period: data.period
      })
    } else {
      return c.json({ error: `No block info found for ${protocol} in period ${period}` }, 404)
    }
  })

  // Get gauge controller proof
  proofsVM.get(`/:period/${protocol}/gauge_controller`, async (c) => {
    const period = parseInt(c.req.param('period'))
    const data = await getProofs(protocol, period)
    if (data && data.protocol.gauge_controller_proof) {
      return c.json({ gauge_controller_proof: data.protocol.gauge_controller_proof })
    } else {
      return c.json({ error: `No gauge controller proof found for ${protocol} in period ${period}` }, 404)
    }
  })

  // Get platform proofs
  proofsVM.get(`/:period/${protocol}/platform/:platformAddress`, async (c) => {
    const period = parseInt(c.req.param('period'))
    const platformAddress = c.req.param('platformAddress')
    const data = await getProofs(protocol, period)
    if (data && data.protocol.platforms[platformAddress]) {
      return c.json(data.protocol.platforms[platformAddress])
    } else {
      return c.json({ error: `No platform info found for ${protocol}, platform ${platformAddress} in period ${period}` }, 404)
    }
  })

  // Get gauge proofs
  proofsVM.get(`/:period/${protocol}/platform/:platformAddress/gauge/:gaugeAddress`, async (c) => {
    const period = parseInt(c.req.param('period'))
    const platformAddress = c.req.param('platformAddress')
    const gaugeAddress = c.req.param('gaugeAddress')
    const data = await getProofs(protocol, period)
    if (data && data.protocol.platforms[platformAddress]?.gauges[gaugeAddress]) {
      return c.json(data.protocol.platforms[platformAddress].gauges[gaugeAddress])
    } else {
      return c.json({ error: `No gauge info found for ${protocol}, platform ${platformAddress}, gauge ${gaugeAddress} in period ${period}` }, 404)
    }
  })

  // Get user info
  proofsVM.get(`/:period/${protocol}/platform/:platformAddress/gauge/:gaugeAddress/user/:userAddress`, async (c) => {
    const period = parseInt(c.req.param('period'))
    const platformAddress = c.req.param('platformAddress')
    const gaugeAddress = c.req.param('gaugeAddress')
    const userAddress = c.req.param('userAddress')
    const data = await getProofs(protocol, period)
    if (data && data.protocol.platforms[platformAddress]?.gauges[gaugeAddress]?.users[userAddress]) {
      return c.json(data.protocol.platforms[platformAddress].gauges[gaugeAddress].users[userAddress])
    } else {
      return c.json({ error: `No user info found for ${protocol}, platform ${platformAddress}, gauge ${gaugeAddress}, user ${userAddress} in period ${period}` }, 404)
    }
  })
})

export default proofsVM