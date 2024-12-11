import { Hono } from 'hono'
import { getBlockData, getGaugeData, getUserData, getListedUsersData, getProtocolData } from './lib/votemarket/proofs'

const proofsVM = new Hono()

const protocols = ['curve', 'balancer', 'frax', 'fxn']

function isValidPeriod(period: number): boolean {
  return !isNaN(period) && period > 0
}

function isValidProtocol(protocol: string): boolean {
  return protocols.includes(protocol.toLowerCase())
}

////////////////////////////////////////////////////////////////
/// --- ALL DATA
////////////////////////////////////////////////////////////////

proofsVM.get('/:period/:protocol', async (c) => {
  const period = parseInt(c.req.param('period'))
  const protocol = c.req.param('protocol').toLowerCase()

  if (!isValidPeriod(period)) {
    return c.json({ error: `Invalid period: ${c.req.param('period')}` }, 400)
  }
  if (!isValidProtocol(protocol)) {
    return c.json({ error: `Invalid protocol: ${protocol}` }, 400)
  }

  const data = await getProtocolData(protocol, period)
  if (data) {
    return c.json(data)
  } else {
    return c.json({ error: `No proofs found for ${protocol} in period ${period}` }, 404)
  }
})

////////////////////////////////////////////////////////////////
/// --- BLOCK DATA + GAUGE CONTROLLER DATA
////////////////////////////////////////////////////////////////

proofsVM.get('/:period/:protocol/header', async (c) => {
  const period = parseInt(c.req.param('period'))
  const protocol = c.req.param('protocol').toLowerCase()

  if (!isValidPeriod(period)) {
    return c.json({ error: `Invalid period: ${c.req.param('period')}` }, 400)
  }
  if (!isValidProtocol(protocol)) {
    return c.json({ error: `Invalid protocol: ${protocol}` }, 400)
  }

  const blockData = await getBlockData(protocol, period)
  const gaugeControllerData = await getProtocolData(protocol, period)
  if (blockData?.rlp_block_header) {
    return c.json({ block_data: blockData, gauge_controller_proof: gaugeControllerData?.gauge_controller_proof })
  } else {
    return c.json({ error: `No block info found for ${protocol} in period ${period}` }, 404)
  }
})


////////////////////////////////////////////////////////////////
/// --- GAUGE DATA
////////////////////////////////////////////////////////////////

proofsVM.get('/:period/:protocol/:chainId/:platform/:gauge', async (c) => {
  const period = parseInt(c.req.param('period'))
  const protocol = c.req.param('protocol').toLowerCase()
  const chainId = c.req.param('chainId').toLowerCase()
  const platform = c.req.param('platform').toLowerCase()
  const gaugeAddress = c.req.param('gauge').toLowerCase()

  if (!isValidPeriod(period)) {
    return c.json({ error: `Invalid period: ${c.req.param('period')}` }, 400)
  }
  if (!isValidProtocol(protocol)) {
    return c.json({ error: `Invalid protocol: ${protocol}` }, 400)
  }

  const data = await getGaugeData(protocol, period, chainId, platform, gaugeAddress)
  if (data) {
    return c.json({ point_data_proof: data.point_data_proof })
  }
  return c.json({ error: `No gauge info found for ${protocol}, gauge ${gaugeAddress} in period ${period}` }, 404)
})

////////////////////////////////////////////////////////////////
/// --- USERS DATA
////////////////////////////////////////////////////////////////

proofsVM.get('/:period/:protocol/:chainId/:platform/:gauge/:user', async (c) => {
  const period = parseInt(c.req.param('period'))
  const protocol = c.req.param('protocol').toLowerCase()
  const chainId = c.req.param('chainId').toLowerCase()
  const platform = c.req.param('platform').toLowerCase()
  const gaugeAddress = c.req.param('gauge').toLowerCase()
  const userOrListedUsers = c.req.param('user').toLowerCase()

  if (!isValidPeriod(period)) {
    return c.json({ error: `Invalid period: ${c.req.param('period')}` }, 400)
  }
  if (!isValidProtocol(protocol)) {
    return c.json({ error: `Invalid protocol: ${protocol}` }, 400)
  }

  const gaugeData = await getGaugeData(protocol, period, chainId, platform, gaugeAddress)
  if (!gaugeData) {
    return c.json({ error: `No data found for ${protocol}, gauge ${gaugeAddress} in period ${period}` }, 404)
  }

  if (userOrListedUsers === 'listed_users') {
    const listedUsersData = getListedUsersData(gaugeData)
    if (listedUsersData) {
      return c.json({ listed_users: listedUsersData })
    }
    return c.json(
      { error: `No listed users found for ${protocol}, gauge ${gaugeAddress} in period ${period}` },
      404,
    )
  } else {
    const userData = await getUserData(gaugeData, userOrListedUsers)
    if (userData) {
      return c.json(userData)
    }
    return c.json(
      {
        error: `No user info found for ${protocol}, gauge ${gaugeAddress}, user ${userOrListedUsers} in period ${period}`,
      },
      404,
    )
  }
})

export default proofsVM
