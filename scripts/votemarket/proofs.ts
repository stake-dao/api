import { Hono } from 'hono'
import { getProofs } from '../../src/lib/votemarket/proofs'

const proofsVM = new Hono()

const protocols = ['curve', 'balancer', 'frax', 'fxn']

protocols.forEach(protocol => {
  proofsVM.get(`/${protocol}`, async (c) => {
    const data = await getProofs(protocol)
    if (data) {
      return c.json(data)
    } else {
      return c.json({ error: `No proofs found for ${protocol}` }, 404)
    }
  })
})

export default proofsVM